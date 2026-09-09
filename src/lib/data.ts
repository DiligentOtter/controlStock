export interface Insumo{
    id:string;
    nombre:string;
    unidad: 'botella'|'unidad'|'bolsa';
    retornable:boolean;
    stockActual:number;
    enUso?:number;
    minimoCritico:number;
}

export interface Transaccion{
    id:string;
    productoId:string;
    timeStamp:string;
    medioPago: 'efectivo'|'transferencia'|'otro';
    precio:number;
    usuarioId:string|null;
}

export interface Producto{
    id:string;
    nombre:string;
    precio:number;
    activo:boolean;
    ingredientes:Ingrediente[];
}

export interface Ingrediente{
    insumoId: string;
    cantidad: number;
}
export interface EstadoApp{
    productosAc: Producto[];
    insumosAc: Insumo[];
    transacciones: Transaccion[];
}
export const insumosIniciales: Insumo[]=[
    {   
        id:'cocaCola',
        nombre: "cocaCola",
        unidad:'botella',
        retornable:false,
        stockActual:30,
        minimoCritico:3
    },
    {
        id:'fernet',
        nombre: 'Fernet 1L',
        unidad:'botella',
        retornable:false,
        stockActual:30,
        minimoCritico:3
    },
    {
        id:'hielo',
        nombre: "Hielo 1kg",
        unidad:'bolsa',
        retornable:false,
        stockActual:20,
        minimoCritico:3
    },
    {
        id:'jarra1l',
        nombre: "Jarra de 1L",
        unidad:'unidad',
        retornable:true,
        stockActual:20,
        minimoCritico:3
    },
    {
        id:'jarra2l',
        nombre: "Jarra de 2L",
        unidad:'unidad',
        retornable:true,
        stockActual:20,
        minimoCritico:3
    },
    {   id:'vaso500',
        nombre: "Vaso de 500ml",
        unidad:'unidad',
        retornable:false,
        stockActual:400,
        minimoCritico:30
    },
    {        
        id:'vaso200',
        nombre: "Vaso de 200ml",
        unidad:'unidad',
        retornable:false,
        stockActual:200,
        minimoCritico:30
    },
    
]
export const productosIniciales: Producto[] = [
    {
        id: 'jarraFernet1l',
        nombre: 'Fernet 70/30 1L',
        precio: 20000,
        activo: true,
        ingredientes: [
        { insumoId: 'fernet', cantidad: 0.30 },
        { insumoId: 'cocaCola', cantidad: 0.70 },
        { insumoId: 'jarra1l', cantidad: 1 },
        { insumoId: 'hielo', cantidad: 0.2 },
        ],
    },
    {
        id: 'jarraFernet2l',
        nombre: 'Fernet 70/30 2L',
        precio: 30000,
        activo: true,
        ingredientes: [
        { insumoId: 'fernet', cantidad: 0.60 },
        { insumoId: 'cocaCola', cantidad: 1.40 },
        { insumoId: 'jarra2l', cantidad: 1 },
        { insumoId: 'hielo', cantidad: 0.4 },
        ],
    },
    {
        id: 'vasoFernet500ml',
        nombre: 'Vaso de Fernet 70/30 500ml',
        precio: 10000,
        activo: true,
        ingredientes: [
        { insumoId: 'fernet', cantidad: 0.15 },
        { insumoId: 'cocaCola', cantidad: 0.35 },
        { insumoId: 'vaso500', cantidad: 1 },
        { insumoId: 'hielo', cantidad: 0.1 },
        ],
    },
]

export const transaccionesInit: Transaccion[] = [];

export const estadoInicial: EstadoApp={
    productosAc:productosIniciales,
    insumosAc:insumosIniciales,
    transacciones:transaccionesInit,
}
