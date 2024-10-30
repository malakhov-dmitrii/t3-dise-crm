"use client";

import { atom, useAtom } from "jotai";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Separator } from "../ui/separator";
import { api } from "@/trpc/react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Skeleton } from "../ui/skeleton";

const selectWorkspaceDialogOpen = atom(false);
export const useSelectWorkspaceDialogOpen = () =>
  useAtom(selectWorkspaceDialogOpen);

const SelectWorkspaceDialog = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useSelectWorkspaceDialogOpen();
  const { data: workspaces, isLoading } =
    api.workspaces.listWorkspaces.useQuery();

  return (
    <Dialog open={isOpen}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Select a workspace</DialogTitle>
          <DialogDescription>
            Organize your chats with workspaces.
          </DialogDescription>
        </DialogHeader>

        {isLoading && <Skeleton className="h-[56px] w-full rounded-lg" />}
        {workspaces && (
          <div className="m-auto flex w-full flex-col gap-0 rounded-lg border border-border bg-gray-100 dark:bg-neutral-900">
            {workspaces?.map((workspace) => (
              <div
                onClick={() => {
                  setIsOpen(false);
                  void router.push(`/${workspace.id}`);
                }}
                key={workspace.id}
                className="flex cursor-pointer items-center gap-4 border-b border-border px-6 py-4 transition-all first:rounded-t-lg last:rounded-b-lg last:border-b-0 hover:bg-gray-200 dark:hover:bg-neutral-800"
              >
                <div className="h-4 w-4 rounded-sm bg-slate-300"></div>
                <p className="text-sm text-muted-foreground">
                  {workspace.name}
                </p>
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline">Create a workspace</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SelectWorkspaceDialog;
