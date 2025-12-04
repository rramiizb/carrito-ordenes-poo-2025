// services/cerrarCarritoService.js
const db = require("../../db");

async function cerrarCarrito(carritoId) {
  try {
    // 1. Validar que el carrito exista y esté abierto
    const [carritos] = await db.query(
      "SELECT * FROM carts WHERE id = ?",
      [carritoId]
    );

    if (!carritos[0]) {
      return { error: "CarritoNoExiste" };
    }

    const carrito = carritos[0];

    if (carrito.estado !== "activo") {
      return { error: "CarritoYaCerrado" };
    }

    // 2. Obtener ítems del carrito
    const [items] = await db.query(
      `SELECT ci.*, p.nombre, p.precio
       FROM cart_items ci
       LEFT JOIN products p ON ci.sku = p.sku
       WHERE ci.carrito_id = ?`,
      [carritoId]
    );

    if (!items.length) {
      return { error: "CarritoVacio" };
    }

    // 3. Validar que todos los productos existan en BD
    for (const item of items) {
      if (!item.precio) {
        return { error: "ProductoInexistente", sku: item.sku };
      }
    }

    // 4. Cálculos numéricos seguros
    const subtotal = items.reduce((acc, i) => {
      return acc + (Number(i.precio) || 0) * (Number(i.cantidad) || 0);
    }, 0);

    const impuestos = Number((subtotal * 0.21).toFixed(2));
    const total = Number((subtotal + impuestos).toFixed(2));

    // 5. Cerrar el carrito en la BD
    await db.query(
      `UPDATE carts 
       SET estado='CERRADO', subtotal=?, impuestos=?, total=? 
       WHERE id=?`,
      [subtotal, impuestos, total, carritoId]
    );

    // 6. Devolver el carrito completo y cerrado
    return {
      ...carrito,
      items,
      subtotal,
      impuestos,
      total,
      estado: "CERRADO",
    };

  } catch (err) {
    console.error("Error cerrando carrito:", err);
    return { error: "ErrorInterno", message: err.message };
  }
}

module.exports = { cerrarCarrito };
