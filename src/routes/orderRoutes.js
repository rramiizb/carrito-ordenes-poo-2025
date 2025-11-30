console.log(">> orderRoutes.js cargado");

const express = require("express");
const router = express.Router();

const { crearOrden, obtenerOrdenes } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

router.use((req, res, next) => {
  if (!req.body) req.body = {};
  next();
});

router.get("/orders", obtenerOrdenes);

router.post("/orders/:carritoId", async (req, res) => {
  try {
    const carritoId = req.params.carritoId;

    const carritoCerrado = cerrarCarrito(carritoId);

    if (!carritoCerrado) {
        return res.status(404).json({ error: "CarritoNoExiste" });
    }

    if (!carritoCerrado.items || carritoCerrado.items.length === 0) {
      return res.status(409).json({
        error: "CarritoVacio",
        message: "No se puede generar una orden con un carrito vacío."
      });
    }

    const fakeReq = {
        body: { carrito: carritoCerrado },
        params: req.params 
    };

    return crearOrden(fakeReq, res);

  } catch (err) {
    console.error("Error en POST /orders:", err);
    return res.status(500).json({
      error: "ErrorInterno",
      message: err.message
    });
  }
});

module.exports = router;