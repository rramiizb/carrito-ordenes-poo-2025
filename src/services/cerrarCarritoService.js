const { getCarritos } = require("../data/carritoStore");

function cerrarCarrito(carritoId) {
  const carritos = getCarritos();

  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) return null;

  carrito.estado = "CERRADO";
  return carrito;
}

module.exports = { cerrarCarrito };
