import { QueryClient } from '@tanstack/react-query';
import { TelegramWindowContextType } from '../context';
import { sixHoursInMilliseconds } from '../../../constants';

export const fetchTgFullUser = async (
	queryClient: QueryClient,
	tg: TelegramWindowContextType,
	userId: string,
	accessHash: string,
) => {
	const getUserFullData = async () => {
		try {
			const res = await tg.methods.proxy.fetchFullUser({
				id: userId,
				accessHash,
			});

			if (!res) {
				throw new Error('user full information is missing');
			}

			return res;
		} catch (error) {
			console.log('getUserFullData error: ', error);
			throw error;
		}
	};

	return queryClient.fetchQuery({
		queryKey: ['tg-api-full-user-info', userId],
		queryFn: getUserFullData,
		retryDelay: 1000,
		retry(failureCount) {
			if (failureCount >= 5) {
				console.error(
					`fetchTgFullUser - no user ${userId} full data found`,
				);
				return false;
			}
			return true;
		},
		staleTime: sixHoursInMilliseconds,
	});
};
