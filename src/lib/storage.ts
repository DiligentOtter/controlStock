// aqui se genera el codigo para asentar la infomacion en local stororage

import type { EstadoApp } from "./data";
import { estadoInicial } from "./data";
const claveStorage:string = "cristobalComunidad"
function guardarEstado(estadoApp:EstadoApp) {
    localStorage.setItem(claveStorage,JSON.stringify(estadoApp));
}

function cargarEstado():EstadoApp {
    const estado = localStorage.getItem(claveStorage);
    if (!estado) {
        return estadoInicial;
    }else return JSON.parse(estado);
}

export{guardarEstado, cargarEstado}