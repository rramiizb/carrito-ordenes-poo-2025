// src/controllers/cartController.js
const { reservarStock } = require("../services/inventarioService");
const { getCarritos } = require("../data/carritoStore");

// --- MOCK DE CATÁLOGO ---
const productosMock = {
  "BK-001": { sku: "BK-001", nombre: "Libro POO Avanzado", precio: 15000 },
  "TE-002": { sku: "TE-002", nombre: "Teclado Mecánico", precio: 45000 },
  "TE-003": { sku: "TE-003", nombre: "Mouse Gamer", precio: 12000 },
  "RO-004": { sku: "RO-004", nombre: "Remera Dev", precio: 8000 },
  "BK-005": { sku: "BK-005", nombre: "Clean Code", precio: 22000 },
  "TE-006": { sku: "TE-006", nombre: 'Monitor 24"', precio: 120000 }
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
  if (!producto) {
    return res.status(404).json({ error: "ProductoNoEncontrado", message: `El SKU ${sku} no existe` });
  }

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
        nombre: producto.nombre, 
        reservaId: reserva.reservaId
      });
    }

    return res.status(201).json(carrito.items.find(i => i.sku === sku));

  } catch (err) {
    return res.status(409).json({ error: "ReservaFallida", message: err.message });
  }
}

// Eliminar item
function eliminarItem(req, res) {
  const carritoId = req.params.id;
  const sku = req.params.sku;

  const carrito = getCarritos().find(c => c.id === carritoId);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });

  const originalLen = carrito.items.length;
  carrito.items = carrito.items.filter(item => item.sku !== sku);

  if (carrito.items.length === originalLen) {
    return res.status(404).json({ error: "ItemNoEncontrado" });
  }

  return res.status(200).json({ message: "Item eliminado", items: carrito.items });
}

function verCarrito(req, res) {
  const carrito = getCarritos().find(c => c.id === req.params.id);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });

  const itemsConNombre = carrito.items.map(item => {
    const infoReal = productosMock[item.sku];
    return {
      sku: item.sku,
      cantidad: item.cantidad,
      precio: item.precio,
      nombre: infoReal ? infoReal.nombre : item.sku 
    };
  });

  const subtotal = carrito.items.reduce((acc, i) => acc + i.precio * i.cantidad, 0);
  const impuestos = Math.round(subtotal * 0.21);
  const total = subtotal + impuestos;

  return res.status(200).json({
    id: carrito.id,
    usuarioId: carrito.usuarioId,
    estado: carrito.estado,
    items: itemsConNombre,
    subtotal,
    impuestos,
    total
  });
}

module.exports = { crearCarrito, agregarItem, verCarrito, eliminarItem };