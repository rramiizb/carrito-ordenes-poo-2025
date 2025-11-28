const { getCarritos } = require("../data/carritoStore");

function cerrarCarrito(carritoId) {
  const carritos = getCarritos();

  // 1) Buscar carrito
  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) return null;

  // 2) Si ya estaba cerrado, lo devolvemos igual
  if (carrito.estado === "CERRADO") {
    return carrito;
  }

  // 3) Cerrarlo
  carrito.estado = "CERRADO";
  return carrito;
}

module.exports = { cerrarCarrito };
 