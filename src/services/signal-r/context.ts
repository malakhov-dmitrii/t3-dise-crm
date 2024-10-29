/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { HubConnectionState } from "@microsoft/signalr";
import hermes from "hermes-channel";
import { removeDuplicates, sendWithHermes } from "./utils";
import { createUseSignalREffect } from "./hooks";
import { providerFactory } from "./provider";
import { Context, Hub } from "./types";
import { v4 as uuid } from "uuid";
import { providerNativeFactory } from "./provider/providerNativeFactory";

const SIGNAL_R_INVOKE = "SIGNAL_R_INVOKE";
function createSignalRContext<T extends Hub>(options?: {
  shareConnectionBetweenTab?: boolean;
}) {
  const events: T["callbacksName"][] = [];
  const context: Context<T> = {
    connection: null,
    useSignalREffect: null as never, // Assigned after context
    shareConnectionBetweenTab: options?.shareConnectionBetweenTab ?? false,
    invoke: (methodName: string, ...args: unknown[]) => {
      const SIGNAL_R_RESPONSE = uuid();
      sendWithHermes(
        SIGNAL_R_INVOKE,
        { methodName, args, callbackResponse: SIGNAL_R_RESPONSE },
        context.shareConnectionBetweenTab,
      );
      return new Promise((resolve) => {
        hermes.on(SIGNAL_R_RESPONSE, (data) => {
          resolve(data);
        });
      });
    },
    Provider: null as never, // just for ts ignore
    on: (event: string) => {
      if (!events.includes(event)) {
        context.connection?.on(event, (...message: unknown[]) => {
          sendWithHermes(event, message, context.shareConnectionBetweenTab);
        });
      }
      events.push(event);
    },
    off: (event: string) => {
      if (events.includes(event)) {
        events.splice(events.indexOf(event), 1);
      }

      if (!events.includes(event)) {
        context.connection?.off(event);
      }
    },

    reOn: () => {
      const uniqueEvents = removeDuplicates(events);

      uniqueEvents.forEach((event) => {
        context.connection?.on(event, (...message: unknown[]) => {
          sendWithHermes(event, message, context.shareConnectionBetweenTab);
        });
      });
    },
  };

  // @ts-expect-error ignore
  context.Provider = context.shareConnectionBetweenTab
    ? providerFactory(context)
    : providerNativeFactory(context);

  async function invoke(data: {
    methodName: string;
    args: unknown[];
    callbackResponse: string;
  }) {
    try {
      const response = await context.connection?.invoke(
        data.methodName,
        ...data.args,
      );
      sendWithHermes(
        data.callbackResponse,
        response,
        context.shareConnectionBetweenTab,
      );
    } catch (error) {
      console.log(error, "invoke error");
    }
  }

  context.useSignalREffect = createUseSignalREffect(context);

  hermes.on(SIGNAL_R_INVOKE, (data) => {
    if (context.connection?.state === HubConnectionState.Connected) {
      void invoke(data);
    }
  });

  return context;
}

export { createSignalRContext };
