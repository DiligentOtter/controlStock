<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { guardarEstado, cargarEstado } from '$lib/storage';
	import { reingresoRetornables, estadoStockActual } from '$lib/stock';
	import type { EstadoApp, Insumo } from '$lib/data';

	let estado: EstadoApp = $state(cargarEstado());

	let activeTab = $state('stock');

	// --- Ajuste manual de stock (HU-04) ---
	// No hay todavía una función ajustarStock() en stock.ts, así que la lógica
	// vive acá mismo por ahora. Cuando se cree en stock.ts, esto se reemplaza
	// por una sola llamada, sin tocar el resto de la página.
	let insumoEnAjuste: Insumo | null = $state(null);
	let nuevoValorInput: string = $state('');
	let motivoInput: string = $state('');

	function abrirAjuste(insumo: Insumo) {
		insumoEnAjuste = insumo;
		nuevoValorInput = String(insumo.stockActual);
		motivoInput = '';
	}

	function cerrarAjuste() {
		insumoEnAjuste = null;
		nuevoValorInput = '';
		motivoInput = '';
	}

	function confirmarAjuste() {
		if (!insumoEnAjuste) return;

		const nuevoValor = Number(nuevoValorInput);
		if (Number.isNaN(nuevoValor) || nuevoValor < 0) return;

		// ajustarStock(insumoId, nuevoValor, motivo) — sobrescribe stockActual
		// directamente (no es un delta, "esto es lo que hay ahora"), según HU-04.
		const insumosActualizados = estado.insumosAc.map((i) =>
			i.id === insumoEnAjuste!.id ? { ...i, stockActual: nuevoValor } : i
		);
		estado = { ...estado, insumosAc: insumosActualizados };
		guardarEstado(estado);

		// El motivo es texto libre opcional (HU-04). Por ahora no hay un log
		// dedicado: se deja solo en consola como referencia mínima, no es
		// crítico si se pierde (así lo marca la HU).
		if (motivoInput.trim()) {
			console.log(`Ajuste de stock — ${insumoEnAjuste.nombre}: ${motivoInput}`);
		}

		cerrarAjuste();
	}

	// --- Reingreso de jarras (HU-03 / RF-07) ---
	function reingresarUna(insumoId: string) {
		const nuevoEstado = reingresoRetornables(insumoId, 1, estado);
		if (nuevoEstado) {
			estado = nuevoEstado;
			guardarEstado(estado);
		}
	}

	// --- Semáforo visual (RF-03) ---
	function colorSemaforo(insumoId: string): string {
		const nivel = estadoStockActual(estado, insumoId);
		if (nivel === 'rojo') return 'bg-red-950/40 border-red-600';
		if (nivel === 'amarillo') return 'bg-yellow-950/40 border-yellow-500';
		return 'bg-green-950/30 border-green-600';
	}

	function emojiSemaforo(insumoId: string): string {
		const nivel = estadoStockActual(estado, insumoId);
		if (nivel === 'rojo') return '🔴';
		if (nivel === 'amarillo') return '🟡';
		return '🟢';
	}
</script>

<div class="flex flex-col items-center min-h-screen w-full text-[#f5f0e8] bg-[#0a0a0c] pb-24">
	<AppHeader />

	<div class="w-full px-4 mt-3">
		<p class="font-semibold mb-2 text-lg">Stock de insumos</p>

		<ul class="flex flex-col gap-2">
			{#each estado.insumosAc as insumo (insumo.id)}
				<li class="flex items-center justify-between gap-2 rounded-xl border-2 p-2.5 {colorSemaforo(insumo.id)}">
					<button class="flex flex-col items-start text-left flex-1" onclick={() => abrirAjuste(insumo)}>
						<span class="font-semibold text-sm">{emojiSemaforo(insumo.id)} {insumo.nombre}</span>
						<span class="text-xs text-[#c9c2b4]">
							Stock: {insumo.stockActual} {insumo.unidad}
							{#if insumo.retornable}
								· En uso: {insumo.enUso ?? 0}
							{/if}
							· Mínimo: {insumo.minimoCritico}
						</span>
					</button>

					{#if insumo.retornable}
						<button
							class="text-xs px-3 py-1.5 rounded-full border-2 border-amber-300 whitespace-nowrap"
							onclick={() => reingresarUna(insumo.id)}
						>
							+1 devuelta
						</button>
					{/if}
				</li>
			{/each}
		</ul>

		<p class="text-xs text-[#c9c2b4] mt-3">Tocá un insumo para ajustar el stock manualmente (roturas, recuentos).</p>
	</div>

	<BottomNav active={activeTab} onNavigate={(tab) => (activeTab = tab)} />
</div>

<!-- Modal de ajuste manual (HU-04) -->
{#if insumoEnAjuste}
	<div class="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50">
		<div class="bg-[#17171b] border-2 border-amber-300 rounded-2xl p-4 w-full max-w-sm flex flex-col gap-3">
			<p class="font-bold text-lg">Ajustar: {insumoEnAjuste.nombre}</p>

			<label class="flex flex-col gap-1 text-sm">
				Nuevo stock actual ({insumoEnAjuste.unidad})
				<input
					type="number"
					min="0"
					class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
					bind:value={nuevoValorInput}
				/>
			</label>

			<label class="flex flex-col gap-1 text-sm">
				Motivo (opcional)
				<input
					type="text"
					placeholder="Ej: se rompió una botella"
					class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
					bind:value={motivoInput}
				/>
			</label>

			<div class="flex gap-2 mt-2">
				<button class="flex-1 py-2 rounded-xl border-2 border-[#3a3a3e]" onclick={cerrarAjuste}>
					Cancelar
				</button>
				<button class="flex-1 py-2 rounded-xl border-2 border-amber-300 font-bold" onclick={confirmarAjuste}>
					Guardar
				</button>
			</div>
		</div>
	</div>
{/if}