"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type ChatItem as ChatItemType } from "@/server/db/schema";
import { useIframeOpen, useTelegram } from "@/services";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
dayjs.extend(relativeTime);

interface ChatItemProps {
  chat: ChatItemType;
  isDragOverlay?: boolean;
}

const ChatItem = ({ chat, isDragOverlay }: ChatItemProps) => {
  const tg = useTelegram();
  const [iframeOpen, setIframeOpen] = useIframeOpen();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: chat.id,
      disabled: isDragOverlay,
    });

  console.log(isDragOverlay, transform);
  const style = {
    transform: CSS.Transform.toString({
      x: transform?.x ?? 1,
      y: transform?.y ?? 1,
      scaleX: 1,
      scaleY: 1,
    }),
    opacity: isDragging ? 0.3 : undefined,
  };

  if (!chat) return null;

  const handleClick = () => {
    if (isDragging || isDragOverlay) return;
    void tg?.actions.proxy.openChat({ id: chat.telegramChatId.toString() });
    setIframeOpen(true);
  };

  return (
    <div
      className={`touch-none select-none rounded-md border bg-card p-2 shadow-sm transition-all ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      } ${isDragOverlay ? "cursor-grabbing shadow-md" : ""}`}
      ref={setNodeRef}
      style={style}
      {...(!isDragOverlay ? { ...listeners, ...attributes } : {})}
      onClick={handleClick}
    >
      <p className="line-clamp-1 text-sm font-medium leading-5">{chat.name}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {dayjs(chat.lastMessageAt).fromNow()}
      </p>
    </div>
  );
};

export default ChatItem;
