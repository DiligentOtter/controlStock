<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { cargarEstado } from '$lib/storage';
	import type { EstadoApp, Transaccion, Producto } from '$lib/data';

	let estado: EstadoApp = $state(cargarEstado());

	let activeTab = $state('cierre');

	// --- Totales por medio de pago (HU-10 / RF-06) ---
	// No hay todavía calcularTotales() en stock.ts, así que queda acá por ahora.
	function calcularTotales(transacciones: Transaccion[]): Record<string, number> {
		const totales: Record<string, number> = { efectivo: 0, transferencia: 0, otro: 0 };
		for (const tx of transacciones) {
			totales[tx.medioPago] = (totales[tx.medioPago] ?? 0) + tx.precio;
		}
		return totales;
	}

	let totales = $derived(calcularTotales(estado.transacciones));
	let totalGeneral = $derived(
		Object.values(totales).reduce((acc, v) => acc + v, 0)
	);

	// --- Consumo teórico de insumos según BOM (HU-10 / RF-06) ---
	// Compara contra el conteo físico de botellas vacías para detectar mermas
	// no registradas. No hay calcularConsumoTeorico() en stock.ts todavía.
	function calcularConsumoTeorico(
		transacciones: Transaccion[],
		productos: Producto[]
	): Record<string, number> {
		const consumo: Record<string, number> = {};
		for (const tx of transacciones) {
			const producto = productos.find((p) => p.id === tx.productoId);
			if (!producto) continue;
			for (const ing of producto.ingredientes) {
				consumo[ing.insumoId] = (consumo[ing.insumoId] ?? 0) + ing.cantidad;
			}
		}
		return consumo;
	}

	let consumoTeorico = $derived(calcularConsumoTeorico(estado.transacciones, estado.productosAc));

	function nombreInsumo(insumoId: string): string {
		return estado.insumosAc.find((i) => i.id === insumoId)?.nombre ?? insumoId;
	}

	// --- Exportar JSON (HU-09 / RF-08) ---
	// Backup completo: insumos + productos + transacciones.
	function exportarJSON() {
		const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
		descargarBlob(blob, `backup-scout-pos-${Date.now()}.json`);
	}

	// --- Exportar CSV (HU-09 / RF-08) ---
	// Solo transacciones, una fila por venta, para abrir directo en Excel/Sheets.
	function transaccionesACSV(transacciones: Transaccion[]): string {
		const encabezado = 'id,productoId,timeStamp,medioPago,precio';
		const filas = transacciones.map(
			(tx) => `${tx.id},${tx.productoId},${tx.timeStamp},${tx.medioPago},${tx.precio}`
		);
		return [encabezado, ...filas].join('\n');
	}

	function exportarCSV() {
		const csv = transaccionesACSV(estado.transacciones);
		const blob = new Blob([csv], { type: 'text/csv' });
		descargarBlob(blob, `transacciones-scout-pos-${Date.now()}.csv`);
	}

	function descargarBlob(blob: Blob, nombreArchivo: string) {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = nombreArchivo;
		link.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="flex flex-col items-center min-h-screen w-full text-[#f5f0e8] bg-[#0a0a0c] pb-24">
	<AppHeader />

	<div class="w-full px-4 mt-3 flex flex-col gap-5">
		<!-- Arqueo por medio de pago -->
		<section>
			<p class="font-semibold text-lg mb-2">Arqueo de caja</p>
			<ul class="flex flex-col gap-1">
				{#each Object.entries(totales) as [medio, monto]}
					<li class="flex justify-between bg-[#17171b] rounded-lg px-3 py-2 capitalize">
						<span>{medio}</span>
						<span class="font-semibold">${monto}</span>
					</li>
				{/each}
			</ul>
			<p class="flex justify-between font-bold mt-2 px-3">
				<span>Total recaudado</span>
				<span>${totalGeneral}</span>
			</p>
			<p class="text-xs text-[#c9c2b4] mt-1 px-1">{estado.transacciones.length} venta(s) registradas.</p>
		</section>

		<!-- Consumo teórico de insumos -->
		<section>
			<p class="font-semibold text-lg mb-2">Consumo teórico de insumos</p>
			<p class="text-xs text-[#c9c2b4] mb-2">Comparalo contra el conteo físico de botellas/hielo/jarras vacías.</p>
			{#if Object.keys(consumoTeorico).length === 0}
				<p class="text-sm text-[#c9c2b4]">Todavía no hay ventas registradas.</p>
			{:else}
				<ul class="flex flex-col gap-1">
					{#each Object.entries(consumoTeorico) as [insumoId, cantidad]}
						<li class="flex justify-between bg-[#17171b] rounded-lg px-3 py-2">
							<span>{nombreInsumo(insumoId)}</span>
							<span class="font-semibold">{cantidad.toFixed(2)}</span>
						</li>
					{/each}
				</ul>
			{/if}
		</section>

		<!-- Exportación -->
		<section class="flex flex-col gap-2">
			<p class="font-semibold text-lg mb-1">Exportar datos</p>
			<button class="py-2.5 rounded-xl border-2 border-amber-300 font-semibold" onclick={exportarJSON}>
				Exportar JSON (backup completo)
			</button>
			<button class="py-2.5 rounded-xl border-2 border-amber-300 font-semibold" onclick={exportarCSV}>
				Exportar CSV (para Excel/Sheets)
			</button>
		</section>
	</div>

	<BottomNav active={activeTab} onNavigate={(tab) => (activeTab = tab)} />
</div>