// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../../db'); // promise pool

// Crear carrito nuevo
// POST /carts -> crear carrito nuevo
router.post('/', async (req, res) => {
  const { usuarioId } = req.body;
  if (!usuarioId) return res.status(400).json({ message: 'Falta usuarioId' });

  try {
    const [result] = await db.query(
      "INSERT INTO carts (usuario_id, estado) VALUES (?, 'ABIERTO')",
      [usuarioId]
    );
    const carritoId = result.insertId;
    res.json({ id: carritoId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error creando carrito' });
  }
});

// Obtener carrito por id
router.get('/:id', async (req, res) => {
    const carritoId = req.params.id;

    try {
        const [carritos] = await db.query("SELECT * FROM carts WHERE id = ?", [carritoId]);
        if (!carritos[0]) return res.status(404).json({ message: "Carrito no encontrado" });

        const [items] = await db.query(
            "SELECT ci.*, p.nombre FROM cart_items ci LEFT JOIN products p ON ci.sku = p.sku WHERE carrito_id = ?",
            [carritoId]
        );

        const subtotal = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
        const impuestos = subtotal * 0.21;
        const total = subtotal + impuestos;

        res.json({ ...carritos[0], items, subtotal, impuestos, total });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error obteniendo carrito" });
    }
});

// Agregar item al carrito
router.post('/:id/items', async (req, res) => {
    const carritoId = req.params.id;
    const { sku, cantidad } = req.body;

    if (!sku || !cantidad) return res.status(400).json({ message: "Falta sku o cantidad" });

    try {
        const [result] = await db.query(
            "INSERT INTO cart_items (carrito_id, sku, cantidad) VALUES (?, ?, ?)",
            [carritoId, sku, cantidad]
        );
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error agregando item" });
    }
});

// Eliminar item del carrito
router.delete('/:id/items/:sku', async (req, res) => {
    const carritoId = req.params.id;
    const sku = req.params.sku;

    try {
        await db.query("DELETE FROM cart_items WHERE carrito_id = ? AND sku = ?", [carritoId, sku]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error eliminando item" });
    }
});

module.exports = router;
