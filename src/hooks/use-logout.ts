import { useTelegram, useTgConnected, useTgUserId } from "@/services";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

const useLogout = () => {
  const tg = useTelegram();
  const [, setTgUserId] = useTgUserId();
  const [, setTgConnected] = useTgConnected();

  return async () => {
    if (!tg) {
      toast.error("Telegram is not connected", {
        description: "Please connect Telegram to continue",
      });
      return;
    }

    setTgUserId(undefined);
    setTgConnected(false);

    void tg.actions.proxy.signOut({
      forceInitApi: true,
    });

    await signOut();
  };
};

export default useLogout;
