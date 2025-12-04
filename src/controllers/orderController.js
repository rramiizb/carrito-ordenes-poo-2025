// src/controllers/orderController.js
const db = require('../../db');
const { cerrarCarrito } = require('../services/cerrarCarritoService'); // si lo tenés

// Crear orden a partir de body { carritoId, direccionEnvio, modalidadEnvio, metodoPago }
async function crearOrden(req, res) {
  try {
    const { carritoId, direccionEnvio, modalidadEnvio, metodoPago } = req.body;

    if (!carritoId) return res.status(422).json({ error: "FaltanCampos", message: "carritoId requerido" });

    // cerrar carrito
    const resultado = await cerrarCarrito(carritoId);
    if (resultado?.error) {
      if (resultado.error === "CarritoNoExiste") return res.status(404).json({ error: "CarritoNoExiste" });
      if (resultado.error === "CarritoVacio") return res.status(409).json({ error: "CarritoVacio" });
      return res.status(500).json({ error: "ErrorInterno", message: resultado.message });
    }

    const carrito = resultado; // items, subtotal, impuestos, total

    // Asegurarse que los totales sean números
    const total = Number(carrito.total || 0);

   const [orderResult] = await db.query(
  `INSERT INTO orders (id_usuario, total, estado)
   VALUES (?, ?, 'PENDIENTE_PAGO')`,
  [carrito.id_usuario, carrito.total]
);

    const orderId = orderResult.insertId;

    // Insertar order_items
    for (const it of carrito.items) {
      const productId = it.product_id;
      const cantidad = Number(it.cantidad || 0);
      const precio_unitario = Number(it.precio_unitario || it.precio || 0);

      await db.query(
        `INSERT INTO order_items (order_id, product_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [orderId, productId, cantidad, precio_unitario]
      );
    }

    return res.status(201).json({ id: String(orderId), estado: "PENDIENTE_PAGO", total });

  } catch (err) {
    console.error("crearOrden:", err);
    return res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}

// Obtener todas las órdenes
async function obtenerOrdenes(req, res) {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");

    const results = [];
    for (const o of orders) {
      const [items] = await db.query(
        `SELECT oi.product_id, oi.cantidad, oi.precio_unitario, p.nombre
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [o.id]
      );

      results.push({
        id: String(o.id),
        cart_id: String(o.cart_id),
        subtotal: Number(o.subtotal || 0),
        impuestos: Number(o.impuestos || 0),
        total: Number(o.total || 0),
        estado: o.estado,
        direccion_envio: o.direccion_envio || null,
        modalidad_envio: o.modalidad_envio || null,
        metodo_pago: o.metodo_pago || null,
        items
      });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error("obtenerOrdenes:", err);
    return res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}

// Obtener orden por id
async function obtenerOrdenPorId(req, res) {
  try {
    const id = req.params.id;
    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [id]);
    if (!orders[0]) return res.status(404).json({ error: "OrdenNoExiste" });

    const o = orders[0];
    const [items] = await db.query(
      `SELECT oi.product_id, oi.cantidad, oi.precio_unitario, p.nombre
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id]
    );

    return res.status(200).json({
      id: String(o.id),
      cart_id: String(o.cart_id),
      subtotal: Number(o.subtotal || 0),
      impuestos: Number(o.impuestos || 0),
      total: Number(o.total || 0),
      estado: o.estado,
      direccion_envio: o.direccion_envio || null,
      modalidad_envio: o.modalidad_envio || null,
      metodo_pago: o.metodo_pago || null,
      items
    });
  } catch (err) {
    console.error("obtenerOrdenPorId:", err);
    return res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}

/**
 * PATCH /orders/:id/estado
 * Body: { estado: "PAGADA" }
 * Allowed states: PENDIENTE_PAGO, PAGADA, ENVIADA, ENTREGADA, CANCELADA
 */
async function actualizarEstado(req, res) {
  try {
    const id = req.params.id;
    const { estado } = req.body;
    const allowed = ["PENDIENTE_PAGO", "PAGADA", "ENVIADA", "ENTREGADA", "CANCELADA"];
    if (!allowed.includes(estado)) return res.status(422).json({ error: "EstadoInvalido" });

    // (Aquí podrías validar transiciones si hace falta)
    const [result] = await db.query("UPDATE orders SET estado = ? WHERE id = ?", [estado, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "OrdenNoExiste" });

    return res.status(200).json({ id: String(id), estado });
  } catch (err) {
    console.error("actualizarEstado:", err);
    return res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}

module.exports = { crearOrden, obtenerOrdenes, obtenerOrdenPorId, actualizarEstado };
