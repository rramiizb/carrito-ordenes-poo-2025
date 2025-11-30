const express = require("express");
const router = express.Router();
const { crearOrden, obtenerOrdenes } = require("../controllers/orderController");
const { cerrarCarrito } = require("../services/cerrarCarritoService");

// Obtener todas las órdenes
router.get("/", obtenerOrdenes);

// Crear orden a partir de un carrito
router.post("/:carritoId", async (req, res) => {
    try {
        const carritoId = req.params.carritoId;
        const carritoCerrado = await cerrarCarrito(carritoId);

        if (!carritoCerrado || carritoCerrado.error) {
            return res.status(404).json({ error: carritoCerrado?.error || "CarritoNoExiste" });
        }

        if (!carritoCerrado.items || carritoCerrado.items.length === 0) {
            return res.status(409).json({ error: "CarritoVacio", message: "No se puede generar orden de un carrito vacío" });
        }

        // Aseguramos que req.body exista
        req.body = req.body || {};
        req.body.carrito = carritoCerrado;

        // Llamamos a crearOrden con req y res
        return crearOrden(req, res);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "ErrorInterno", message: err.message });
    }
});

module.exports = router;
