<script lang="ts">
	import Icons from '$lib/assets/Icons.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	// Rutas reales de cada tab. La ruta de Caja es "/" (la raíz).
	const tabs = [
		{ id: 'caja', label: 'Caja', icon: 'bolt', ruta: '/' },
		{ id: 'stock', label: 'Stock', icon: 'grid', ruta: '/stock' },
		{ id: 'cierre', label: 'Cierre', icon: 'receipt', ruta: '/cierre' }
	];

	// page.url.pathname es una runa de solo lectura (no un store): se lee
	// directamente, sin el prefijo "$". Se actualiza sola al navegar, así el
	// tab activo se calcula sin que cada +page.svelte tenga que pasarlo.
	let activePath = $derived(page.url.pathname);

	function navegar(ruta: string) {
		goto(ruta);
	}
</script>

<nav class="fixed bottom-0 left-0 w-full bg-[#0a0a0c] border-t border-[#3a3a3e]">
	<div class="flex flex-row justify-around items-center">
		{#each tabs as tab (tab.id)}
			<button
				class="flex flex-col items-center justify-center gap-0.5 rounded-2xl p-2 flex-1"
				onclick={() => navegar(tab.ruta)}
				class:font-bold={activePath === tab.ruta}
				class:text-amber-300={activePath === tab.ruta}
			>
				<Icons name={tab.icon} size={22} />
				<span class="text-xs">{tab.label}</span>
			</button>
		{/each}
	</div>
</nav>