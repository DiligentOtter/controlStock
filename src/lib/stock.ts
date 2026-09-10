//esta es como una fat class, tiene todas las responsabilidades de la logica de negocio, 
// y no tiene nada que ver con la UI, ni con la persistencia de datos, ni con la red, ni con nada de eso. 
// Solo se encarga de la logica de negocio.

import type {Insumo, Producto, Transaccion, EstadoApp} from "./data";
import {estadoInicial} from "./data";


function descontarStock(insumoId:string, cantidad:number, estadoActual:EstadoApp): EstadoApp | null{
    const buscInsumo: Insumo | undefined = estadoActual.insumosAc.find(p => p.id === insumoId);

    if(!buscInsumo){
        return null
    }

    const insumosDesc: Insumo[] = estadoActual.insumosAc.map(
        (p)=>{if (p.id === insumoId) {
            if (p.retornable) {
                return {...p,stockActual: p.stockActual - cantidad, enUso: Math.max(0, (p.enUso || 0) + cantidad)}
            }
            return {...p, stockActual: p.stockActual - cantidad}
        }else return p;
    });
    
    return {...estadoActual, insumosAc: insumosDesc};
}


// is this a honest function? we are working with the state of the app, and we are not mutating it, we are returning a new state, 
// so yes, this is a honest function Esta funcion pertenece a otra clase que se encarga de la caja. 
function registrarVenta(
    productoId:string, 
    medioPago:'efectivo'|'transferencia'|'otro',
    estadoActual:EstadoApp, usuarioId:string | null
    ): EstadoApp | null
    {
        const producto: Producto | undefined = estadoActual.productosAc.find((p)=>p.id===productoId);
        if (!producto) {
            return null;
        }

        const nuevaTransaccion: Transaccion ={
            id: `tx-${Date.now()}-${Math.random()}`,
            productoId: producto.id,
            timeStamp: new Date().toISOString(),
            precio: producto.precio,
            medioPago:medioPago,
            usuarioId:usuarioId,
        }
        let nuevoEstado = estadoActual;
        for (const ingrediente of producto.ingredientes) {
            const resultado = descontarStock(ingrediente.insumoId, ingrediente.cantidad, nuevoEstado);
            if (!resultado) {
                return null;
            }
            nuevoEstado = resultado;
        }

        return {...nuevoEstado,transacciones: nuevoEstado.transacciones.concat(nuevaTransaccion)}
    }

function reingresoRetornables(insumoId:string, cantidad:number, estadoActual:EstadoApp): EstadoApp | null{
        const buscInsumo: Insumo | undefined = estadoActual.insumosAc.find(p => p.id === insumoId && p.retornable);
        
        if(!buscInsumo){
            return null
        }
        const insumosReingresados: Insumo[] = estadoActual.insumosAc.map(
            (p)=>{if (p.id === insumoId) {
                return {...p,stockActual: p.stockActual + cantidad, enUso: Math.max(0, (p.enUso || 0) - cantidad)}
            }else return p;
        });
        
        return {...estadoActual, insumosAc: insumosReingresados};
    }

//This is a honest function 
function ingresarInsumo(insumo: Insumo, estadoActual: EstadoApp): EstadoApp {
    const buscInsumo: Insumo | undefined = estadoActual.insumosAc.find(p => p.id === insumo.id);

    if (!buscInsumo) {
        return nuevoInsumo(insumo, estadoActual);
    }
    const insumosActualizados: Insumo[] = estadoActual.insumosAc.map(
        (p) => {
            if (p.id === insumo.id) {
                return { ...p, stockActual: p.stockActual + insumo.stockActual };
            } else {
                return p;
            }
        }
    );
    
    return { ...estadoActual, insumosAc: insumosActualizados };
}
function nuevoInsumo(insumo: Insumo, estadoActual: EstadoApp): EstadoApp {
    const insumosActualizados: Insumo[] = [...estadoActual.insumosAc, insumo];
    return { ...estadoActual, insumosAc: insumosActualizados };
}
//Honest function
function agregarProducto(producto: Producto, estadoActual: EstadoApp): EstadoApp {
    const productosActualizados: Producto[] = [...estadoActual.productosAc, producto];
    return { ...estadoActual, productosAc: productosActualizados };
}

export {descontarStock, registrarVenta, reingresoRetornables, ingresarInsumo, agregarProducto};

/*codigo de prueba, test*/
const newState: EstadoApp | null = registrarVenta("jarraFernet2l", "efectivo", estadoInicial, null);

if (!newState) {
    console.log("La venta falló");
} else {
    console.log(newState.transacciones);
    console.log(newState.insumosAc);
}
