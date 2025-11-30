// src/routes/orderRoutes.js
console.log(">> orderRoutes.js cargado");

const express = require("express");
const router = express.Router();

const { crearOrden } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

// Evitar req.body undefined
router.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

// POST /orders/:carritoId
router.post("/orders/:carritoId", (req, res) => {
  try {
    const carritoId = req.params.carritoId;

    // 1) Cerrar carrito
    const cerrado = cerrarCarrito(carritoId);

    if (!cerrado) {
      return res.status(404).json({ error: "CarritoNoExiste" });
    }

    // Si la función devolvió error porque estaba vacío
    if (cerrado.error === "CarritoVacio") {
      return res.status(409).json({
        error: "CarritoVacio",
        message: "No se puede generar orden de un carrito vacío"
      });
    }

    // 2) Crear orden
    return crearOrden({ body: { carrito: cerrado } }, res);

  } catch (err) {
    console.error("Error en POST /orders:", err);
    return res.status(500).json({
      error: "ErrorInterno",
      message: err.message
    });
  }
});

module.exports = router;
