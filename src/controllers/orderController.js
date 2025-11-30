// src/controllers/orderController.js
let ordenes = [];

function crearOrden(req, res) {
  const { carrito } = req.body;

  if (!carrito) {
    return res.status(422).json({
      error: "FaltanCampos",
      message: "Se requiere carrito para generar orden"
    });
  }

  // ❗ Validar carrito vacío
  if (!carrito.items || carrito.items.length === 0) {
    return res.status(409).json({
      error: "CarritoVacio",
      message: "No se puede generar una orden con un carrito vacío."
    });
  }

  // ❗ Evitar orden duplicada
  const yaExiste = ordenes.find(o => o.carritoId === carrito.id);
  if (yaExiste) {
    return res.status(409).json({
      error: "OrdenYaExiste",
      message: "Este carrito ya tiene una orden generada."
    });
  }

  const subtotal = carrito.items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const impuestos = Math.round(subtotal * 0.21);
  const total = subtotal + impuestos;

  const nuevaOrden = {
    id: "o" + Math.floor(Math.random() * 999999),
    carritoId: carrito.id,
    items: carrito.items,
    subtotal,
    impuestos,
    total,
    estado: "PENDIENTE_PAGO"
  };

  ordenes.push(nuevaOrden);

  return res.status(201).json({
    id: nuevaOrden.id,
    total
  });
}

module.exports = { crearOrden };
