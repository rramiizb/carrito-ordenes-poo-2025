const express = require("express");
const router = express.Router();
const { crearCarrito } = require("../controllers/cartController");

// POST /carts
router.post("/carts", crearCarrito);

module.exports = router;