import { allowedForSyncChatTypes } from "@/constants/tg-chat-types";
import { ApiChat, ApiChatFullInfo, ApiMessage, ApiPeer } from "@/types";

type TgChatInFolderResponse = {
  id: number;
  chat: ApiChat | undefined;
  fullInfo: ApiChatFullInfo | undefined;
  peerInfo: ApiPeer | undefined;
  msg: ApiMessage | undefined;
};

export function filterArrayByIds(array: number[], referenceArray: number[]) {
  return array.filter((id) => referenceArray.includes(id));
}

export async function prepareFoldersSyncPayload(data: {
  promises: (
    | TgChatInFolderResponse[]
    | Promise<TgChatInFolderResponse[]>
    | undefined
  )[];
  foldersArray: number[];
}) {
  const promiseResult = await Promise.all(data.promises);
  console.log("PREPARE FOLDERS SYNC PAYLOAD", promiseResult);

  const payload = promiseResult
    .map((elem, index) => ({
      telegramFolderId: data.foldersArray[index],
      chats:
        elem
          ?.filter((elem) =>
            allowedForSyncChatTypes.includes(elem.chat?.type ?? ""),
          )
          ?.map((item) => {
            console.log(item.msg);

            return {
              telegramChatId: +item.id,
              name: item.chat?.title ?? "",
              type: item.chat?.type ?? "",
              lastMessageAt: item.msg?.date ?? 0,
              // lastMessage: item.msg?.text ?? "",
            };
          })
          ?.filter((it) => !!it.name) ?? [],
    }))
    .filter((elem) => elem.chats?.length);

  return payload;
}
