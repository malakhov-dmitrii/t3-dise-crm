import { Requester } from "jsonrpc-iframe";
import { mergeIntoObservable, observable } from "@legendapp/state";
import { Methods, Custom } from "./types";
import { ApiChat, ApiChatFolder, ApiChatFullInfo, ApiMessage } from "@/types";
type FoldersResponse = NonNullable<
  Awaited<ReturnType<Methods["fetchChatFolders"]>>
>;
type Folder = FoldersResponse["byId"][number];

type MergedChat = {
  id: number;
  chat: ApiChat | undefined;
  info: ApiChatFullInfo | undefined;
};

export const state$ = observable({
  folders: {
    selected: 0,
    byId: {} as FoldersResponse["byId"],
    list: [] as Folder[],
    initiallyLoaded: false,
  },
  chats: {
    selected: 0,
    byId: {} as Record<number | string, MergedChat | undefined>,
    inFolder: {} as Record<number, MergedChat[] | undefined>,
    lastMessages: {} as Record<string | number, ApiMessage>,
  },
});

export async function fetchChatFolders(methods: Requester<Methods>) {
  console.log("fetchChatFolders start");
  try {
    const response = await methods.proxy.fetchChatFolders();

    console.log("fetchChatFolders response", response);

    if (!response) {
      throw new Error("folders not found");
    }

    const folders = response;
    state$.folders.initiallyLoaded.set(true);
    state$.folders.byId.assign(folders.byId);
    const byId = state$.folders.byId.peek();
    state$.folders.list.set(
      folders.orderedIds
        .map((id) => byId[id])
        .filter(Boolean) as ApiChatFolder[],
    );

    const foldersResponse = {
      list: state$.folders.list.get(),
      ids: response.orderedIds,
    };

    return foldersResponse;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

//*unused for now
export const resetTelegramApiState = () => {
  state$.folders.set({
    selected: 0,
    byId: {},
    list: [],
    initiallyLoaded: false,
  });
  state$.chats.set({
    selected: 0,
    byId: {},
    inFolder: {},
    lastMessages: {},
  });
};

//*Deprecated
export async function loadChatsInFolder(
  custom: Requester<Custom>,
  folderId: number,
) {
  const response = await custom.proxy.getChatsInTheFolder(folderId);
  console.log("loadChatsInFolder", folderId, response);
  if (!response) {
    return undefined;
  }

  state$.chats.inFolder[folderId]?.set(
    response.map(({ id, chat, fullInfo }) => ({
      id,
      chat: chat!,
      info: fullInfo,
    })),
  );
  const chats = {} as Record<number | string, MergedChat>;
  const lastMessages = {} as Record<number | string, ApiMessage>;
  for (const { id, chat, msg, fullInfo } of response) {
    if (!chat) {
      continue;
    }

    chats[id] = { id, chat, info: fullInfo };
    if (msg) {
      lastMessages[id] = msg;
    }
  }
  mergeIntoObservable(state$.chats.byId, chats);
  mergeIntoObservable(state$.chats.lastMessages, lastMessages);
}
