// src/services/inventarioService.js
// Simulación simple del módulo Inventario
// reserveStock devuelve un objeto { reservaId } o lanza error si no hay stock.

const stockSimulado = {
  "BK-001": 10,
  "BK-002": 5
};

function reservarStock(sku, cantidad, carritoId) {
  return new Promise((resolve, reject) => {
    const disponible = stockSimulado[sku] ?? 0;
    if (cantidad <= 0) return reject(new Error("Cantidad inválida"));
    if (disponible >= cantidad) {
      // Reducimos stock simulado (reserva temporal)
      stockSimulado[sku] = disponible - cantidad;
      // Creamos una reservaId simple
      const reservaId = `r-${sku}-${Date.now()}`;
      // Simulamos async
      return resolve({ reservaId, sku, cantidad, expiraEn: new Date(Date.now() + 15*60*1000).toISOString() });
    } else {
      return reject(new Error("StockInsuficiente"));
    }
  });
}

function cancelarReservaSimulada(reservaId, sku, cantidad) {
  // Para simplificar, devolvemos el stock (solo en memoria)
  if (sku && typeof cantidad === "number") {
    stockSimulado[sku] = (stockSimulado[sku] ?? 0) + cantidad;
  }
}

module.exports = { reservarStock, cancelarReservaSimulada };
