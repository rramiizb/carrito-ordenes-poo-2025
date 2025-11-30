const db = require('../../db');


async function crearOrden(res, carrito) {
  try {
    const [orderResult] = await db.query(
      `INSERT INTO orders (carrito_id, subtotal, impuestos, total, estado) VALUES (?, ?, ?, ?, 'CERRADO')`,
      [carrito.id, carrito.subtotal, carrito.impuestos, carrito.total]
    );

    const orderId = orderResult.insertId;

    // Insertar items de la orden
    for (const item of carrito.items) {
      await db.query(
        `INSERT INTO order_items (order_id, sku, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [orderId, item.sku, item.cantidad, item.precio]
      );
    }

    res.json({ message: "Orden creada correctamente", orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}


async function obtenerOrdenes(req, res) {
  try {
    const [orders] = await db.query("SELECT * FROM orders ORDER BY id DESC");

    const results = [];
    for (let o of orders) {
      const [items] = await db.query(
        "SELECT oi.*, p.nombre FROM order_items oi LEFT JOIN products p ON oi.sku = p.sku WHERE oi.order_id = ?",
        [o.id]
      );
      items.forEach(i => i.precio_unitario = Number(i.precio_unitario) || 0);
      results.push({
        ...o,
        subtotal: Number(o.subtotal) || 0,
        impuestos: Number(o.impuestos) || 0,
        total: Number(o.total) || 0,
        items
      });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
}

module.exports = { crearOrden, obtenerOrdenes };
