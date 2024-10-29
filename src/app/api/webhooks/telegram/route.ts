import { and, eq } from "drizzle-orm";
import { type Context } from "telegraf";
import { db } from "@/server/db";
import { users, verificationTokens } from "@/server/db/schema";
import { bot } from "./telegram";
import { getBaseUrl } from "@/lib/utils";
import dayjs from "dayjs";

const SECRET_HASH = "32e58fbahey833349df3383dc910e181";

bot.on("message", async (ctx) => {
  // echo the message
  await checkChatId(ctx);
  if ("text" in ctx.message) {
    if (ctx.message.text.startsWith("/start")) {
      const otpCode = ctx.message.text.split(" ")[1];

      if (!otpCode) {
        await ctx.reply(
          `Hello ${ctx.from.first_name}!
  
  I'm a bot that helps you manage your account.`,
        );
        return;
      }

      const code = await db.query.verificationTokens.findFirst({
        where: and(
          eq(verificationTokens.token, otpCode),
          eq(verificationTokens.verified, false),
          eq(verificationTokens.identifier, ctx.from.id.toString()),
        ),
      });

      if (!code) {
        // await ctx.reply("Could not verify your OTP code.");
        console.log("OTP Code not found", otpCode);
        return;
      }

      const codeExpires = dayjs(code.expires);

      if (codeExpires.isBefore(dayjs())) {
        // await ctx.reply("Your OTP code has expired.");
        console.log(
          "OTP Code expired",
          codeExpires.toISOString(),
          dayjs().toISOString(),
        );
        return;
      }

      await db
        .update(verificationTokens)
        .set({
          verified: true,
        })
        .where(eq(verificationTokens.identifier, code.identifier));

      //   await ctx.reply("You're in, welcome!");
    }

    // await ctx.reply("I don't know what to do with this message");
  } else {
    // await ctx.reply("I don't know what to do with this message (no text)");

    // TODO: log the whole json for future debug
    console.log("Received message", ctx.update);
  }
});

// bot.on("inline_query", async (ctx) => {
//   const searchResults = await searchClient.search([
//     {
//       indexName: "bot_index",
//       params: {
//         query: processWords(ctx.inlineQuery.query),
//       },
//     },
//   ]);

//   await sendInlineQueryResults(
//     ctx,
//     // @ts-expect-error types
//     searchResults.results.flatMap((r) => {
//       if ("hits" in r) {
//         return r.hits;
//       }
//       return [];
//     }),
//   );
// });

// bot.on("callback_query", async (ctx) => {
//   await ctx.answerCbQuery("👍");

//   const { data } = ctx.update.callback_query as { data: string };
//   const [type, id] = data.split(":") as [string, string];

//   /**
//    * Here we would handle the callback query
//    */

//   await ctx.editMessageReplyMarkup({
//     inline_keyboard: [],
//   });
// });

// bot.on("pre_checkout_query", async (ctx) => {
//   await ctx.answerPreCheckoutQuery(true);
// });

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const setWebhook = searchParams.get("setWebhook");

  if (setWebhook === "true") {
    const webhookUrl = `${getBaseUrl()}/api/webhooks/telegram?secret_hash=${SECRET_HASH}`;
    console.log("Setting webhook to", webhookUrl);
    await bot.telegram.setWebhook(webhookUrl, {
      drop_pending_updates: true,
    });
  }

  const hookInfo = await bot.telegram.getWebhookInfo();
  return Response.json({
    ...hookInfo,
    url: hookInfo.url?.replace(SECRET_HASH, "SECRET_HASH"),
  });
};

export const POST = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const secretHash = searchParams.get("secret_hash");

  if (secretHash !== SECRET_HASH) {
    return new Response("Unauthorized", { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await bot.handleUpdate(body);

  return new Response("OK");
};
async function checkChatId(ctx: Context) {
  const chatId = ctx.chat?.id;
  const userId = ctx.from?.id;

  if (!chatId || !userId) {
    return;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.telegramUserId, userId.toString()),
  });

  if (!user) {
    await db.insert(users).values({
      email: "",
      firstName: ctx.from.first_name,
      lastName: ctx.from.last_name,
      telegramUserId: userId.toString(),
      chatId: chatId.toString(),
      telegramUsername: ctx.from.username,
    });
  } else {
    if (user.chatId !== chatId.toString()) {
      await db
        .update(users)
        .set({
          chatId: chatId.toString(),
        })
        .where(eq(users.id, user.id));
    }
  }
}
