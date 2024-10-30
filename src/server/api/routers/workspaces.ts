import {
  users,
  workspaceChats,
  workspacePipelines,
  workspacePipelineStages,
  workspaces,
  workspaceUsers,
} from "@/server/db/schema";
import { protectedProcedure } from "../trpc";

import { createTRPCRouter } from "../trpc";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { truncate } from "@/lib/utils";

const defaultPipelineStages = ["New Lead", "Qualified Lead", "Negotiation"];

export const workspacesRouter = createTRPCRouter({
  listWorkspaces: protectedProcedure.query(async ({ ctx }) => {
    const userWorkspaces = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session?.id),
      with: {
        workspaces: true,
      },
    });

    return userWorkspaces?.workspaces;
  }),

  getWorkspace: protectedProcedure
    .input(z.object({ workspaceId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, input.workspaceId),
        with: {
          workspacePipelines: {
            with: { workspacePipelineStages: true },
          },
          workspaceUsers: true,
          workspaceChats: {
            orderBy: (workspaceChats, { desc }) => [
              desc(workspaceChats.lastMessageAt),
            ],
          },
        },
      });
    }),

  createWorkspace: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        picture: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const workspace = await ctx.db
        .insert(workspaces)
        .values({
          adminId: ctx.session?.id,
          name: input.name,
          thumbnailUrl: input.picture,
        })
        .returning();

      await ctx.db.insert(workspaceUsers).values({
        workspaceId: workspace[0]!.id,
        userId: ctx.session?.id,
      });

      const pipeline = await ctx.db
        .insert(workspacePipelines)
        .values({
          workspaceId: workspace[0]!.id,
          name: "Default Pipeline",
        })
        .returning();

      await ctx.db.insert(workspacePipelineStages).values(
        defaultPipelineStages.map((stage, i) => ({
          workspacePipelineId: pipeline[0]!.id,
          name: stage,
          order: i,
        })),
      );

      return workspace[0]!;
    }),

  syncFolders: protectedProcedure
    .input(
      z.object({
        silent: z.boolean().optional(), // only to show toast on client
        workspaceId: z.string(),
        folders: z.array(
          z.object({
            telegramFolderId: z.number().optional(),
            chats: z.array(
              z.object({
                telegramChatId: z.number(),
                name: z.string(),
                type: z.string(),
                lastMessageAt: z.number(),
                lastMessage: z.string(),
              }),
            ),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { workspaceId, folders } = input;

      const workspace = await ctx.db.query.workspaces.findFirst({
        where: eq(workspaces.id, workspaceId),
        with: {
          workspaceUsers: true,
          workspacePipelines: { with: { workspacePipelineStages: true } },
        },
      });

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });
      }
      if (
        !workspace.workspaceUsers.find(
          (user) => user.userId === ctx.session?.id,
        )
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to sync this workspace",
        });
      }

      const pipeline = workspace.workspacePipelines[0]!;
      const firstStage = pipeline.workspacePipelineStages.sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      )[0]!;

      const chats = folders.flatMap((folder) => folder.chats);

      const existingChats = await ctx.db.query.workspaceChats.findMany({
        where: inArray(
          workspaceChats.telegramChatId,
          chats.map((chat) => chat.telegramChatId.toString()),
        ),
      });

      // Insert new chats
      const newChats = chats
        .filter(
          (chat) =>
            !existingChats.find(
              (c) =>
                c.telegramChatId.toString() === chat.telegramChatId.toString(),
            ),
        )
        .map((chat) => ({
          telegramChatId: chat.telegramChatId.toString(),
          workspaceId,
          name: chat.name,
          pipelineStageId: firstStage.id,
          pipelineId: pipeline.id,
          type: chat.type,
          lastMessageAt: new Date(chat.lastMessageAt * 1000),
          createdBy: ctx.session?.id,
          updatedBy: ctx.session?.id,
          lastMessage: chat.lastMessage,
        }));

      if (newChats.length > 0) {
        await ctx.db.insert(workspaceChats).values(newChats);
      }

      // Update existing chats
      for (const chat of existingChats) {
        const chatData = chats.find(
          (c) => c.telegramChatId.toString() === chat.telegramChatId.toString(),
        );

        const lastMessage = truncate(
          chatData?.lastMessage ?? chat.lastMessage ?? "",
        );
        await ctx.db
          .update(workspaceChats)
          .set({
            name: chatData?.name,
            type: chatData?.type,
            updatedBy: ctx.session?.id,
            updatedAt: new Date(),
            lastMessageAt: chatData?.lastMessageAt
              ? new Date(chatData.lastMessageAt * 1000)
              : chat.lastMessageAt,
            lastMessage: lastMessage,
          })
          .where(eq(workspaceChats.id, chat.id));
      }

      await ctx.db
        .update(workspaceUsers)
        .set({
          syncedFolders: [
            ...input.folders
              .filter((i) => i.telegramFolderId)
              .map((i) => i.telegramFolderId!.toString()),
          ],
        })
        .where(eq(workspaceUsers.workspaceId, workspaceId));
    }),

  updateChatStage: protectedProcedure
    .input(
      z.object({
        chatId: z.string(),
        pipelineStageId: z.string(),
        workspaceId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, pipelineStageId, workspaceId } = input;

      // Verify user has access to this workspace
      const workspace = await ctx.db.query.workspaces.findFirst({
        where: (workspaces, { eq }) => eq(workspaces.id, workspaceId),
        with: {
          workspaceUsers: {
            where: (wu, { eq }) => eq(wu.userId, ctx.session.id),
          },
        },
      });

      if (!workspace || workspace.workspaceUsers.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this workspace",
        });
      }

      // Update the chat's pipeline stage
      return await ctx.db
        .update(workspaceChats)
        .set({ pipelineStageId })
        .where(eq(workspaceChats.id, chatId));
    }),
});
