import { fetchChatFolders } from "@/services/telegram/telegram-api";
import { Methods } from "@/services/telegram/types";
import { useQuery } from "@tanstack/react-query";
import { Requester } from "jsonrpc-iframe";
import { toast } from "sonner";

// export const useGetTgApiFolders = (
//   methods?: Requester<Methods>,
//   isEnabled?: boolean,
// ) =>
//   useQuery({
//     queryKey: ["tg-api-folders"],
//     queryFn: () => {
//       if (!methods) {
//         throw new Error("methods not provided");
//       }
//       return fetchChatFolders(methods);
//     },
//     retryDelay: 1000,
//     retry(failureCount) {
//       if (failureCount >= 5) {
//         toast.error("Sync failed", {
//           description:
//             "Telegram has not fully synchronized folders and chats on its side yet. Please try again later.",
//         });
//         return false;
//       }
//       return true;
//     },
//     refetchOnWindowFocus: false,
//     enabled: !!methods && isEnabled,
//   });
