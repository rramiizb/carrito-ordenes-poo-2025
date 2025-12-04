// app.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const https = require("https");

const app = express();

// --- RUTAS ---
const cartRoutes = require("./src/routes/cartRoutes");
const orderRoutes = require("./src/routes/orderRoutes");

// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ARCHIVOS ESTÁTICOS ---
app.use(express.static(path.join(__dirname, 'public')));

// --- USO DE RUTAS ---
app.use("/carts", cartRoutes);
app.use("/orders", orderRoutes);

// --- HTTPS CONFIG ---
const privateKey = fs.readFileSync("/etc/letsencrypt/live/poo2025.unsada.edu.ar/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/poo2025.unsada.edu.ar/fullchain.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };

// Puerto 
const PORT = 8050;

const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server running on port ${PORT}`);
});
