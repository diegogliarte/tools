import type { Component } from 'svelte';

export type SortValue = string | number | null | undefined;

export interface Column<RowType extends Record<string, any> = Record<string, any>> {
	key: keyof RowType & string;
	label: string;
	width?: string;

	render?: (row: RowType) => string | number | null | undefined;

	renderComponent?: (row: RowType) => {
		component: Component<any, any, any>;
		props?: Record<string, any>;
	};

	searchValue?: (row: RowType) => string;
	sortValue?: (row: RowType) => SortValue;
}
