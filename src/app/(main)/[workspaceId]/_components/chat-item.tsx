"use client";

import React from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { type ChatItem as ChatItemType } from "@/server/db/schema";
import { useIframeOpen, useTelegram } from "@/services";

dayjs.extend(relativeTime);

const ChatItem = ({ chat }: { chat: ChatItemType }) => {
  const tg = useTelegram();
  const [iframeOpen, setIframeOpen] = useIframeOpen();
  if (!chat) return null;
  return (
    <div
      className="rounded-md border bg-muted/50 p-2 shadow"
      key={chat.id}
      onClick={() => {
        void tg?.actions.proxy.openChat({ id: chat.telegramChatId.toString() });
        setIframeOpen(true);
      }}
    >
      <p className="text-sm font-medium">{chat.name}</p>

      <p className="text-xs text-muted-foreground">
        {dayjs(chat.lastMessageAt).fromNow()}
      </p>
    </div>
  );
};

export default ChatItem;
