import { QueryClient } from '@tanstack/react-query';
import { TelegramWindowContextType } from '../context';
import { tgChatTypes } from '../../../constants';

type Payload = {
	queryClient: QueryClient;
	tg: TelegramWindowContextType;
	chatId: number;
	includeUsernamesFetch?: boolean;
};

export const fetchTgChat = async ({
	queryClient,
	tg,
	chatId,
	includeUsernamesFetch,
}: Payload) => {
	const getTgChatData = async () => {
		try {
			const chatInfo = await tg.custom.proxy.getChatById(chatId);

			if (!chatInfo) {
				throw new Error('chat information is missing');
			}

			if (
				includeUsernamesFetch &&
				chatInfo.chatShortInfo?.type &&
				tgChatTypes.includes(chatInfo.chatShortInfo.type)
			) {
				const chatFullInfo = await tg.methods.proxy.fetchFullChat({
					id: chatId.toString(),
					type: chatInfo.chatShortInfo.type,
					title: chatInfo.chatShortInfo?.title || '',
					accessHash: chatInfo.chatShortInfo?.accessHash,
				});

				if (chatFullInfo) {
					return {
						chatShortInfo: chatInfo.chatShortInfo,
						chatFullInfo: chatFullInfo.fullInfo,
						users: chatFullInfo.users,
					};
				}
			}

			return { ...chatInfo, users: [] };
		} catch (error) {
			console.log('getTgChatData error: ', error);
			throw error;
		}
	};

	return queryClient.fetchQuery({
		queryKey: ['tg-api-chat-info', chatId],
		queryFn: getTgChatData,
		retryDelay: 1000,
		retry(failureCount) {
			if (failureCount >= 5) {
				console.error(`fetchTgChat - no chat ${chatId} data found`);
				return false;
			}
			return true;
		},
	});
};
