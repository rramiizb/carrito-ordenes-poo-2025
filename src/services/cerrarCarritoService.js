const db = require('../../db');

async function cerrarCarrito(carritoId) {
  try {
    const [carritos] = await db.query(
      "SELECT * FROM carts WHERE id = ? AND estado = 'ABIERTO'",
      [carritoId]
    );
    if (!carritos[0]) return { error: "CarritoNoExiste" };
    const carrito = carritos[0];

    const [items] = await db.query(
      `SELECT ci.*, p.nombre, p.precio
       FROM cart_items ci
       LEFT JOIN products p ON ci.sku = p.sku
       WHERE ci.carrito_id = ?`,
      [carritoId]
    );
    if (!items.length) return { error: "CarritoVacio" };

    // Convertir precios a número
    const subtotal = items.reduce((acc, i) => acc + (Number(i.precio) || 0) * (Number(i.cantidad) || 0), 0);
    const impuestos = Number((subtotal * 0.21).toFixed(2));
    const total = Number((subtotal + impuestos).toFixed(2));

    // Actualizar carrito en BD
    await db.query(
      `UPDATE carts SET estado='CERRADO', subtotal=?, impuestos=?, total=? WHERE id=?`,
      [subtotal, impuestos, total, carritoId]
    );

    return { ...carrito, items, subtotal, impuestos, total, estado: 'CERRADO' };

  } catch (err) {
    console.error(err);
    return { error: "ErrorInterno", message: err.message };
  }
}

module.exports = { cerrarCarrito };
