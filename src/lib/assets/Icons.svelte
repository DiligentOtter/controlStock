<script>
	let { name, size = 22 } = $props();

	const paths = {
		bolt: 'M13 2 4 14h6l-1 8 9-12h-6l1-8z',
		cash: 'M3 6h18v12H3z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M6 6v12 M18 6v12',
		transfer: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z M8 4v-1 M16 20v1',
		card: 'M2 6h20v12H2z M2 10h20',
		check: 'M4 12l5 5L20 6',
		close: 'M5 5l14 14M19 5L5 19',
		trash: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13',
		bag: 'M6 8h12l-1 12H7L6 8z M9 8V6a3 3 0 0 1 6 0v2',
		chevron: 'M9 5l7 7-7 7',
		receipt: 'M5 3h14v18l-2-1.5L15 21l-2-1.5L11 21l-2-1.5L7 21l-2-1.5V3z M8 8h8 M8 12h8 M8 16h5',
		grid: 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z',
		user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M4 20c1.5-4 5-6 8-6s6.5 2 8 6'
	};
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={paths[name] ?? ''} />
</svg>