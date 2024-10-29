import { QueryClient } from "@tanstack/react-query";
import { TelegramWindowContextType } from "../context";
import { sixHoursInMilliseconds } from "@/constants/utils";
export const fetchTgUser = async (
  queryClient: QueryClient,
  tg: TelegramWindowContextType,
  userId: number,
) => {
  const getUserData = async () => {
    try {
      const userShortInfo = await tg.custom.proxy.getUserById(userId);

      if (!userShortInfo) {
        throw new Error("user information is missing");
      }

      if (
        !userShortInfo.userFullInfo &&
        userShortInfo.userShortInfo?.accessHash
      ) {
        const userFullInfo = await tg.methods.proxy.fetchFullUser({
          id: userId.toString(),
          accessHash: userShortInfo.userShortInfo?.accessHash,
        });

        if (userFullInfo) {
          return {
            userShortInfo: userFullInfo.user,
            userFullInfo: userFullInfo.fullInfo,
          };
        }
      }

      return userShortInfo;
    } catch (error) {
      console.log("getUserData error: ", error);
      throw error;
    }
  };

  return queryClient.fetchQuery({
    queryKey: ["tg-api-user-info", userId],
    queryFn: getUserData,
    retryDelay: 1000,
    retry(failureCount) {
      if (failureCount >= 3) {
        console.error(`fetchTgUser - no user ${userId} data found`);
        return false;
      }
      return true;
    },
    staleTime: sixHoursInMilliseconds,
  });
};
