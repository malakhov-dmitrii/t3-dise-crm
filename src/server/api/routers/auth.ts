import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { verificationTokens } from "@/server/db/schema";
import dayjs from "dayjs";

const nanoid = customAlphabet("0123456789", 6);

export const authRouter = createTRPCRouter({
  getOtp: publicProcedure
    .input(
      z.object({
        telegramUserId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const otp = nanoid();
      await ctx.db.insert(verificationTokens).values({
        expires: dayjs().add(1, "minutes").toDate(),
        identifier: input.telegramUserId.toString(),
        token: otp,
        verified: false,
      });

      console.log("OTP Created", otp);

      return { otp };
    }),
});
