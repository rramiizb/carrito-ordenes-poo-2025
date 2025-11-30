// src/services/inventarioService.js
const db = require("../../db");

async function reservarStock(sku, cantidad, carritoId) {
  if (!sku || typeof cantidad !== "number" || cantidad <= 0) {
    throw new Error("Cantidad inválida");
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // SELECT ... FOR UPDATE para evitar race conditions
    const [rows] = await conn.query("SELECT stock FROM products WHERE sku = ? FOR UPDATE", [sku]);
    const disponible = (rows[0] && rows[0].stock) ? rows[0].stock : 0;

    if (disponible < cantidad) {
      await conn.rollback();
      throw new Error("StockInsuficiente");
    }

    const nuevoStock = disponible - cantidad;
    await conn.query("UPDATE products SET stock = ? WHERE sku = ?", [nuevoStock, sku]);

    await conn.commit();

    const reservaId = `r-${sku}-${Date.now()}`;
    console.log(`[Inventario] Reserva OK ${sku} x${cantidad}. ReservaId=${reservaId} (stock restante: ${nuevoStock})`);

    return { reservaId, sku, cantidad, expiraEn: new Date(Date.now() + 15*60*1000).toISOString() };
  } catch (err) {
    try { await conn.rollback(); } catch(e){/* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function cancelarReservaSimulada(reservaId, sku, cantidad) {
  if (!sku || typeof cantidad !== "number" || cantidad <= 0) return;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    // Sumar de vuelta el stock
    await conn.query("UPDATE products SET stock = stock + ? WHERE sku = ?", [cantidad, sku]);
    await conn.commit();
    console.log(`[Inventario] Reserva cancelada. Stock devuelto a ${sku} (+${cantidad})`);
  } catch (err) {
    try { await conn.rollback(); } catch(e){/* ignore */ }
    console.error("Error al cancelar reserva:", err.message);
  } finally {
    conn.release();
  }
}

module.exports = { reservarStock, cancelarReservaSimulada };
