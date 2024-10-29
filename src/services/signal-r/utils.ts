import {
	HubConnection,
	HubConnectionBuilder,
	HubConnectionState,
	IHttpConnectionOptions,
} from '@microsoft/signalr';
import hermes from 'hermes-channel';
import { useRef } from 'react';

function isConnectionConnecting(connection: HubConnection) {
	return (
		connection.state === HubConnectionState.Connected ||
		connection.state === HubConnectionState.Reconnecting ||
		connection.state === HubConnectionState.Connecting
	);
}

function createConnection(url: string, transportType: IHttpConnectionOptions) {
	let connectionBuilder = new HubConnectionBuilder()
		.withUrl(url, transportType)
		.withAutomaticReconnect();

	if (transportType.logger) {
		connectionBuilder = connectionBuilder.configureLogging(
			transportType.logger,
		);
	}

	const connection = connectionBuilder.build();

	return connection;
}

function removeDuplicates(arr: string[]) {
	const s = new Set(arr);
	const it = s.values();
	return Array.from(it);
}

function sendWithHermes(
	event: string,
	message: any,
	shareConnectionBetweenTab: boolean,
) {
	hermes.send(event, message, shareConnectionBetweenTab ? 'all' : 'current');
}

function usePropRef<T>(prop: T) {
	const ref = useRef<T>(prop);
	if (ref.current !== prop) {
		ref.current = prop;
	}

	return ref;
}

export {
	isConnectionConnecting,
	createConnection,
	removeDuplicates,
	sendWithHermes,
	usePropRef,
};
