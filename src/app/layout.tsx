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
            <TelegramWindowProvider>
              <GlobalProviders session={session}>{children}</GlobalProviders>
            </TelegramWindowProvider>
          </TRPCReactProvider>
          <Toaster position="top-center" />
          <TailwindIndicator />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
