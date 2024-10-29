import { QueryClient } from '@tanstack/react-query';
import { TelegramWindowContextType } from '../context';

export const fetchChats = async (
	queryClient: QueryClient,
	tg: TelegramWindowContextType,
	fetchLimit: number,
	workspaceId: number,
) => {
	const getChats = async () => {
		try {
			const res = await tg.methods.proxy.fetchChats({
				limit: fetchLimit,
			});

			if (!res) {
				throw new Error('No chats found');
			}

			return res;
		} catch (error) {
			console.log('getChats error: ', error);
			throw error;
		}
	};

	return queryClient.fetchQuery({
		queryKey: ['tg-api-chats', workspaceId],
		queryFn: getChats,
		retryDelay: 1000,
		retry(failureCount) {
			if (failureCount >= 5) {
				console.error('fetchChats - no chats found');
				return false;
			}
			return true;
		},
	});
};
