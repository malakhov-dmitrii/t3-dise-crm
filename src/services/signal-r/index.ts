"use client";

import { createSignalRContext } from "./context";
export { LogLevel } from "@microsoft/signalr";
export type { ILogger } from "@microsoft/signalr";
export * from "./constants";

const {
  useSignalREffect,
  Provider: SignalRProvider,
  invoke,
} = createSignalRContext();

export { useSignalREffect, SignalRProvider, invoke };
