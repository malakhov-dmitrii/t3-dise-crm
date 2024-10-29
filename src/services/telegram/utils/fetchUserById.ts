import { QueryClient } from "@tanstack/react-query";
import { TelegramWindowContextType } from "../context";
import { sixHoursInMilliseconds } from "@/constants/utils";

export const fetchUserById = async (
  queryClient: QueryClient,
  tg: TelegramWindowContextType,
  userId: number,
) => {
  const getUserById = async () => {
    try {
      const res = await tg.custom.proxy.getUserById(userId);

      if (!res) {
        throw new Error("user full information is missing");
      }

      return res;
    } catch (error) {
      console.log("getUserById error: ", error);
      throw error;
    }
  };

  return queryClient.fetchQuery({
    queryKey: ["tg-api-user-by-id", userId],
    queryFn: getUserById,
    retryDelay: 1000,
    retry(failureCount) {
      if (failureCount >= 3) {
        console.error(`fetchUserById - no user by id ${userId} data found`);
        return false;
      }
      return true;
    },
    staleTime: sixHoursInMilliseconds,
  });
};
