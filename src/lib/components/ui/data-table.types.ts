import type { Component } from 'svelte';

export type SortValue = string | number | null | undefined;

export interface CellImage {
	src: string;
	alt?: string;
	title?: string;
	text?: string;
}

export interface Column<RowType extends object = Record<string, unknown>> {
	key: keyof RowType & string;
	label: string;
	width?: string;
	class?: string | ((row: RowType) => string | undefined);
	image?: CellImage | CellImage[] | ((row: RowType) => CellImage | CellImage[] | null | undefined);

	value?: (row: RowType) => string | number | null | undefined;

	renderComponent?: (row: RowType) => {
		// Dynamic cell components intentionally accept heterogeneous prop shapes.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		component: Component<any>;
		props?: object;
	};

	searchValue?: (row: RowType) => string;
	sortValue?: (row: RowType) => SortValue;
}
