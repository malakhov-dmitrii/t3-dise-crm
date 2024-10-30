import { DrizzleAdapter } from "@auth/drizzle-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/env";
import { db } from "@/server/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import dayjs from "dayjs";
import { Maybe } from "@trpc/server/unstable-core-do-not-import";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    id: string;
    telegramUserId: number;
    firstName: string;
    lastName: string;
    email: Maybe<string>;
    language: string;
    // ...other properties
    // role: UserRole;
    expires: Date;
    user: DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      return { ...token, ...user };
    },

    session: ({ token }) => {
      return {
        id: token.id as string,
        telegramUserId: token.telegramUserId as number,
        firstName: token.firstName as string,
        lastName: token.lastName as string,
        email: null,
        expires: new Date(token.exp as number),
        user: undefined,
        language: token.language as string,
      };
    },
  },
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }) as Adapter,
  providers: [
    CredentialsProvider({
      name: "Telegram OTP",
      id: "telegram-otp",
      credentials: {
        otp: { label: "OTP", type: "text" },
        telegramUserId: { label: "Telegram User ID", type: "number" },
      },
      authorize: async (credentials) => {
        const { otp, telegramUserId } = credentials ?? {};
        if (!otp || !telegramUserId) return null;

        const code = await db.query.verificationTokens.findFirst({
          where: and(
            eq(verificationTokens.token, otp),
            eq(verificationTokens.identifier, telegramUserId.toString()),
          ),
        });

        console.log("Code found", code);

        if (!code) return null;
        if (code.verified) return null;

        const codeExpires = dayjs(code.expires);
        if (codeExpires.isBefore(dayjs())) return null;

        console.log("Code is valid, upserting user");

        const user = await upsertUser(+telegramUserId);

        if (!user) return null;

        await db
          .delete(verificationTokens)
          .where(eq(verificationTokens.token, otp));

        return {
          id: user.id,
          telegramUserId: user.telegramUserId,
          firstName: user.firstName,
          lastName: user.lastName,
          language: user.language,
        };
      },
      type: "credentials",
    }),

    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],

  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login",
    signOut: "/login",
    newUser: "/",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);

const upsertUser = async (telegramUserId: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.telegramUserId, telegramUserId.toString()),
  });

  if (user) return user;

  return (
    await db
      .insert(users)
      .values({ telegramUserId: telegramUserId.toString(), email: "" })
      .returning()
  )[0];
};
