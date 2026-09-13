<script lang="ts">
	import AppHeader from '$lib/components/AppHeader.svelte';
	import BottomNav from '$lib/components/BottomNav.svelte';
	import { guardarEstado, cargarEstado } from '$lib/storage';
	import { reingresoRetornables, estadoStockActual } from '$lib/stock';
	import type { EstadoApp, Insumo, Producto } from '$lib/data';

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

	// --- Formulario para agregar un nuevo producto ---
	let productoNuevo: Producto = $state({
		id: `prod-${Date.now()}`,
		nombre: '',
		precio: 0,
		activo: true,
		ingredientes: [],
	});

	// Cantidad por insumo, separado del producto en sí. Se guarda como
	// { insumoId: cantidad } solo para los insumos que el usuario tildó.
	// Esto es lo que faltaba: antes el <select multiple> guardaba directo
	// un array de ids de insumo en vez de { insumoId, cantidad }[], y por
	// eso registrarVenta() no encontraba el insumo real (recibía undefined).
	let cantidadesPorInsumo: Record<string, number> = $state({});

	let productoFormOpen = $state(false);

	function abrirFormProducto() {
		productoFormOpen = true;
	}

	function cerrarFormProducto() {
		productoFormOpen = false;
		productoNuevo = {
			id: `prod-${Date.now()}`,
			nombre: '',
			precio: 0,
			activo: true,
			ingredientes: [],
		};
		cantidadesPorInsumo = {};
	}

	// Al tildar/destildar un insumo, lo agregamos o sacamos del registro de
	// cantidades. Si se tilda, arranca en 1 (una unidad) como valor por
	// defecto razonable, editable después.
	function toggleInsumo(insumoId: string, marcado: boolean) {
		if (marcado) {
			cantidadesPorInsumo[insumoId] = cantidadesPorInsumo[insumoId] ?? 1;
		} else {
			delete cantidadesPorInsumo[insumoId];
			cantidadesPorInsumo = { ...cantidadesPorInsumo };
		}
	}

	function confirmarFormProducto() {
		if (!productoNuevo.nombre.trim()) {
			return;
		}

		// Se arma la receta real acá, con la forma que espera Producto:
		// [{ insumoId, cantidad }], no un array plano de ids.
		const ingredientesFinales = Object.entries(cantidadesPorInsumo)
			.filter(([, cantidad]) => cantidad > 0)
			.map(([insumoId, cantidad]) => ({ insumoId, cantidad }));

		const nuevoProducto: Producto = {
			id: productoNuevo.id,
			nombre: productoNuevo.nombre,
			precio: productoNuevo.precio,
			activo: productoNuevo.activo,
			ingredientes: ingredientesFinales,
		};
		estado = { ...estado, productosAc: [...(estado.productosAc || []), nuevoProducto] };
		guardarEstado(estado);
		cerrarFormProducto();
	}

	// --- Formulario para editar un producto/insumo ---
	let insumoEnEdicion: Insumo | null = $state(null);
	let formNombreInput: string = $state('');
	let formUnidadInput: string = $state('');
	let formRetornableInput: boolean = $state(false);
	let formStockActualInput: number = $state(0);
	let formMinimoCriticoInput: number = $state(0);
	let formEnUsoInput: number = $state(0);

	let insumoFormOpen = $state(false);

	function abrirFormEdicion(insumo: Insumo) {
		insumoEnEdicion = insumo;
		formNombreInput = insumo.nombre;
		formUnidadInput = insumo.unidad;
		formRetornableInput = insumo.retornable;
		formStockActualInput = insumo.stockActual;
		formMinimoCriticoInput = insumo.minimoCritico;
		formEnUsoInput = insumo.enUso ?? 0;
		insumoFormOpen = true;
	}

	function cerrarFormEdicion() {
		insumoEnEdicion = null;
		formNombreInput = '';
		formUnidadInput = '';
		formRetornableInput = false;
		formStockActualInput = 0;
		formMinimoCriticoInput = 0;
		formEnUsoInput = 0;
		insumoFormOpen = false;
	}

	function confirmarFormEdicion() {
		if (!insumoEnEdicion) return;

		const insumosActualizados = estado.insumosAc.map((i) =>
			i.id === insumoEnEdicion!.id
				? {
						...i,
						nombre: formNombreInput,
						unidad: formUnidadInput,
						retornable: formRetornableInput,
						stockActual: formStockActualInput,
						minimoCritico: formMinimoCriticoInput,
						enUso: formEnUsoInput,
					}
				: i
		);
		estado = { ...estado, insumosAc: insumosActualizados };
		guardarEstado(estado);
		cerrarFormEdicion();
	}

	// --- Reingreso de jarras (HU-03 / RF-07) ---
	function reingresarUna(insumoId: string) {
		const nuevoEstado = reingresoRetornables(insumoId, 1, estado);
		if (nuevoEstado) {
			estado = nuevoEstado;
			guardarEstado(estado);
		}
	}

	// --- Formulario para editar un producto ---
	let productoEdicion: Producto = $state({
		id: '',
		nombre: '',
		precio: 0,
		activo: true,
		ingredientes: [],
	});

	let productoEdicionOpen = $state(false);

	function abrirFormEdicionProducto(producto: Producto) {
		productoEdicion = { ...producto };
		productoEdicionOpen = true;
	}

	function cerrarEdicionProducto() {
		productoEdicionOpen = false;
		productoEdicion = {
			id: '',
			nombre: '',
			precio: 0,
			activo: true,
			ingredientes: [],
		};
	}

	function confirmarEdicionProducto() {
		if (!productoEdicion.nombre.trim()) {
			return;
		}
		estado = {
			...estado,
			productosAc: estado.productosAc.map((p) =>
				p.id === productoEdicion.id ? productoEdicion : p
			),
		};
		guardarEstado(estado);
		cerrarEdicionProducto();
	}

	// --- Desactivar producto (HU-01b) ---
	// No se borra del array (borrado duro): eso rompería transacciones ya
	// registradas que apuntan a este productoId. Se marca activo=false, y
	// la página de Caja ya lo filtra con estado.productosAc.filter(p => p.activo).
	function desactivarProducto(productoId: string) {
		estado = {
			...estado,
			productosAc: estado.productosAc.map((p) =>
				p.id === productoId ? { ...p, activo: false } : p
			),
		};
		guardarEstado(estado);
	}

	function reactivarProducto(productoId: string) {
		estado = {
			...estado,
			productosAc: estado.productosAc.map((p) =>
				p.id === productoId ? { ...p, activo: true } : p
			),
		};
		guardarEstado(estado);
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

		<!-- Botón para abrir formulario de agregar producto -->
		<button
			onclick={abrirFormProducto}
			class="mb-3 px-4 py-2 rounded-xl border-2 border-amber-300 text-sm font-medium text-[#f5f0e8] bg-amber-600/10 hover:bg-amber-600/20 transition-colors"
		>
			Agregar producto
		</button>

		<ul class="flex flex-col gap-2">
			{#each estado.insumosAc as insumo (insumo.id)}
				<li
					class="flex items-center justify-between gap-2 rounded-xl border-2 p-2.5 {colorSemaforo(insumo.id)}"
					ontoggle={() => {}}
				>
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

					<!-- Botón lápiz para editar insumo -->
					{#if true}
						<button
							class="text-xs px-2 py-1 rounded border border-gray-400 bg-gray-500/10 hover:bg-gray-500/20 transition-colors"
							title="Editar insumo"
							onclick={() => abrirFormEdicion(insumo)}
						>
							<span class="absolute left-1/2 -translate-x-1/2 text-amber-400">✎</span>
						</button>
					{/if}

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

		<!-- Productos cards -->
		{#each estado.productosAc as producto (producto.id)}
			<div
				class="mt-4 rounded-xl border-2 p-4 bg-[#17171b] {producto.activo ? 'border-amber-300/20' : 'border-gray-600/30 opacity-60'}"
			>
				<div class="flex items-center justify-between">
					<span class="font-semibold text-lg">
						{producto.nombre}
						{#if !producto.activo}
							<span class="text-xs text-gray-400 font-normal">(desactivado)</span>
						{/if}
					</span>
					<span class="text-xs text-amber-300">${producto.precio}</span>
				</div>

				<p class="text-xs text-[#c9c2b4] mt-1">Precio: ${producto.precio}</p>

				<div class="flex items-center gap-3 mt-2">
					<!-- Botón lápiz para editar producto -->
					<button
						class="text-amber-400 hover:text-amber-300 transition-colors"
						title="Editar producto"
						onclick={() => abrirFormEdicionProducto(producto)}
					>
						✎
					</button>

					{#if producto.activo}
						<button
							class="text-xs px-2 py-1 rounded border border-red-500 text-red-400 hover:bg-red-500/10 transition-colors"
							onclick={() => desactivarProducto(producto.id)}
						>
							Desactivar
						</button>
					{:else}
						<button
							class="text-xs px-2 py-1 rounded border border-green-500 text-green-400 hover:bg-green-500/10 transition-colors"
							onclick={() => reactivarProducto(producto.id)}
						>
							Reactivar
						</button>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<!-- Formulario para agregar nuevo producto -->
	{#if productoFormOpen}
		<div
			class="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="bg-[#17171b] border-2 border-amber-300 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
			>
				<p class="font-bold text-lg">Agregar nuevo producto</p>

				<label class="flex flex-col gap-1 text-sm">
					Nombre
					<input
						type="text"
						bind:value={productoNuevo.nombre}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
						placeholder="Ej: Gin Tonic"
					/>
				</label>

				<label class="flex flex-col gap-1 text-sm">
					Precio (opcional)
					<input
						type="number"
						bind:value={productoNuevo.precio}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
						placeholder="0"
					/>
				</label>

				<label class="flex flex-col gap-1 text-sm">
					Ingredientes (insumos que compone este producto)
					<div class="flex flex-col gap-1.5 bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 max-h-56 overflow-y-auto">
						{#each estado.insumosAc as insumo (insumo.id)}
							<div class="flex items-center gap-2">
								<input
									type="checkbox"
									id={`ing-${insumo.id}`}
									checked={insumo.id in cantidadesPorInsumo}
									onchange={(e) => toggleInsumo(insumo.id, e.currentTarget.checked)}
								/>
								<label for={`ing-${insumo.id}`} class="flex-1 text-sm">
									{insumo.nombre} ({insumo.unidad})
								</label>
								{#if insumo.id in cantidadesPorInsumo}
									<input
										type="number"
										min="0"
										step="0.01"
										class="w-20 bg-[#17171b] border border-[#3a3a3e] rounded px-2 py-1 text-sm text-[#f5f0e8]"
										bind:value={cantidadesPorInsumo[insumo.id]}
									/>
								{/if}
							</div>
						{/each}
					</div>
				</label>

				<div class="flex gap-3 mt-4">
					<button
						class="flex-1 py-2 rounded-xl border-2 border-[#3a3a3e]"
						onclick={cerrarFormProducto}
					>
						Cancelar
					</button>
					<button
						class="flex-1 py-2 rounded-xl border-2 border-amber-300 font-bold"
						onclick={confirmarFormProducto}
					>
						Guardar producto
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal de edición de insumo -->
	{#if insumoFormOpen && insumoEnEdicion}
		<div
			class="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="bg-[#17171b] border-2 border-amber-300 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
			>
				<p class="font-bold text-lg">Editar insumo: {insumoEnEdicion.nombre}</p>

				<label class="flex flex-col gap-1 text-sm">
					Nuevo nombre
					<input
						type="text"
						bind:value={formNombreInput}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
						placeholder="Nombre actualizado"
					/>
				</label>

				<label class="flex flex-col gap-1 text-sm">
					Unidad
					<select
						bind:value={formUnidadInput}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
					>
						<option value="botella">botella</option>
						<option value="unidad">unidad</option>
						<option value="bolsa">bolsa</option>
					</select>
				</label>

				<div class="flex gap-3">
					<label class="flex flex-col gap-1 text-sm flex-1">
						Stock actual
						<input
							type="number"
							bind:value={formStockActualInput}
							min="0"
							class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
							placeholder="0"
						/>
					</label>

					<label class="flex flex-col gap-1 text-sm flex-1">
						Mínimo crítico
						<input
							type="number"
							bind:value={formMinimoCriticoInput}
							min="0"
							class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
							placeholder="0"
						/>
					</label>
				</div>

				<label class="flex flex-col gap-1 text-sm">
					¿Es retornable?
					<select bind:value={formRetornableInput} class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]">
						<option value={true}>Sí</option>
						<option value={false}>No</option>
					</select>
				</label>

				{#if formRetornableInput}
					<label class="flex flex-col gap-1 text-sm">
						En uso (unidades prestadas actualmente)
						<input
							type="number"
							bind:value={formEnUsoInput}
							min="0"
							class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
							placeholder="0"
						/>
					</label>
				{/if}

				<div class="flex gap-3 mt-4">
					<button
						class="flex-1 py-2 rounded-xl border-2 border-[#3a3a3e]"
						onclick={cerrarFormEdicion}
					>
						Cancelar
					</button>
					<button
						class="flex-1 py-2 rounded-xl border-2 border-amber-300 font-bold"
						onclick={confirmarFormEdicion}
					>
						Guardar cambios
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- Modal de edición de producto -->
	{#if productoEdicionOpen}
		<div
			class="fixed inset-0 bg-black/70 flex items-center justify-center px-4 z-50"
			role="dialog"
			aria-modal="true"
		>
			<div
				class="bg-[#17171b] border-2 border-amber-300 rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
			>
				<p class="font-bold text-lg">Editar producto: {productoEdicion.nombre}</p>

				<label class="flex flex-col gap-1 text-sm">
					Nombre
					<input
						type="text"
						bind:value={productoEdicion.nombre}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
						placeholder="Nombre del producto"
					/>
				</label>

				<label class="flex flex-col gap-1 text-sm">
					Precio
					<input
						type="number"
						bind:value={productoEdicion.precio}
						class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]"
						placeholder="0"
					/>
				</label>

				<label class="flex flex-col gap-1 text-sm">
					Activo
					<select bind:value={productoEdicion.activo} class="bg-[#0a0a0c] border border-[#3a3a3e] rounded-lg px-3 py-2 text-[#f5f0e8]">
						<option value={true}>Sí</option>
						<option value={false}>No</option>
					</select>
				</label>

				<div class="flex gap-3 mt-4">
					<button
						class="flex-1 py-2 rounded-xl border-2 border-[#3a3a3e]"
						onclick={cerrarEdicionProducto}
					>
						Cancelar
					</button>
					<button
						class="flex-1 py-2 rounded-xl border-2 border-amber-300 font-bold"
						onclick={confirmarEdicionProducto}
					>
						Guardar cambios
					</button>
				</div>
			</div>
		</div>
	{/if}

	<BottomNav active={activeTab} onNavigate={(tab) => (activeTab = tab)} />
</div>
