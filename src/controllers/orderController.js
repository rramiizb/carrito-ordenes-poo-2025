// src/controllers/orderController.js
const { getCarritos } = require("../data/carritoStore");

let ordenes = []; // almacenamiento temporal

function crearOrden(req, res) {
  const carritoId = req.params.carritoId;
  const carrito = getCarritos().find(c => c.id === carritoId);

  // Validación: falta carrito (o no existe)
  if (!carrito) {
    return res.status(404).json({
      error: "CarritoNoEncontrado",
      message: "No se encontró el carrito para generar la orden"
    });
  }

  // Validación: items inexistentes o vacíos
  if (!Array.isArray(carrito.items) || carrito.items.length === 0) {
    return res.status(422).json({
      error: "CarritoSinItems",
      message: "El carrito no contiene items para generar la orden."
    });
  }

  // Validación: Orden ya generada
  const existe = ordenes.find(o => o.carritoId === carrito.id);
  if (existe) {
    return res.status(409).json({
      error: "OrdenYaExiste",
      message: "Este carrito ya tiene una orden generada previamente."
    });
  }

  // Cálculos finales
  const subtotal = carrito.items.reduce(
    (acc, it) => acc + (it.precio * it.cantidad),
    0
  );
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

  carrito.estado = "CERRADO";
  carrito.items = [];

  return res.status(201).json({
    id: nuevaOrden.id,
    total
  });
}

function obtenerOrdenes(req, res) {
    res.status(200).json(ordenes);
}

module.exports = { crearOrden, obtenerOrdenes };