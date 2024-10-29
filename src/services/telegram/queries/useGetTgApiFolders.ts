import { fetchChatFolders } from '../telegram-api';
import { useQuery } from '@tanstack/react-query';
import { Requester } from 'jsonrpc-iframe';
import { Methods } from '../types';
import { Alerter } from '../../../utils';

export const useGetTgApiFolders = (
	methods?: Requester<Methods>,
	isEnabled?: boolean,
) =>
	useQuery({
		queryKey: ['tg-api-folders'],
		queryFn: () => {
			if (!methods) {
				throw new Error('methods not provided');
			}
			return fetchChatFolders(methods);
		},
		retryDelay: 1000,
		retry(failureCount) {
			if (failureCount >= 5) {
				Alerter.error(
					'Telegram has not fully synchronized folders and chats on its side yet. Please try again later.',
				);
				return false;
			}
			return true;
		},
		refetchOnWindowFocus: false,
		enabled: !!methods && isEnabled,
	});
