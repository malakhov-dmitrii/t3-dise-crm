import { useTelegram } from "@/services";
import { toast } from "sonner";

const useLogout = () => {
  const tg = useTelegram();

  return async () => {
    if (!tg) {
      toast.error("Telegram is not connected", {
        description: "Please connect Telegram to continue",
      });
      return;
    }

    await tg.actions.proxy.signOut({
      forceInitApi: true,
    });
  };
};

export default useLogout;
