import "@/styles/globals.css";

import { Inter as FontSans } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { TailwindIndicator } from "@/components/utils/tailwind-indicator";
import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { TelegramWindowProvider } from "@/services";
import { GlobalProviders } from "@/components/utils/global-providers";
import { getServerAuthSession } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";
import { ThemeProvider } from "@/components/utils/theme-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Dise CRM",
  description: "Dise CRM",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  const session = await getServerAuthSession();

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextIntlClientProvider messages={messages}>
          <TRPCReactProvider>
            <ThemeProvider attribute="class" defaultTheme="system">
              <TelegramWindowProvider>
                <HydrateClient>
                  <GlobalProviders session={session}>
                    {children}
                    <ReactQueryDevtools />
                  </GlobalProviders>
                </HydrateClient>
              </TelegramWindowProvider>
            </ThemeProvider>
          </TRPCReactProvider>
          <Toaster position="top-center" />
          <TailwindIndicator />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
