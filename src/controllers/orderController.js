// src/controllers/orderController.js
const { getCarritos } = require("../data/carritoStore");

let ordenes = []; // almacenamiento temporal

function crearOrden(req, res) {
  const { carrito } = req.body;

  // Validación: falta carrito
  if (!carrito) {
    return res.status(404).json({
      error: "CarritoNoEncontrado",
      message: "No se encontró el carrito para generar la orden"
    });
  }

  // Validación: carrito vacío
  if (!Array.isArray(carrito.items) || carrito.items.length === 0) {
    return res.status(409).json({
      error: "CarritoVacio",
      message: "No se puede generar una orden con un carrito vacío."
    });
  }

  // Validación: orden duplicada
  const yaExiste = ordenes.find(o => o.carritoId === carrito.id);
  if (yaExiste) {
    return res.status(409).json({
      error: "OrdenYaExiste",
      message: "Este carrito ya tiene una orden generada."
    });
  }

  // Calcular totales
  const subtotal = carrito.items.reduce((acc, it) => acc + it.precio * it.cantidad, 0);
  const impuestos = Math.round(subtotal * 0.21);
  const total = subtotal + impuestos;

  const nuevaOrden = {
    id: "o" + Math.floor(Math.random() * 999999),
    carritoId: carrito.id,
    fecha: new Date().toISOString(),
    items: [...carrito.items],
    subtotal,
    impuestos,
    total,
    estado: "PENDIENTE_PAGO"
  };

  ordenes.push(nuevaOrden);

  // Cerrar carrito y vaciar items
  const original = getCarritos().find(c => c.id === carrito.id);
  if (original) {
    original.estado = "CERRADO";
    original.items = [];
  }

  return res.status(201).json({
    id: nuevaOrden.id,
    total
  });
}

function obtenerOrdenes(req, res) {
  return res.status(200).json(ordenes);
}

module.exports = { crearOrden, obtenerOrdenes };
