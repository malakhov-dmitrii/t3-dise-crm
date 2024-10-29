import { QueryClient } from "@tanstack/react-query";
import { TelegramWindowContextType } from "../context";
import { ApiChatType } from "../../../types";

type Payload = {
  queryClient: QueryClient;
  tg: TelegramWindowContextType;
  chatId: number;
  type: ApiChatType;
  title?: string;
  accessHash?: string;
};

export const fetchTgFullChat = async ({
  queryClient,
  tg,
  chatId,
  type,
  title,
  accessHash,
}: Payload) => {
  const getTgChatFullData = async () => {
    try {
      const res = await tg.methods.proxy.fetchFullChat({
        id: chatId.toString(),
        // @ts-expect-error - TODO: fix this
        type,
        title: title ?? "",
        accessHash,
      });

      if (!res) {
        throw new Error("chat full information is missing");
      }

      return res;
    } catch (error) {
      console.log("getTgChatFullData error: ", error);
      throw error;
    }
  };

  return queryClient.fetchQuery({
    queryKey: ["tg-api-full-chat-info", chatId],
    queryFn: getTgChatFullData,
    retryDelay: 1000,
    retry(failureCount) {
      if (failureCount >= 5) {
        console.error(`fetchTgFullChat - no chat ${chatId} full data found`);
        return false;
      }
      return true;
    },
  });
};
