"use client";

import React, { useRef, useState } from "react";
import { api } from "@/trpc/react";
import ChatItem from "./chat-item";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  DragOverlay,
  closestCenter,
  DragStartEvent,
} from "@dnd-kit/core";
import { type ChatItem as ChatItemType } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useIframeOpen, useTelegram } from "@/services";

const PipelineStages = ({ workspaceId }: { workspaceId: string }) => {
  const [parent] = useAutoAnimate();

  const tg = useTelegram();
  const [iframeOpen, setIframeOpen] = useIframeOpen();

  const dragStartTimestamp = useRef<number | undefined>();
  const [activeChat, setActiveChat] = useState<ChatItemType | null>(null);
  const { data: workspace } = api.workspaces.getWorkspace.useQuery({
    workspaceId,
  });
  const utils = api.useUtils();

  const updateChatStage = api.workspaces.updateChatStage.useMutation({
    onSuccess: (data, variables) => {
      void utils.workspaces.getWorkspace.invalidate({ workspaceId });

      // Make an optimistic update
      utils.workspaces.getWorkspace.setData({ workspaceId }, (prev) => {
        if (!prev) return prev;
        const chat = prev.workspaceChats.find((c) => c.id === variables.chatId);
        if (!chat) return prev;
        chat.pipelineStageId = variables.pipelineStageId;
        return prev;
      });
    },
    onError: (error) => {
      toast.error("Failed to update chat stage", {
        description: error.message,
      });
    },
  });

  const pipeline = workspace?.workspacePipelines[0];
  const pipelineStages = pipeline?.workspacePipelineStages;

  const handleDragStart = (event: DragStartEvent) => {
    dragStartTimestamp.current = Date.now();
    const chat = workspace?.workspaceChats.find(
      (c) => c.id === event.active.id,
    );
    if (chat) setActiveChat(chat);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const dragDuration = Date.now() - (dragStartTimestamp.current ?? 0);
    console.log("DRAG DURATION ", dragDuration);

    if (dragDuration < 300) {
      void tg?.actions.proxy.openChat({
        id: activeChat?.telegramChatId.toString() ?? "",
      });
      setIframeOpen(true);
    }

    dragStartTimestamp.current = undefined;

    setActiveChat(null);
    const { active, over } = event;

    if (!over) return;

    const chatId = active.id as string;
    const newStageId = over.id as string;

    const chat = workspace?.workspaceChats.find((c) => c.id === chatId);
    if (chat?.pipelineStageId === newStageId) return;

    updateChatStage.mutate({
      chatId,
      pipelineStageId: newStageId,
      workspaceId,
    });
  };

  return (
    <div className="flex w-full">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        {pipelineStages?.map((stage) => {
          const chats = workspace?.workspaceChats.filter(
            (chat) => chat.pipelineStageId === stage.id,
          );
          return (
            <DroppableArea id={stage.id} key={stage.id}>
              <ScrollArea
                key={stage.id}
                className="h-full max-h-[calc(100vh-5rem)] w-72 flex-shrink-0 last:border-r-0"
              >
                <div className="sticky top-0 z-[1] bg-white px-4 py-4 shadow-sm dark:bg-neutral-900">
                  <p className="w-fit rounded-full bg-muted px-4 py-1 text-xs font-medium text-muted-foreground">
                    {stage.name}
                  </p>
                </div>

                <div className="flex flex-col gap-3 p-2" ref={parent}>
                  {chats?.map((chat) => <ChatItem key={chat.id} chat={chat} />)}
                </div>

                <ScrollBar />
              </ScrollArea>
            </DroppableArea>
          );
        })}
        <DragOverlay>
          {activeChat ? <ChatItem chat={activeChat} isDragOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default PipelineStages;

const DroppableArea = ({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        `flex h-full flex-col rounded-lg border-r border-border transition-colors`,
        isOver ? "bg-muted/50" : "",
      )}
    >
      {children}
    </div>
  );
};
