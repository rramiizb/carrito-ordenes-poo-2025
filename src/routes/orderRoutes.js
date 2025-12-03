// src/routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// 4.5 Crear orden (según enunciado: POST /orders con body)
router.post('/', orderController.crearOrden);

// 4.6 Consultar órdenes (lista) y detalle
router.get('/', orderController.obtenerOrdenes);
router.get('/:id', orderController.obtenerOrdenPorId);

// 4.7 Actualizar estado
router.patch('/:id/estado', orderController.actualizarEstado);

module.exports = router;
