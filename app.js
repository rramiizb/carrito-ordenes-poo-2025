const express = require("express");
const app = express();

app.use(express.json());


// importar rutas
const cartRoutes = require("./src/routes/cartRoutes");

// usar rutas
app.use(cartRoutes);

app.get("/", (req, res) => {
    res.json({ mensaje: "Carrito & Órdenes funcionando!" });
});

const orderRoutes = require("./src/routes/orderRoutes");
app.use(orderRoutes);

// Iniciar servidor
app.listen(3000, () => {
    console.log("Servidor Carrito & Órdenes en puerto 3000");
});




