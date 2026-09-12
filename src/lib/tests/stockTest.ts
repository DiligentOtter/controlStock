import type { Producto, EstadoApp } from "../data";
import { registrarVenta } from "../stock";
import { estadoInicial } from "../data";
function testingRegistrarVenta(producto: Producto, estadoInicial: EstadoApp): void {
    const newState: EstadoApp | null = registrarVenta("jarraFernet2l", "efectivo", estadoInicial, null);

    if (!newState) {
    console.log("La venta falló");
    } else {
    console.log(newState.transacciones);
    console.log(newState.insumosAc);
    }
}

testingRegistrarVenta(estadoInicial.productosAc[0], estadoInicial);