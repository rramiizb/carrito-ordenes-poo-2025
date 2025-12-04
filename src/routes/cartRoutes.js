// src/routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { listarCarritosUsuario} = require("../controllers/cartController");

// 4.1 Crear carrito
router.post('/', cartController.crearCarrito);

// 4.2 Agregar ítem al carrito
router.post('/:id/items', cartController.agregarItem);

// 4.3 Ver carrito
router.get('/:id', cartController.verCarrito);

// 4.4 Quitar ítem
router.delete('/:id/items/:productId', cartController.eliminarItem);

router.get("/users/:id/carts", listarCarritosUsuario);


module.exports = router;

