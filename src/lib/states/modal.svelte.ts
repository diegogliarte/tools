import type { Component } from 'svelte';

type ModalState = {
	// Dynamic modal components intentionally accept heterogeneous prop shapes.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Component<any> | null;
	props: object;
};

export const modalState = $state<ModalState>({
	component: null,
	props: {}
});

export function openModal<Props extends object>(component: Component<Props>, props: Props = {} as Props) {
	modalState.component = component;
	modalState.props = props;
}

export function closeModal() {
	modalState.component = null;
	modalState.props = {};
}
