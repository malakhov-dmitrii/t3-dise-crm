import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  setLocale: protectedProcedure
    .input(z.object({ locale: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await ctx.db
        .update(users)
        .set({ language: input.locale })
        .where(eq(users.id, ctx.session.id));
    }),
  getUser: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.id),
    });
  }),
});
