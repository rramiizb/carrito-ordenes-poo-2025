// app.js
const express = require("express");
const app = express();
const path = require("path");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// rutas
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

// arrancar servidor
const PORT = 8050;
app.listen(PORT, () => {
    console.log("------------------------------------------------");
    console.log(`Servidor iniciado correctamente en http://localhost:${PORT}`);
    console.log("------------------------------------------------");
});