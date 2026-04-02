export function load({ cookies }) {
	return {
		isSidebarOpen: cookies.get('layout.sidebar') === 'true',
		aall: cookies.getAll()
	};
}