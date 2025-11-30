// src/controllers/orderController.js
const db = require("../../db");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

async function crearOrden(req, res) {
  try {
    const carritoId = req.params.carritoId;
    const carrito = await cerrarCarrito(carritoId);
    if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });
    if (carrito.error) return res.status(409).json(carrito);

    // Crear orden
    const subtotal = carrito.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const impuestos = Math.round(subtotal * 0.21);
    const total = subtotal + impuestos;

    const [result] = await db.query(
      "INSERT INTO orders (carrito_id, fecha, subtotal, impuestos, total, estado) VALUES (?, NOW(), ?, ?, ?, 'PENDIENTE_PAGO')",
      [carritoId, subtotal, impuestos, total]
    );

    res.status(201).json({ id: result.insertId, total });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

async function obtenerOrdenes(req, res) {
  try {
    const [ordenes] = await db.query("SELECT * FROM orders");
    res.status(200).json(ordenes);
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

module.exports = { crearOrden, obtenerOrdenes };
