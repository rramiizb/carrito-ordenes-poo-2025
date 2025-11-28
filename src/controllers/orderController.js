// src/controllers/orderController.js

let ordenes = []; // almacenamiento temporal

function crearOrden(req, res) {
  // Extraemos carrito del body SIN renombrarlo, SIN sombra de variables
  const carrito = req.body.carrito;

  // Validación: falta carrito
  if (!carrito) {
    return res.status(422).json({
      error: "FaltanCampos",
      message: "Se requiere carrito para generar orden"
    });
  }

  // Validación: items inexistentes
  if (!Array.isArray(carrito.items)) {
    return res.status(500).json({
      error: "CarritoSinItems",
      message: "El carrito no contiene un arreglo válido de items."
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
