// src/controllers/cartController.js
const db = require('../../db');

/**
 * Crear carrito
 * Body: { usuarioId: "..." }
 * Response 201 { id, estado }
 */
async function crearCarrito(req, res) {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(422).json({ error: "FaltanCampos", message: "usuarioId requerido" });

  await pool.query(
    "INSERT INTO carts (id_usuario, estado) VALUES (?, 'activo')",
    [1]
);


    return res.status(201).json({ id: String(result.insertId), estado: "ABIERTO" });
  } catch (err) {
    console.error("crearCarrito:", err);
    return res.status(500).json({ error: "ErrorInterno" });
  }
}

/**
 * Agregar item al carrito
 * POST /carts/:id/items
 * Body: { product_id: 1, cantidad: 2 }
 * Nota: acepta product_id. Si tu frontend envía 'sku' avisame y lo adapto.
 */
async function agregarItem(req, res) {
  try {
    const carritoId = req.params.id;
    const { product_id, cantidad } = req.body;

    if (!product_id || typeof cantidad !== 'number') {
      return res.status(422).json({ error: "FaltanCampos", message: "product_id (int) y cantidad (number) son requeridos" });
    }

    // validar carrito existe y está abierto
    const [carritos] = await db.query("SELECT * FROM carts WHERE id = ?", [carritoId]);
    if (!carritos[0]) return res.status(404).json({ error: "CarritoNoExiste" });
    if (carritos[0].estado !== "ABIERTO") return res.status(409).json({ error: "CarritoCerrado" });

    // validar producto y stock
    const [prods] = await db.query("SELECT id, precio, stock, nombre FROM products WHERE id = ?", [product_id]);
    const producto = prods[0];
    if (!producto) return res.status(404).json({ error: "ProductoNoEncontrado" });

    if (producto.stock < cantidad) {
      return res.status(409).json({ error: "ReservaFallida", message: "Stock insuficiente" });
    }

    // reservar stock (simple: restar)
    await db.query("UPDATE products SET stock = stock - ? WHERE id = ?", [cantidad, product_id]);

    // insertar o actualizar item en cart_items
    // asumimos columnas: id, cart_id, product_id, cantidad, precio_unitario
    await db.query(
      `INSERT INTO cart_items (cart_id, product_id, cantidad, precio_unitario)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE cantidad = cantidad + ?`,
      [carritoId, product_id, cantidad, producto.precio, cantidad]
    );

    return res.status(201).json({
      product_id,
      cantidad,
      nombre: producto.nombre,
      precio: Number(producto.precio)
    });
  } catch (err) {
    console.error("agregarItem:", err);
    return res.status(500).json({ error: "ErrorInterno" });
  }
}

/**
 * Ver carrito
 * GET /carts/:id
 * Response según enunciado
 */
async function verCarrito(req, res) {
  try {
    const carritoId = req.params.id;

    const [carritos] = await db.query("SELECT * FROM carts WHERE id = ?", [carritoId]);
    if (!carritos[0]) return res.status(404).json({ message: "Carrito no encontrado" });

    // Obtener items con nombre y precio_unitario
    const [items] = await db.query(
      `SELECT ci.product_id, ci.cantidad, ci.precio_unitario, p.nombre
       FROM cart_items ci
       LEFT JOIN products p ON ci.product_id = p.id
       WHERE ci.cart_id = ?`,
      [carritoId]
    );

    const subtotal = Number(items.reduce((acc, i) => acc + (Number(i.precio_unitario || 0) * Number(i.cantidad || 0)), 0).toFixed(2));
    const impuestos = Number((subtotal * 0.21).toFixed(2));
    const total = Number((subtotal + impuestos).toFixed(2));

    return res.status(200).json({
      id: String(carritoId),
      items,
      subtotal,
      impuestos,
      total
    });
  } catch (err) {
    console.error("verCarrito:", err);
    return res.status(500).json({ error: "ErrorInterno" });
  }
}

/**
 * Eliminar item del carrito
 * DELETE /carts/:id/items/:productId
 */
async function eliminarItem(req, res) {
  try {
    const carritoId = req.params.id;
    const productId = req.params.productId;

    // comprobar si existe
    const [rows] = await db.query("SELECT cantidad FROM cart_items WHERE cart_id = ? AND product_id = ?", [carritoId, productId]);
    if (!rows[0]) return res.status(404).json({ message: "Item no encontrado" });

    const cantidad = rows[0].cantidad;

    // devolver stock
    await db.query("UPDATE products SET stock = stock + ? WHERE id = ?", [cantidad, productId]);

    // eliminar item
    await db.query("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [carritoId, productId]);

    return res.sendStatus(204);
  } catch (err) {
    console.error("eliminarItem:", err);
    return res.status(500).json({ error: "ErrorInterno" });
  }
}

module.exports = { crearCarrito, agregarItem, verCarrito, eliminarItem };
