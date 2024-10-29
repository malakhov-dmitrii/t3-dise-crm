"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useIframeOpen,
  useTelegram,
  useTgConnected,
  useTgUserId,
} from "@/services";
import { api } from "@/trpc/react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import useLogout from "@/hooks/use-logout";

const BOT_USERNAME = "task_extractor_bot";

const errorMessages = {
  Configuration:
    "There is a problem with the server configuration. Check if your options are correct.",
  AccessDenied:
    "Access restricted. You don't have permission to access this resource.",
  Verification:
    "Error with email verification. The token has expired or has already been used",

  OAuthSignin:
    "Error with 3rd party authentication provider. Please, try again",
  OAuthCallback:
    "Error in handling the response 3rd party authentication provider. Please, try again",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth handler. Please, try again",
  OAuthAccountNotLinked:
    "Email on the account is already linked, but not with this OAuth account. Please, sign in with account you previously used and try again.",
  EmailSignin: "Sending the e-mail with the verification token failed",
  CredentialsSignin:
    "Could not find user with given credentials. Please, try again.",
  SessionRequired:
    "The content of this page requires you to be signed in at all times. Please, sign in and try again.",
};

export default function AuthPage({
  searchParams: { error },
}: {
  searchParams: { error: keyof typeof errorMessages };
}) {
  const [tgRowRef] = useAutoAnimate();
  const [cardRef] = useAutoAnimate();
  const tg = useTelegram();
  const [, setIframeOpen] = useIframeOpen();
  const [tgConnected] = useTgConnected();
  const [tgUserId] = useTgUserId();
  const logout = useLogout();

  const errorMessage = error ? errorMessages[error] : null;

  const otpMutation = api.auth.getOtp.useMutation({
    onError: (error) => {
      toast.error("Failed to get OTP", {
        description: error.message,
      });
    },
  });

  const secondDisabled = !tgConnected || !tgUserId;

  const handleLogin = async () => {
    if (!tgUserId) return;

    const { otp } = await otpMutation.mutateAsync({
      telegramUserId: Number(tgUserId),
    });

    if (!otp) return;

    await tg?.actions.proxy.openChatByUsername({
      username: BOT_USERNAME,
      startParam: otp,
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));

    await signIn("telegram-otp", {
      otp,
      telegramUserId: Number(tgUserId),
      redirect: true,
      callbackUrl: "/",
    });
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Icons.logo />

      <div
        className="mt-8 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-card p-4 shadow"
        ref={cardRef}
      >
        <p className="text-center text-2xl font-semibold">Sign In</p>

        <div className="mt-4 flex items-center gap-2" ref={tgRowRef}>
          <p className="w-20 flex-shrink-0 whitespace-nowrap text-center text-sm text-muted-foreground">
            Step 1
          </p>
          <Button
            disabled={tgConnected && !!tgUserId}
            loading={tgConnected === undefined}
            onClick={() => {
              setIframeOpen(true);
            }}
            variant="outline"
            className="w-full"
          >
            Connect Telegram
          </Button>
          {/* {tgConnected && !!tgUserId && (
            )} */}
          <Button variant="outline" className="w-10" onClick={logout}>
            <ReloadIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <p className="w-20 flex-shrink-0 whitespace-nowrap text-center text-sm text-muted-foreground">
            Step 2
          </p>
          <Button
            disabled={secondDisabled}
            onClick={handleLogin}
            className={cn(
              buttonVariants(),
              "w-full",
              secondDisabled &&
                "pointer-events-none cursor-not-allowed opacity-50",
            )}
          >
            Go to Dashboard
          </Button>
        </div>
        {errorMessage && (
          <p className="mt-2 text-center text-xs text-red-500">
            {errorMessage}
          </p>
        )}

        <p className="mt-2 text-center text-xs text-muted-foreground">
          By using DISE, you agree to the Terms of Service and Data Processing
          Agreement
        </p>
      </div>
    </div>
  );
}
