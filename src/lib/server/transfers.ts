import { getStore } from '@netlify/blobs';

export const TRANSFER_STORE_NAME = 'local-state-transfers';

export function getTransferStore() {
	return getStore(TRANSFER_STORE_NAME);
}
