"use client";

import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIframeOpen } from "@/services";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [iframeOpen] = useIframeOpen();

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center justify-between px-4 pb-0 pt-4">
          <SidebarTrigger />
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 p-4 transition-all",
            !iframeOpen ? "w-full" : "w-[calc(100%-420px)]",
          )}
        >
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
