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
import { Separator } from "../ui/separator";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

const selectWorkspaceDialogOpen = atom(false);
export const useSelectWorkspaceDialogOpen = () =>
  useAtom(selectWorkspaceDialogOpen);

const SelectWorkspaceDialog = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useSelectWorkspaceDialogOpen();
  const { data: workspaces } = api.workspaces.listWorkspaces.useQuery();

  return (
    <Dialog open={isOpen}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle className="text-center">Select a workspace</DialogTitle>
        </DialogHeader>

        <div className="m-auto mt-6 flex w-full max-w-xs flex-col gap-0 rounded-lg border border-border bg-gray-100">
          {workspaces?.map((workspace) => (
            <div
              onClick={() => {
                setIsOpen(false);
                void router.push(`/${workspace.id}`);
              }}
              key={workspace.id}
              className="flex cursor-pointer items-center gap-4 border-b border-border px-6 py-4 transition-all first:rounded-t-lg last:rounded-b-lg last:border-b-0 hover:bg-gray-200"
            >
              <div className="h-4 w-4 rounded-sm bg-slate-300"></div>
              <p className="text-sm text-muted-foreground">{workspace.name}</p>
            </div>
          ))}
        </div>

        <Button className="m-auto mt-6 w-fit" size="sm" variant="outline">
          Create a workspace
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SelectWorkspaceDialog;
