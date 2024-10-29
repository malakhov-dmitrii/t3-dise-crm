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

const teamInvitesDialogOpen = atom(false);
export const useTeamInvitesDialogOpen = () => useAtom(teamInvitesDialogOpen);

const TeamInvitesDialog = () => {
  const [isOpen, setIsOpen] = useTeamInvitesDialogOpen();
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite team members</DialogTitle>
          <DialogDescription>
            Invite team members to start managing your pipelines.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TeamInvitesDialog;
