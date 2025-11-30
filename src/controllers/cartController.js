// src/controllers/cartController.js
const db = require("../../db");

async function crearCarrito(req, res) {
  try {
    const { usuarioId } = req.body;
    if (!usuarioId) return res.status(422).json({ error: "FaltanCampos" });

    const [result] = await db.query(
      "INSERT INTO carts (usuario_id, estado) VALUES (?, 'ABIERTO')", 
      [usuarioId]
    );
    res.status(201).json({ id: result.insertId, estado: 'ABIERTO' });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

async function agregarItem(req, res) {
  try {
    const carritoId = req.params.id;
    const { sku, cantidad } = req.body;

    if (!sku || typeof cantidad !== "number") {
      return res.status(422).json({ error: "FaltanCampos" });
    }

    // Validar carrito abierto
    const [carritos] = await db.query("SELECT * FROM carts WHERE id = ?", [carritoId]);
    if (!carritos[0]) return res.status(404).json({ error: "CarritoNoExiste" });
    if (carritos[0].estado !== "ABIERTO") return res.status(409).json({ error: "CarritoCerrado" });

    // Validar producto
    const [prods] = await db.query("SELECT * FROM products WHERE sku = ?", [sku]);
    if (!prods[0]) return res.status(404).json({ error: "ProductoNoEncontrado" });

    // Insertar item
    await db.query(
      "INSERT INTO cart_items (carrito_id, sku, cantidad) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE cantidad = cantidad + ?",
      [carritoId, sku, cantidad, cantidad]
    );

    res.status(201).json({ sku, cantidad, nombre: prods[0].nombre, precio: prods[0].precio });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

async function verCarrito(req, res) {
  try {
    const carritoId = req.params.id;
    const [carritos] = await db.query("SELECT * FROM carts WHERE id = ?", [carritoId]);
    if (!carritos[0]) return res.status(404).json({ error: "CarritoNoExiste" });

    const [items] = await db.query(
      "SELECT ci.*, p.nombre, p.precio FROM cart_items ci LEFT JOIN products p ON ci.sku = p.sku WHERE ci.carrito_id = ?", 
      [carritoId]
    );

    const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
    const impuestos = Math.round(subtotal * 0.21);
    const total = subtotal + impuestos;

    res.status(200).json({ ...carritos[0], items, subtotal, impuestos, total });

  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

async function eliminarItem(req, res) {
  try {
    const carritoId = req.params.id;
    const sku = req.params.sku;
    await db.query("DELETE FROM cart_items WHERE carrito_id = ? AND sku = ?", [carritoId, sku]);
    res.status(200).json({ message: "Item eliminado" });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno" });
  }
}

module.exports = { crearCarrito, agregarItem, verCarrito, eliminarItem };
