// src/services/inventarioService.js
// Simulación simple del módulo Inventario
// reserveStock devuelve un objeto { reservaId } o lanza error si no hay stock.

const stockSimulado = {
  "BK-001": 10, 
  "TE-002": 2,  
  "TE-003": 5,   
  "RO-004": 3,   
  "BK-005": 3,   
  "TE-006": 1
};

function reservarStock(sku, cantidad, carritoId) {
  console.log(`[Inventario] Solicitud: ${sku} x${cantidad} (Stock actual: ${stockSimulado[sku] ?? 0})`);
  return new Promise((resolve, reject) => {
    const disponible = stockSimulado[sku] ?? 0;
    if (cantidad <= 0) return reject(new Error("Cantidad inválida"));
    if (disponible >= cantidad) {
      // Reducimos stock simulado (reserva temporal)
      stockSimulado[sku] = disponible - cantidad;
      console.log(`[Inventario] Reserva OK. Nuevo stock de ${sku}: ${stockSimulado[sku]}`);
      // Creamos una reservaId simple
      const reservaId = `r-${sku}-${Date.now()}`;
      // Simulamos async
      return resolve({ reservaId, sku, cantidad, expiraEn: new Date(Date.now() + 15*60*1000).toISOString() });
    } else {
      console.log(`[Inventario] Stock insuficiente para ${sku}`);
      return reject(new Error("StockInsuficiente"));
    }
  });
}

function cancelarReservaSimulada(reservaId, sku, cantidad) {
  // Para simplificar, devolvemos el stock (solo en memoria)
  if (sku && typeof cantidad === "number") {
    stockSimulado[sku] = (stockSimulado[sku] ?? 0) + cantidad;
    console.log(`[Inventario] Reserva cancelada. Stock devuelto a ${sku}`);
  }
}

module.exports = { reservarStock, cancelarReservaSimulada };;
