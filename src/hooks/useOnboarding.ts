"use client";

import { useCreateWorkspaceDialogOpen } from "@/components/dialogs/create-workspace-dialog";
import { useSelectWorkspaceDialogOpen } from "@/components/dialogs/select-workspace-dialog";
import { useSyncFoldersDialogOpen } from "@/components/dialogs/sync-folders-dialog/sync-folders-dialog";
import { useTeamInvitesDialogOpen } from "@/components/dialogs/team-invites-dialog";
import { api } from "@/trpc/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const useOnboarding = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useCreateWorkspaceDialogOpen();
  const [isSyncFoldersOpen, setIsSyncFoldersOpen] = useSyncFoldersDialogOpen();
  const [isTeamInvitesOpen, setIsTeamInvitesOpen] = useTeamInvitesDialogOpen();
  const [selectWorkspaceOpen, setSelectWorkspaceOpen] =
    useSelectWorkspaceDialogOpen();

  const workspacesQuery = api.workspaces.listWorkspaces.useQuery();

  useEffect(() => {
    if (workspacesQuery.data?.length === 0) {
      setIsOpen(true);
    }

    if (workspacesQuery.data?.length === 1 && pathname === "/") {
      console.log("Single workspace available");

      const workspace = workspacesQuery.data?.[0];
      if (workspace) {
        void router.push(`/${workspace.id}`);
      } else {
        setSelectWorkspaceOpen(true);
      }
    }

    if (
      workspacesQuery.data?.length &&
      workspacesQuery.data?.length > 1 &&
      pathname === "/"
    ) {
      setSelectWorkspaceOpen(true);
    }
  }, [workspacesQuery.data]);

  return {
    workspaces: workspacesQuery.data,
  };
};

export default useOnboarding;
