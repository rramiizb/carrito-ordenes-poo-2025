// src/services/cerrarCarritoService.js
const { getCarritos } = require("../data/carritoStore");

function cerrarCarrito(carritoId) {
  const carritos = getCarritos();
  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) return null;

  // ❗ Si ya está cerrado, lo devolvemos igual
  if (carrito.estado === "CERRADO") {
    return carrito;
  }

  // ❗ No permitir cerrar carritos vacíos
  if (!carrito.items || carrito.items.length === 0) {
    return { error: "CarritoVacio" };
  }

  // Marcar como cerrado
  carrito.estado = "CERRADO";
  return carrito;
}

module.exports = { cerrarCarrito };
