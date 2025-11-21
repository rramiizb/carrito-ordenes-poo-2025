console.log(">> orderRoutes.js cargado");
// src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { verCarrito } = require("../controllers/cartController");
const { crearOrden } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

router.use((req, res, next) => {
  // Si el body está vacío o mal parseado,
  // lo reemplazamos por un objeto vacío para evitar el error.
  if (!req.body) req.body = {};
  next();
});

// Ruta: POST /orders/:carritoId
router.post("/orders/:carritoId", async (req, res) => {
  const carritoId = req.params.carritoId;

  try {
    // 1. Cerrar carrito
    const carritoCerrado = cerrarCarrito(carritoId);
    if (!carritoCerrado) {
      return res.status(404).json({ error: "CarritoNoExiste" });
    }

    // 2. Ver carrito para calcular totales
    const carritoParaOrden = carritoCerrado;

    // 3. Crear orden
    const ordenResp = crearOrden({ body: { carrito: carritoParaOrden } }, res);

  } catch (err) {
    return res.status(500).json({ error: "ErrorInterno", message: err.message });
  }
});

module.exports = router;
