<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BottomNav from "$lib/components/BottomNav.svelte";
	import { guardarEstado, cargarEstado } from "$lib/storage";
	import { registrarVenta, estadoStockActual } from "$lib/stock";
	import type { EstadoApp, Producto } from '$lib/data';

	// cargarEstado() siempre devuelve un EstadoApp (cae a estadoInicial si
	// LocalStorage está vacío), así que acá nunca es null.
	let estado: EstadoApp = $state(cargarEstado());

	// "Carrito": lista plana de productos tocados antes de cobrar.
	// Si tocás el mismo producto 2 veces, aparece 2 veces en la lista.
	let carrito: Producto[] = $state([]);

	// Total derivado del carrito. Se recalcula solo, no hace falta sumarlo a mano.
	let total: number = $derived(carrito.reduce((acc, p) => acc + p.precio, 0));

	let medioPago: 'efectivo' | 'transferencia' | 'otro' = $state('efectivo');
	const mediosDePago: ('efectivo' | 'transferencia' | 'otro')[] = ['efectivo', 'transferencia', 'otro'];

	// Feedback simple tras cobrar, para que el cajero sepa que la venta entró.
	let ultimaVenta: string | null = $state(null);

	// --- Semáforo por producto (RF-03 / HU-07, versión no bloqueante) ---
	// Un producto queda "en rojo" si ALGUNO de los insumos de su receta está
	// en rojo. Solo es informativo: atenúa el botón, no lo deshabilita.
	function productoEnRojo(producto: Producto): boolean {
		return producto.ingredientes.some(
			(ing) => estadoStockActual(estado, ing.insumoId) === 'rojo'
		);
	}

	function agregarAlCarrito(producto: Producto) {
		carrito.push(producto);
	}

	// Saca un producto del carrito por si el cajero tocó mal.
	function quitarDelCarrito(index: number) {
		carrito.splice(index, 1);
	}

	function vaciarCarrito() {
		carrito = [];
	}

	function cobrar() {
		if (carrito.length === 0) return;

		let estadoActual = estado;
		let huboError = false;

		for (const producto of carrito) {
			const nuevoEstado = registrarVenta(producto.id, medioPago, estadoActual, null);
			// registrarVenta devuelve null si el producto o algún insumo de su
			// receta ya no existe. Caso raro, pero no debe trabar el cobro del
			// resto de los productos del tiquet.
			if (nuevoEstado === null) {
				huboError = true;
				continue;
			}
			estadoActual = nuevoEstado;
		}

		estado = estadoActual;
		guardarEstado(estado);

		ultimaVenta = huboError
			? 'Venta registrada con errores: algún producto ya no existe.'
			: `Venta cobrada: ${carrito.length} producto(s) — Total $${total} (${medioPago}).`;

		vaciarCarrito();
	}
</script>

<div class="flex flex-col items-center min-h-screen w-full text-[#f5f0e8] bg-[#0a0a0c] pb-24">
	<AppHeader />

	<!-- Feedback de la última venta cobrada -->
	{#if ultimaVenta}
		<div class="w-full px-4 mt-2">
			<p class="text-sm text-center bg-green-900/40 border border-green-600 rounded-lg py-1.5 px-2">
				{ultimaVenta}
			</p>
		</div>
	{/if}

	<!-- Tiquet actual (lo que se va a cobrar) -->
	<div class="w-full px-4 mt-3">
		<p class="font-semibold mb-1">Tiquet actual</p>
		{#if carrito.length === 0}
			<p class="text-sm text-[#c9c2b4]">Todavía no elegiste ningún producto.</p>
		{:else}
			<ul class="flex flex-col gap-1">
				{#each carrito as productoElegido, i}
					<li class="flex justify-between items-center bg-[#17171b] rounded-lg px-3 py-1.5">
						<span>{productoElegido.nombre} — ${productoElegido.precio}</span>
						<button
							class="text-red-400 text-sm px-2"
							onclick={() => quitarDelCarrito(i)}
							aria-label={`Quitar ${productoElegido.nombre}`}
						>
							✕
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<p class="text-right font-bold mt-2">Total: ${total}</p>
	</div>

	<!-- Grilla de productos -->
	<div class="grid gap-2 grid-cols-3 w-full px-4 mt-4">
		{#each estado.productosAc.filter((p) => p.activo) as producto (producto.id)}
			{@const enRojo = productoEnRojo(producto)}
			<button
				class="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2
					{enRojo ? 'border-red-600 bg-red-950/40 opacity-70' : 'border-amber-300 hover:bg-white/10'}
					transition-colors duration-150 min-h-[72px]"
				onclick={() => agregarAlCarrito(producto)}
			>
				<span class="font-semibold text-sm text-center">{producto.nombre}</span>
				<span class="text-sm">${producto.precio}</span>
				{#if enRojo}
					<span class="text-[10px] text-red-400">Sin stock</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- Medio de pago -->
	<div class="flex flex-col items-center gap-2 mt-6 w-full px-4">
		<p class="font-semibold">Medio de pago</p>
		<div class="flex gap-2">
			{#each mediosDePago as medio (medio)}
				<button
					class="px-4 py-1.5 rounded-full border-2 capitalize
						{medioPago === medio ? 'border-amber-300 bg-amber-300 text-black' : 'border-amber-300'}"
					onclick={() => (medioPago = medio)}
				>
					{medio}
				</button>
			{/each}
		</div>
	</div>

	<!-- Cobrar -->
	<button
		class="mt-6 w-[90%] py-3 rounded-2xl border-2 border-amber-300 font-bold text-lg
			disabled:opacity-40 disabled:cursor-not-allowed"
		disabled={carrito.length === 0}
		onclick={cobrar}
	>
		Cobrar ahora — Total: ${total}
	</button>

	<BottomNav />
</div>