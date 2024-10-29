import { Telegraf } from "telegraf";
import { env } from "@/env";

// const CHATS = {
//   ADMIN: -1002226632669,
//   NOTIFICATIONS: -1002400964414,
// };

export const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);
// export const notificationsBot = new Telegraf(
//   env.NOTIFICATIONS_TELEGRAM_BOT_TOKEN,
// );

// export const notifyAdmins = async (
//   message: string,
//   chat: keyof typeof CHATS = "ADMIN",
// ) => {
//   await notificationsBot.telegram.sendMessage(CHATS[chat], message, {
//     parse_mode: "Markdown",
//   });
// };
