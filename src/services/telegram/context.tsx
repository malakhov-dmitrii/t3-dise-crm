"use client";

import React, { PropsWithChildren, useState, useRef, useEffect } from "react";
import { Requester, Responder } from "jsonrpc-iframe";
import { useDebounceCallback, useInterval } from "usehooks-ts";
import { Actions, Methods, Custom, Events } from "./types";
import { TG_CONFIG } from "./config";
import { cn } from "@/lib/utils";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export type TelegramWindowContextType = {
  actions: Requester<Actions>;
  methods: Requester<Methods>;
  custom: Requester<Custom>;
  events: Responder<Events>;
  iframe: HTMLIFrameElement;
  status: Requester<{ check: () => Promise<boolean> }>;
};

const getArgs = (window: Window) => {
  if (!window || typeof window === "undefined") {
    return undefined;
  }

  try {
    const origin = TG_CONFIG.TG_FRAME_ORIGIN;
    const actions = new Requester<Actions>("actions", window, origin);
    const methods = new Requester<Methods>("methods", window, origin);
    const custom = new Requester<Custom>("custom", window, origin);
    const events = new Responder<Events>("events", origin);
    const status = new Requester<{ check: VoidFunction }>(
      "status",
      window,
      origin,
    );

    return {
      actions,
      methods,
      custom,
      events,
      iframe: window,
      status,
    };
  } catch (error) {
    console.error("Failed to initialize Telegram window:", error);
    return undefined;
  }
};

const iframeOpenAtom = atom(false);
export const useIframeOpen = () => useAtom(iframeOpenAtom);

const iframeClassNameAtom = atom("");
export const useIframeClassName = () => useAtom(iframeClassNameAtom);

const tgConnectedAtom = atomWithStorage<boolean | undefined>(
  "tgConnected",
  undefined,
);
export const useTgConnected = () => useAtom(tgConnectedAtom);

const tgUserIdAtom = atomWithStorage<string | undefined>("tgUserId", undefined);
export const useTgUserId = () => useAtom(tgUserIdAtom);

export const TelegramWindowContext = React.createContext<
  TelegramWindowContextType | undefined
>(undefined);

export const TelegramWindowProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const router = useRouter();
  const [tgConnected, setTgConnected] = useTgConnected();
  const [tgUserId, setTgUserId] = useTgUserId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [args, setArgs] = useState<TelegramWindowContextType | undefined>(
    undefined,
  );
  const [iframeOpen, setIframeOpen] = useAtom(iframeOpenAtom);
  const [iframeClassName] = useAtom(iframeClassNameAtom);

  const [frameReady, setFrameReady] = useState(false);

  useInterval(
    () => {
      if (!iframeRef.current?.contentWindow || args) {
        return;
      }

      setArgs(getArgs(iframeRef.current.contentWindow));
    },
    args ? null : 200,
  );

  const checkStatus = async () => {
    console.log("check", args);
    if (!args) return;

    void args?.status.proxy.check().then((res) => {
      console.log("connected", { res });
      setTgConnected(true);
    });
  };

  useInterval(
    () => {
      void checkStatus();
    },
    tgConnected ? null : 1000,
  );

  const debouncedToast = useDebounceCallback(toast.success, 1000);

  useEffect(() => {
    if (!frameReady || !args?.events) return;

    const unLogout = args?.events.subscribe("loggedOut", () => {
      console.log("loggedOut");
      setTgUserId(undefined);
      setTgConnected(false);

      void router.push("/login");
    });

    const unAuth = args?.events.subscribe("authStateChanged", (state) => {
      // console.log("authStateChanged", state);
      if (state.authed && state.userId && !tgUserId && !tgConnected) {
        setTgUserId(state.userId);
        setTgConnected(true);
        setIframeOpen(false);
        debouncedToast("Telegram connected");
      }
    });

    const unSync = args?.events.subscribe("syncStateChanged", (state) => {
      console.log("syncStateChanged", state);
      setTgConnected(state.isSynced);
    });

    const all = args?.events.subscribeUniversal((event, data) => {
      if (event !== "authStateChanged" && event !== "loggedIn") {
        console.log("NEW EVENT:", event, data);
      }
    });

    return () => {
      unLogout?.();
      unAuth?.();
      unSync?.();
      all?.();
    };
  }, [args?.events, frameReady]);

  return (
    <TelegramWindowContext.Provider value={args}>
      {children}

      <div
        id="tg-iframe-holder"
        className={cn(
          "fixed top-4 z-50 h-[calc(100vh-36px)] w-[400px] overflow-hidden rounded-lg shadow transition-all",
          iframeOpen ? "right-4 opacity-100" : "right-[-430px] opacity-0",
          iframeClassName,
        )}
      >
        <iframe
          id="telegram-iframe"
          height="100%"
          width="100%"
          allow="clipboard-read; clipboard-write"
          ref={iframeRef}
          onLoad={() => setFrameReady(true)}
          src={buildTelegramIframeUrl(TG_CONFIG.TG_IFRAME_URL, "")}
        ></iframe>
      </div>
    </TelegramWindowContext.Provider>
  );
};

const buildTelegramIframeUrl = (iframeUrl: string, branch?: string) => {
  const url = new URL(iframeUrl);
  if (branch) {
    url.searchParams.set("branch", branch);
  }
  return url.toString();
};

export function useTelegram() {
  const context = React.useContext(TelegramWindowContext);
  return context;
}
