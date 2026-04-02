import type { Component } from 'svelte';

type ModalState = {
	component: Component<any> | null;
	props: Record<string, any>;
};

export const modalState = $state<ModalState>({
	component: null,
	props: {}
});

export function openModal(component: Component<any>, props: Record<string, any> = {}) {
	modalState.component = component;
	modalState.props = props;
}

export function closeModal() {
	modalState.component = null;
	modalState.props = {};
}
