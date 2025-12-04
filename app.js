const express = require("express");
const app = express();
const path = require("path");

// CARGAR RUTAS PRIMERO
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// usar rutas
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

// arrancar servidor
const PORT = process.env.PORT || 8050;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor iniciado correctamente en http://0.0.0.0:${PORT}`);
});