
<script lang="ts">
	// $app/paths resolve for static adapter links
import { resolve } from '$app/paths';
	// $state reactive declarations for Svelte 5 reactivity
	let productoSeleccionado = $state<string | null>(null);
	let medioPagoSeleccionado = $state<string | null>(null);

	function seleccionarProducto(nombre: string) {
		productoSeleccionado = nombre;
		medioPagoSeleccionado = null;
	}

	function seleccionarPago(tipo: string) {
		medioPagoSeleccionado = tipo;
	}
</script>


<header>
	<h1>Caja — Stand Scout Hola</h1>
	<nav aria-label="Secciones">
		<ul>
			<li><a href={resolve('/stock')} rel="noopener noreferrer">Stock</a></li>
			<li><a href={resolve('/cierre')} rel="noopener noreferrer">Cierre</a></li>
		</ul>
	</nav>
</header>

<main>
	<section aria-label="Productos">
		<h2>Productos</h2>
		<ul>
			<li><button type="button" onclick={() => seleccionarProducto('Jarra de Fernet — $5000')} class={productoSeleccionado === 'Jarra de Fernet — $5000' ? 'selected' : ''}>Jarra de Fernet — $5000</button></li>
			<li><button type="button" onclick={() => seleccionarProducto('Vaso de Fernet — $2500')} class={productoSeleccionado === 'Vaso de Fernet — $2500' ? 'selected' : ''}>Vaso de Fernet — $2500</button></li>
			<li><button type="button" onclick={() => seleccionarProducto('Agua — $1000')} class={productoSeleccionado === 'Agua — $1000' ? 'selected' : ''}>Agua — $1000</button></li>
		</ul>
	</section>

	<section aria-label="Medio de pago">
		<h2>Medio de pago</h2>
		<div role="group" aria-label="Medio de pago">
			<button type="button" onclick={() => seleccionarPago('efectivo')} class={medioPagoSeleccionado === 'efectivo' ? 'selected' : ''}>Efectivo</button>
			<button type="button" onclick={() => seleccionarPago('transferencia')} class={medioPagoSeleccionado === 'transferencia' ? 'selected' : ''}>Transferencia</button>
			<button type="button" onclick={() => seleccionarPago('otro')} class={medioPagoSeleccionado === 'otro' ? 'selected' : ''}>Otro</button>
		</div>
	</section>

	<section aria-label="Venta actual">
		<h2>Venta actual</h2>
		<p>{productoSeleccionado !== null && medioPagoSeleccionado !== null ? `Venta: ${productoSeleccionado} — ${medioPagoSeleccionado}` : `Seleccioná un producto y un medio de pago`}</p>
		<button type="button" disabled={productoSeleccionado === null || medioPagoSeleccionado === null}>Confirmar venta</button>
	</section>
</main>



<aside aria-label="Estado de stock">
	<h2>Estado</h2>
	<p>Semáforo informativo — no bloquea</p>
</aside>
