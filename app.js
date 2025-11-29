const express = require("express");
const app = express();
const path = require("path"); 

app.use(express.json());

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'public')));

// importar rutas
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

// usar rutas API
app.use(cartRoutes);
app.use(orderRoutes);

/* app.get("/", (req, res) => {
    res.json({ mensaje: "Carrito & Órdenes funcionando!" });
}); */

// Iniciar servidor
app.listen(3000, () => {
    console.log("------------------------------------------------");
    console.log("Servidor iniciado correctamente");
    console.log("Abrí en tu navegador: http://localhost:3000");
    console.log("------------------------------------------------");
});