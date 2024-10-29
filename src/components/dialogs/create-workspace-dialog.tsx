"use client";

import { atom, useAtom } from "jotai";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Image from "next/image";
import { Upload } from "lucide-react";
import { Separator } from "../ui/separator";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useLastWorkspaceId } from "@/app/(main)/_component/main-layout";
import { useRouter } from "next/navigation";

const createWorkspaceDialogOpen = atom(false);
export const useCreateWorkspaceDialogOpen = () =>
  useAtom(createWorkspaceDialogOpen);

const CreateWorkspaceDialog = () => {
  const router = useRouter();
  const utils = api.useUtils();
  const [isOpen, setIsOpen] = useCreateWorkspaceDialogOpen();
  const [workspaceName, setWorkspaceName] = useState("");

  const { data: workspaces } = api.workspaces.listWorkspaces.useQuery();

  const { mutate: createWorkspace, isPending } =
    api.workspaces.createWorkspace.useMutation({
      onSuccess: (data) => {
        setIsOpen(false);
        toast.success("Workspace created successfully");
        router.push(`/${data.id}`);
      },
      onError: (err) => {
        toast.error("Failed to create workspace", { description: err.message });
      },
      onSettled: () => {
        void utils.workspaces.listWorkspaces.invalidate();
      },
    });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (workspaceName.trim().length < 3) {
      toast.error("Workspace name is required");
      return;
    }

    createWorkspace({ name: workspaceName });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        return workspaces?.length === 0 ? undefined : setIsOpen(open);
      }}
    >
      <DialogContent hideCloseButton={workspaces?.length === 0}>
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
          <DialogDescription>
            A shared environment where you will be able to manage your customer
            relations with your team.
          </DialogDescription>
        </DialogHeader>

        <Separator />
        <form onSubmit={handleSubmit}>
          <Label htmlFor="picture">Thumbnail</Label>

          <div className="mt-2 flex items-start gap-4">
            <div className="flex h-20 min-w-20 items-center justify-center rounded-md border border-dashed">
              <Upload className="h-4 w-4" />
            </div>

            <div className="flex flex-col gap-2">
              <Input disabled id="picture" type="file" />
              <p className="text-xs text-muted-foreground">
                We support your best PNGs, JPEGs and GIFs portraits under 10MB
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor="workspace-name">Workspace name</Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              type="text"
              placeholder="Acme Inc."
            />
            <p className="text-xs text-muted-foreground">
              This name will be used to identify your workspace and prefix your
              chats.
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button
              loading={isPending}
              disabled={workspaceName.trim().length < 3}
              type="submit"
            >
              Continue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceDialog;
