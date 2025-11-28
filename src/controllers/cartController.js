// src/controllers/cartController.js
const { reservarStock } = require("../services/inventarioService");
const { getCarritos } = require("../data/carritoStore");

// Mock catálogo
const productosMock = {
  "BK-001": { sku: "BK-001", nombre: "Libro POO", precio: 15000 },
  "BK-002": { sku: "BK-002", nombre: "Cuaderno", precio: 2500 }
};

// Crear carrito
function crearCarrito(req, res) {
  const { usuarioId } = req.body;
  if (!usuarioId) {
    return res.status(422).json({ error: "FaltanCampos", message: "usuarioId es requerido" });
  }

  const nuevoCarrito = {
    id: "c" + Math.floor(Math.random() * 999999),
    usuarioId,
    estado: "ABIERTO",
    items: []
  };

  getCarritos().push(nuevoCarrito);

  return res.status(201).json({ id: nuevoCarrito.id, estado: nuevoCarrito.estado });
}

// Agregar item
async function agregarItem(req, res) {
  const carritoId = req.params.id;
  const { sku, cantidad } = req.body;

  if (!sku || typeof cantidad !== "number" || cantidad <= 0) {
    return res.status(422).json({ error: "CantidadInvalida" });
  }

  const carrito = getCarritos().find(c => c.id === carritoId);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });
  if (carrito.estado !== "ABIERTO") return res.status(409).json({ error: "CarritoCerrado" });

  const producto = productosMock[sku];
  if (!producto) return res.status(404).json({ error: "ProductoNoEncontrado" });

  try {
    const reserva = await reservarStock(sku, cantidad, carritoId);

    const itemExistente = carrito.items.find(i => i.sku === sku);
    if (itemExistente) {
      itemExistente.cantidad += cantidad;
      itemExistente.reservaId = reserva.reservaId;
    } else {
      carrito.items.push({
        sku,
        cantidad,
        precio: producto.precio,
        reservaId: reserva.reservaId
      });
    }

    return res.status(201).json(carrito.items.find(i => i.sku === sku));

  } catch (err) {
    return res.status(409).json({ error: "ReservaFallida", message: err.message });
  }
}

// Ver carrito
function verCarrito(req, res) {
  const carrito = getCarritos().find(c => c.id === req.params.id);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });

  const subtotal = carrito.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const impuestos = Math.round(subtotal * 0.21);
  const total = subtotal + impuestos;

  return res.status(200).json({
    id: carrito.id,
    usuarioId: carrito.usuarioId,
    estado: carrito.estado,
    items: carrito.items,
    subtotal,
    impuestos,
    total
  });
}

module.exports = { crearCarrito, agregarItem, verCarrito };
