"use client";

import { cn } from "@/lib/utils";
import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIframeOpen } from "@/services";
import CreateWorkspaceDialog from "@/components/dialogs/create-workspace-dialog";
import SelectWorkspaceDialog from "@/components/dialogs/select-workspace-dialog";
import SyncFoldersDialog from "@/components/dialogs/sync-folders-dialog/sync-folders-dialog";
import TeamInvitesDialog from "@/components/dialogs/team-invites-dialog";
import useOnboarding from "@/hooks/useOnboarding";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const lastWorkspaceId = atomWithStorage<string | null>("lastWorkspaceId", null);
export const useLastWorkspaceId = () => useAtom(lastWorkspaceId);

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useOnboarding();

  const router = useRouter();
  const [lastWorkspaceId] = useLastWorkspaceId();

  useEffect(() => {
    if (lastWorkspaceId) {
      router.replace(`/${lastWorkspaceId}`);
    }
  }, [lastWorkspaceId, router]);

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

        <CreateWorkspaceDialog />
        <SelectWorkspaceDialog />
        <SyncFoldersDialog />
        <TeamInvitesDialog />
      </main>
    </SidebarProvider>
  );
}
