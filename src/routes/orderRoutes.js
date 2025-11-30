const express = require("express");
const router = express.Router();
const { crearOrden, obtenerOrdenes } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

// Crear orden a partir de un carrito
// orderRoutes.js
router.post("/:carritoId", async (req, res) => {
  try {
    const carritoId = req.params.carritoId;
    const carritoCerrado = await cerrarCarrito(carritoId);

    if (!carritoCerrado || carritoCerrado.error) {
      return res.status(404).json({ error: carritoCerrado?.error || "CarritoNoExiste" });
    }

    return crearOrden(res, carritoCerrado);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
});
// Obtener todas las órdenes
router.get("/", obtenerOrdenes);

module.exports = router;
