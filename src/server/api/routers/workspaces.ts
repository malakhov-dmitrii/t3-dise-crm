import { users, workspaces } from "@/server/db/schema";
import { protectedProcedure } from "../trpc";

import { createTRPCRouter } from "../trpc";
import { eq } from "drizzle-orm";
import { z } from "zod";

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

      return workspace[0]!;
    }),
});
