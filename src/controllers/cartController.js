
// src/controllers/cartController.js
const { reservarStock, cancelarReservaSimulada } = require("../services/inventarioService");

// Datos en memoria (temporal)
const { getCarritos, setCarritoStore } = require("../data/carritoStore");

let carritos = getCarritos();
setCarritoStore(carritos); // aseguramos que ambos usen la MISMA referencia // cada carrito: { id, usuarioId, estado, items: [ { sku, cantidad, precio, reservaId } ] }

// Mock de catálogo (para obtener precio)
const productosMock = {
  "BK-001": { sku: "BK-001", nombre: "Libro POO", precio: 15000 },
  "BK-002": { sku: "BK-002", nombre: "Cuaderno", precio: 2500 }
};

// Crear carrito (ya tenías esto)
function crearCarrito(req, res) {
  const { usuarioId } = req.body;
  if (!usuarioId) return res.status(422).json({ error: "FaltanCampos", message: "usuarioId es requerido" });

  const nuevoCarrito = {
    id: "c" + Math.floor(Math.random() * 999999),
    usuarioId,
    estado: "ABIERTO",
    items: []
  };
  carritos.push(nuevoCarrito);
  res.status(201).json({ id: nuevoCarrito.id, estado: nuevoCarrito.estado });
}

// Agregar ítem al carrito
async function agregarItem(req, res) {
  const carritoId = req.params.id;
  const { sku, cantidad } = req.body;

  if (!sku || typeof cantidad !== "number") {
    return res.status(422).json({ error: "FaltanCampos", message: "sku y cantidad (number) son requeridos" });
  }

  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste", message: "El carrito no existe" });
  if (carrito.estado !== "ABIERTO") return res.status(409).json({ error: "CarritoCerrado", message: "No se puede modificar un carrito cerrado" });

  // Buscar precio en catálogo simulado
  const producto = productosMock[sku];
  if (!producto) return res.status(404).json({ error: "ProductoNoEncontrado", message: "SKU no existe en catálogo simulado" });

  // Intentar reservar stock en Inventario (simulado)
  try {
    const reserva = await reservarStock(sku, cantidad, carritoId);
    // si reserva OK, agregamos item al carrito
    const itemExistente = carrito.items.find(i => i.sku === sku);
    if (itemExistente) {
      // sumar cantidad y mantener reservaId (simplificación: no manejamos reservas múltiples por sku)
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

    // Responder 201 con el item agregado
    const itemResp = carrito.items.find(i => i.sku === sku);
    return res.status(201).json({ sku: itemResp.sku, cantidad: itemResp.cantidad, precio: itemResp.precio, reservaId: itemResp.reservaId });

  } catch (err) {
    // Si reservarStock falla (p. ej. StockInsuficiente), devolvemos 409
    return res.status(409).json({ error: "ReservaFallida", message: err.message });
  }
}

// Ver carrito (calcula subtotal/impuestos/total)
function verCarrito(req, res) {
  const carritoId = req.params.id;
  const carrito = carritos.find(c => c.id === carritoId);
  if (!carrito) return res.status(404).json({ error: "CarritoNoExiste", message: "El carrito no existe" });

  // calcular subtotal
  const subtotal = carrito.items.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
  const impuestos = Math.round(subtotal * 0.21); // 21% IVA, redondeado
  const total = subtotal + impuestos;

  return res.status(200).json({
    id: carrito.id,
    usuarioId: carrito.usuarioId,
    estado: carrito.estado,
    items: carrito.items.map(i => ({ sku: i.sku, cantidad: i.cantidad, precio: i.precio })),
    subtotal,
    impuestos,
    total
  });
}


module.exports = { crearCarrito, agregarItem, verCarrito };