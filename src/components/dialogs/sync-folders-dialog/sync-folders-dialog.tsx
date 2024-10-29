"use client";

import { atom, useAtom } from "jotai";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { useGetTgApiFolders } from "@/services/telegram/queries";

const syncFoldersDialogOpen = atom(false);
export const useSyncFoldersDialogOpen = () => useAtom(syncFoldersDialogOpen);

const SyncFoldersDialog = () => {
  const [isOpen, setIsOpen] = useSyncFoldersDialogOpen();
  const { data: folders, isLoading, isError } = useGetTgApiFolders();

  console.log(folders);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync folders</DialogTitle>
          <DialogDescription>
            Sync folders to start managing your pipelines.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {folders?.list.map((folder) => (
            <div key={folder.id}>{folder.title}</div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncFoldersDialog;
