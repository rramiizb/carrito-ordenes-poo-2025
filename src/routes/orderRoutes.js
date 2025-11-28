console.log(">> orderRoutes.js cargado");

const express = require("express");
const router = express.Router();

const { crearOrden } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

// Middleware para evitar body undefined
router.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

// POST /orders/:carritoId
router.post("/orders/:carritoId", async (req, res) => {
  try {
    const carritoId = req.params.carritoId;

    // 1) Cerrar carrito
    const carritoCerrado = cerrarCarrito(carritoId);
    if (!carritoCerrado) {
      return res.status(404).json({ error: "CarritoNoExiste" });
    }

    // 2) Validar carrito vacío
    if (!carritoCerrado.items || carritoCerrado.items.length === 0) {
      return res.status(409).json({
        error: "CarritoVacio",
        message: "No se puede generar una orden con un carrito vacío."
      });
    }

    // 3) Crear orden
    return crearOrden({ body: { carrito: carritoCerrado } }, res);

  } catch (err) {
    console.error("Error en POST /orders:", err);
    return res.status(500).json({
      error: "ErrorInterno",
      message: err.message
    });
  }
});

module.exports = router;
