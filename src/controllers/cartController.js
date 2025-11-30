// src/controllers/cartController.js
const { reservarStock, cancelarReservaSimulada } = require("../services/inventarioService");
const { getCarritos } = require("../data/carritoStore");

// Referencia única al store en memoria
let carritos = getCarritos();

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
    return res.status(422).json({
      error: "FaltanCampos",
      message: "usuarioId es requerido"
    });
  }

  const nuevoCarrito = {
    id: "c" + Math.floor(Math.random() * 999999),
    usuarioId,
    estado: "ABIERTO",
    items: []
  };

  getCarritos().push(nuevoCarrito);

  return res.status(201).json({
    id: nuevoCarrito.id,
    estado: nuevoCarrito.estado
  });
}

// Agregar ítem
async function agregarItem(req, res) {
  const carritoId = req.params.id;
  const { sku, cantidad } = req.body;

  if (!sku || typeof cantidad !== "number") {
    return res.status(422).json({
      error: "FaltanCampos",
      message: "sku y cantidad (number) son requeridos"
    });
  }

  if (cantidad <= 0) {
    return res.status(422).json({
      error: "CantidadInvalida",
      message: "La cantidad debe ser mayor a cero."
    });
  }

  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) {
    return res.status(404).json({ error: "CarritoNoExiste" });
  }

  if (carrito.estado !== "ABIERTO") {
    return res.status(409).json({
      error: "CarritoCerrado",
      message: "No se puede modificar un carrito cerrado"
    });
  }

  const producto = productosMock[sku];
  if (!producto) {
    return res.status(404).json({
      error: "ProductoNoEncontrado",
      message: `El SKU '${sku}' no existe en el catálogo`
    });
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

    return res.status(201).json({
      sku,
      cantidad,
      precio: producto.precio
    });

  } catch (err) {
    return res.status(409).json({
      error: "ReservaFallida",
      message: err.message
    });
  }
}

// Eliminar ítem + restaurar stock
function eliminarItem(req, res) {
  const carritoId = req.params.id;
  const sku = req.params.sku;

  const carrito = getCarritos().find(c => c.id === carritoId);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });

  const itemABorrar = carrito.items.find(item => item.sku === sku);
  if (!itemABorrar) {
    return res.status(404).json({ error: "ItemNoEncontrado" });
  }

  cancelarReservaSimulada(itemABorrar.reservaId, itemABorrar.sku, itemABorrar.cantidad);

  carrito.items = carrito.items.filter(item => item.sku !== sku);

  return res.status(200).json({
    message: "Item eliminado y stock restaurado",
    items: carrito.items
  });
}

// Ver carrito
function verCarrito(req, res) {
  const carritoId = req.params.id;
  const carrito = carritos.find(c => c.id === carritoId);

  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste" });

  const itemsConNombre = carrito.items.map(item => {
    const datos = productosMock[item.sku];
    return {
      sku: item.sku,
      cantidad: item.cantidad,
      precio: item.precio,
      nombre: datos ? datos.nombre : item.sku
    };
  });

  const subtotal = carrito.items.reduce(
    (acc, i) => acc + i.precio * i.cantidad,
    0
  );
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

module.exports = {
  crearCarrito,
  agregarItem,
  verCarrito,
  eliminarItem
};
