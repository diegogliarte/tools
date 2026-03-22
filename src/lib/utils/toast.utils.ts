import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export type ToastItem = {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
	createdAt: number;
};

type ToastStore = ToastItem[];

export const toastState = writable<ToastStore>([]);

const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

function makeId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function clearToastTimeout(id: string) {
	const timeout = timeouts.get(id);
	if (timeout) {
		clearTimeout(timeout);
		timeouts.delete(id);
	}
}

function scheduleToastRemoval(id: string, duration: number) {
	clearToastTimeout(id);

	const timeout = setTimeout(() => {
		removeToast(id);
	}, duration);

	timeouts.set(id, timeout);
}

export function showToast(
	message: string,
	{
		type = 'info',
		duration = 2000
	}: {
		type?: ToastType;
		duration?: number;
	} = {}
) {
	const toast: ToastItem = {
		id: makeId(),
		message,
		type,
		duration,
		createdAt: Date.now()
	};

	toastState.update((items) => [...items, toast]);
	scheduleToastRemoval(toast.id, duration);

	return toast.id;
}

export function messageToast(type: ToastType, message: string, duration = 2000) {
	return showToast(message, { type, duration });
}

export function removeToast(id: string) {
	clearToastTimeout(id);
	toastState.update((items) => items.filter((item) => item.id !== id));
}

export function resetToastTimer(id: string) {
	let target: ToastItem | undefined;

	toastState.update((items) => {
		target = items.find((item) => item.id === id);
		if (!target) return items;

		return items.map((item) =>
			item.id === id
				? {
					...item,
					createdAt: Date.now()
				}
				: item
		);
	});

	if (target) {
		scheduleToastRemoval(id, target.duration);
	}
}

export function clearToasts() {
	for (const id of timeouts.keys()) {
		clearToastTimeout(id);
	}
	toastState.set([]);
}