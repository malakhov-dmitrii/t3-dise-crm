import { fetchChatFolders } from "../telegram-api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTelegram, useTgConnected } from "../context";

export const useGetTgApiFolders = () => {
  const tg = useTelegram();
  const methods = tg?.methods;
  const [isTgConnected] = useTgConnected();

  return useQuery({
    queryKey: ["tg-api-folders"],
    queryFn: () => {
      if (!methods) throw new Error("methods not provided");

      return fetchChatFolders(methods);
    },
    retryDelay: 1000,
    retry(failureCount) {
      if (failureCount >= 5) {
        toast.error("Sync failed", {
          description:
            "Telegram has not fully synchronized folders and chats on its side yet. Please try again later.",
        });
        return false;
      }
      return true;
    },
    refetchOnWindowFocus: false,
    enabled: !!methods && isTgConnected,
  });
};
