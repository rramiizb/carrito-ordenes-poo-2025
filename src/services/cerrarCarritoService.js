// src/services/cerrarCarritoService.js
const db = require("../../db");

async function cerrarCarrito(carritoId) {
  if (!carritoId) return null;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Buscar carrito
    const [carritos] = await conn.query(
      "SELECT * FROM carts WHERE id = ? FOR UPDATE", 
      [carritoId]
    );
    const carrito = carritos[0];
    if (!carrito) {
      await conn.rollback();
      return null;
    }

    // Obtener items
    const [items] = await conn.query(
      "SELECT ci.*, p.nombre FROM cart_items ci LEFT JOIN products p ON ci.sku = p.sku WHERE carrito_id = ?", 
      [carritoId]
    );

    if (!items || items.length === 0) {
      await conn.rollback();
      return { error: "CarritoVacio" };
    }

    if (carrito.estado === "CERRADO") {
      await conn.commit();
      carrito.items = items;
      return carrito;
    }

    // Marcar como cerrado
    await conn.query("UPDATE carts SET estado = 'CERRADO' WHERE id = ?", [carritoId]);
    await conn.commit();

    carrito.items = items;
    carrito.estado = "CERRADO";
    return carrito;

  } catch (err) {
    try { await conn.rollback(); } catch(e) {}
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { cerrarCarrito };
