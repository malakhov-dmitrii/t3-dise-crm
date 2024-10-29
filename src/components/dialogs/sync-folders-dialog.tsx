"use client";

import { atom, useAtom } from "jotai";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

const syncFoldersDialogOpen = atom(false);
export const useSyncFoldersDialogOpen = () => useAtom(syncFoldersDialogOpen);

const SyncFoldersDialog = () => {
  const [isOpen, setIsOpen] = useSyncFoldersDialogOpen();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sync folders</DialogTitle>
          <DialogDescription>
            Sync folders to start managing your pipelines.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SyncFoldersDialog;
