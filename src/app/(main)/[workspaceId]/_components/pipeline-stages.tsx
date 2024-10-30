"use client";

import React from "react";
import { api } from "@/trpc/react";
import ChatItem from "./chat-item";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const PipelineStages = ({ workspaceId }: { workspaceId: string }) => {
  const { data: workspace } = api.workspaces.getWorkspace.useQuery({
    workspaceId,
  });

  const pipeline = workspace?.workspacePipelines[0];
  const pipelineStages = pipeline?.workspacePipelineStages;

  return (
    <>
      {pipelineStages?.map((stage) => {
        const chats = workspace?.workspaceChats.filter(
          (chat) => chat.pipelineStageId === stage.id,
        );
        return (
          <ScrollArea
            key={stage.id}
            className="h-full max-h-[calc(100vh-5rem)] w-72 flex-shrink-0 overflow-y-auto border-r border-border px-4 last:border-r-0"
          >
            <div className="sticky top-0 -mx-4 bg-white px-4 py-4 shadow-sm dark:bg-neutral-900">
              <p className="w-fit rounded-full bg-muted px-4 py-1 text-xs font-medium text-muted-foreground">
                {stage.name}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {chats?.map((chat) => <ChatItem key={chat.id} chat={chat} />)}
            </div>
            <ScrollBar />
          </ScrollArea>
        );
      })}
    </>
  );
};

export default PipelineStages;
