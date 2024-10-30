"use client";

import { atom, useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useGetTgApiFolders } from "@/services/telegram/queries";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { useTelegram } from "@/services";
import { useLastWorkspaceId } from "@/app/(main)/_component/main-layout";
import { fetchChatsInFolder } from "@/services/telegram/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { prepareFoldersSyncPayload } from "./filterArrayByIds";
import { toast } from "sonner";

const syncFoldersDialogOpen = atom(false);
export const useSyncFoldersDialogOpen = () => useAtom(syncFoldersDialogOpen);

const SyncFoldersDialog = () => {
  const utils = api.useUtils();
  const tg = useTelegram();
  const queryClient = useQueryClient();
  const [workspaceId] = useLastWorkspaceId();
  const [isOpen, setIsOpen] = useSyncFoldersDialogOpen();
  const [selectedFolders, setSelectedFolders] = useState<number[]>([]);
  const { data: workspace } = api.workspaces.getWorkspace.useQuery(
    {
      workspaceId: workspaceId ?? "",
    },
    {
      enabled: !!workspaceId,
    },
  );

  useQuery({
    queryKey: ["synFoldersQuery", workspaceId],
    queryFn: () => handleSyncFolders(false),
    enabled: !!workspaceId && !!tg?.custom?.proxy && selectedFolders.length > 0,
  });

  useEffect(() => {
    const syncedFolders = workspace?.workspaceUsers[0]?.syncedFolders;
    if (syncedFolders) {
      setSelectedFolders(syncedFolders.map(Number) ?? []);
    }
  }, [workspace?.workspaceUsers]);

  const syncFoldersMutation = api.workspaces.syncFolders.useMutation({
    onSuccess(data, variables) {
      setSelectedFolders([]);
      if (!variables.silent) toast.success("Folders synced successfully");
      void utils.workspaces.getWorkspace.invalidate();
      setIsOpen(false);
    },
    onError(error) {
      toast.error("Failed to sync folders", {
        description: error.message,
      });
    },
    onSettled() {
      void utils.workspaces.getWorkspace.invalidate();
    },
  });

  const {
    data: folders,
    isLoading,
    error,
  } = useGetTgApiFolders({
    enabled: isOpen,
  });

  const handleSyncFolders = async (silent = false) => {
    if (!tg?.custom?.proxy || !workspaceId) {
      // throw new Error("WorkspaceId or Telegram Proxy is undefined");
      toast.error("WorkspaceId or Telegram Proxy is undefined");
      console.log("WORKSPACE ID", workspaceId, tg?.custom?.proxy);

      return;
    }

    if (selectedFolders.length === 0) {
      toast.error("No folders selected");
      return;
    }

    const foldersSelectedArray = Array.from(selectedFolders);

    const chatPromises = foldersSelectedArray.map((folderId) =>
      fetchChatsInFolder(queryClient, tg.custom, folderId),
    );

    const payload = await prepareFoldersSyncPayload({
      foldersArray: foldersSelectedArray,
      promises: chatPromises,
    });

    syncFoldersMutation.mutate({
      workspaceId: workspaceId,
      folders: payload,
      silent,
    });

    return payload;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync folders</DialogTitle>
          <DialogDescription>
            Sync your Telegram chats with DISE by choosing folders that you want
            to track.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <Skeleton className="h-[56px] w-full rounded-lg" />}
        {error && <p className="text-red-500">Error: {error.message}</p>}
        {folders?.list && (
          <div className="m-auto flex w-full flex-col gap-0 rounded-lg border border-border bg-gray-100 dark:bg-neutral-900">
            {folders?.list.map((folder) => (
              <div
                onClick={() => {
                  setSelectedFolders((prev) => {
                    if (prev.includes(folder.id)) {
                      return prev.filter((id) => id !== folder.id);
                    }
                    return [...prev, folder.id];
                  });
                }}
                key={folder.id}
                className="flex cursor-pointer items-center gap-4 border-b border-border px-6 py-4 transition-all first:rounded-t-lg last:rounded-b-lg last:border-b-0 hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <Checkbox checked={selectedFolders.includes(folder.id)} />
                <p className="text-sm text-muted-foreground">
                  {folder.title}
                  <span className="ml-1 opacity-50">
                    ({folder.includedChatIds?.length})
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={() => void handleSyncFolders(false)}>
            Sync with DISE
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SyncFoldersDialog;

// const syncChatsMutation = () => {}
