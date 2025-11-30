// src/data/ordenesStore.js
// Almacén en memoria para las órdenes confirmadas

const ordenes = [];

function getOrdenes() {
    return ordenes;
}

module.exports = { getOrdenes };