"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import {
  useIframeOpen,
  useTelegram,
  useTgConnected,
  useTgUserId,
} from "@/services";
import Link from "next/link";

export default function AuthPage() {
  const [, setIframeOpen] = useIframeOpen();
  const [tgConnected] = useTgConnected();
  const [tgUserId] = useTgUserId();

  const secondDisabled = !tgConnected || !tgUserId;
  return (
    <div className="flex flex-col items-center justify-center">
      <Icons.logo />

      <div className="mt-8 flex w-full max-w-sm flex-col gap-4 rounded-lg bg-card p-4 shadow">
        <p className="text-center text-2xl font-semibold">Sign In</p>

        <div className="mt-4 flex items-center gap-2">
          <p className="w-20 whitespace-nowrap text-center text-sm text-muted-foreground">
            Step 1
          </p>
          <Button
            disabled={tgConnected && !!tgUserId}
            loading={tgConnected === undefined}
            onClick={() => {
              setIframeOpen(true);
              // tg?.actions.proxy.loadFullUser().then((r) => {
              //   console.log("LOADED USER", r);
              // });
            }}
            variant="outline"
            className="w-full"
          >
            Connect Telegram
          </Button>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <p className="w-20 whitespace-nowrap text-center text-sm text-muted-foreground">
            Step 2
          </p>
          <Link
            href="/"
            aria-disabled={secondDisabled}
            className={cn(
              buttonVariants(),
              "w-full",
              secondDisabled &&
                "pointer-events-none cursor-not-allowed opacity-50",
            )}
          >
            Go to Dashboard
          </Link>
        </div>

        <p className="mt-2 text-center text-sm text-muted-foreground">
          By using DISE, you agree to the Terms of Service and Data Processing
          Agreement
        </p>
      </div>
    </div>
  );
}
