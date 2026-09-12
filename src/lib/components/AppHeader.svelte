<script lang="ts">
	import Icon from '$lib/assets/Icons.svelte';
</script>

<header class="w-full px-4 py-3 flex items-center justify-between bg-[#0a0a0c] border-b border-[#3a3a3e]">
	<div class="flex items-center gap-2">
		<span class="text-xl">🏕️</span>
		<div class="flex flex-col leading-tight">
			<span class="font-bold text-[#f5f0e8] tracking-wide">Stand Scout</span>
			<span class="text-[10px] text-amber-300/80 uppercase tracking-wider">Punto de venta</span>
		</div>
	</div>

	<div class="w-9 h-9 rounded-full bg-amber-300 flex items-center justify-center">
		<Icon name="user" size={18} />
	</div>
</header>