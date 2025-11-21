// src/data/carritoStore.js

let carritos = []; // almacén en memoria

function getCarritos() {
  return carritos;
}

function setCarritoStore(nuevo) {
  carritos = nuevo;
}

module.exports = { getCarritos, setCarritoStore };
