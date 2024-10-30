import { QueryClient } from "@tanstack/react-query";
import { Requester } from "jsonrpc-iframe";
import { Custom } from "../types";
import { toast } from "sonner";

export const fetchChatsInFolder = async (
  queryClient: QueryClient,
  custom: Requester<Custom>,
  folderId: number,
) => {
  const getChatsInFolder = async () => {
    try {
      const res = await custom.proxy.getChatsInTheFolder(folderId);

      if (!res) {
        throw new Error(`No chats found in folder ${folderId}`);
      }

      return res;
    } catch (error) {
      console.log("getChatsInFolder error: ", error);
      throw error;
    }
  };

  return queryClient.fetchQuery({
    queryKey: ["tg-api-chats-in-folder", folderId],
    queryFn: getChatsInFolder,
    retryDelay: 1000,
    retry(failureCount) {
      if (failureCount >= 5) {
        toast.error("Failed to load chats from empty folder");
        console.error(
          `fetchChatsInFolder - no chats found in folder ${folderId}`,
        );
        return false;
      }
      return true;
    },
  });
};
