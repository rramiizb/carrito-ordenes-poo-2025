console.log(">> cartRoutes.js cargado");
// src/routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const { crearCarrito, agregarItem, verCarrito, eliminarItem } = require("../controllers/cartController");

// POST /carts
router.post("/carts", crearCarrito);

// POST /carts/:id/items
router.post("/carts/:id/items", agregarItem);

// GET /carts/:id
router.get("/carts/:id", verCarrito);

// DELETE /carts/:id/items/:sku
router.delete("/carts/:id/items/:sku", eliminarItem);


module.exports = router;