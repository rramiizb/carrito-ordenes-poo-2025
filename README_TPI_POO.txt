✅ 1. README COMPLETO (versión final profesional)

Listo para copiar y pegar directamente como README.md en tu repositorio.


# 📦 Carrito & Órdenes — Módulo del TP Integrador (POO 2025)

Este módulo forma parte del Trabajo Práctico Integrador 2025 y se encarga de gestionar el carrito de compras, las reservas de stock y la generación de órdenes con cálculo automático de precios, impuestos y totales.

La arquitectura está pensada para integrarse con otros módulos del sistema:

Catálogo → obtiene información de productos

Inventario → gestiona reservas y stock

Carrito & Órdenes (este módulo) → procesa compras


## 🚀 Tecnologías utilizadas

Node.js

Express

JavaScript (CommonJS)

Thunder Client / Postman (pruebas)

MySQL (pendiente de integración real)


## 📁 Estructura del proyecto
src/
│
├── controllers/         → lógica de carrito y órdenes
│   ├── cartController.js
│   └── orderController.js
│
├── routes/              → rutas de la API
│   ├── cartRoutes.js
│   └── orderRoutes.js
│
├── services/            → servicios internos (stock, cierre)
│   ├── inventarioService.js
│   └── cerrarCarritoService.js
│
├── data/                → persistencia temporal
│   └── carritoStore.js
│
└── config/              → conexión a bases de datos (pendiente)



## 🧠 Flujo del módulo Carrito → Orden
Usuario
   │
   ├─ POST /carts              → crear carrito
   ├─ POST /carts/:id/items    → agregar productos
   ├─ GET  /carts/:id          → ver carrito
   └─ POST /orders/:carritoId  → cerrar carrito + generar orden


## 📌 Endpoints principales
🟦 Crear carrito
POST /carts
{
  "usuarioId": 1
}

🟩 Agregar producto
POST /carts/:id/items
{
  "sku": "BK-001",
  "cantidad": 2
}

🟨 Ver carrito
GET /carts/:id

🟥 Crear orden
POST /orders/:carritoId



## 🧪 Mini Tutorial Thunder Client
1️⃣ Crear carrito

Método: POST
Body:

{
  "usuarioId": 1
}

2️⃣ Agregar producto

Método: POST
Body:

{
  "sku": "BK-001",
  "cantidad": 2
}

3️⃣ Ver carrito

Método: GET
💡 Body vacío

4️⃣ Crear orden

Método: POST
💡 Body vacío

## 🛡️ Validaciones implementadas

Estas ya están funcionando dentro del código:

✔ El carrito no puede crearse sin usuarioId
✔ El SKU debe existir en catálogo simulado
✔ No se puede agregar ítems a un carrito cerrado
✔ No se puede agregar ítems sin sku y cantidad
✔ No se puede reservar stock si no hay stock suficiente
✔ El cierre del carrito calcula subtotal + IVA
✔ La orden se genera correctamente con total e ID
## 🛠 Validaciones pendientes (a agregar)

Estas validaciones fueron planificadas pero todavía no están en el código:

🔶 No generar orden si el carrito está vacío
🔶 No permitir más de una orden por el mismo carrito
🔶 No permitir cantidad menor o igual a 0
🔶 Mejorar mensaje de SKU inexistente
🔶 Evitar cerrar dos veces el mismo carrito

(Estas validaciones son cortas y fáciles de copiar/pegar.)




## 🔗 Integración con otros módulos

Tu módulo debe conectarse a:

🟪 1. Módulo Catálogo

Debe proveer:

✔ Obtener datos de un producto
GET /products/:sku


Debe devolver:

{
  "sku": "BK-001",
  "nombre": "Libro POO",
  "precio": 15000
}

Tu módulo lo usa para:

validar que el producto existe

obtener su precio

🟧 2. Módulo Inventario

Debe proveer:

✔ Reservar stock
POST /inventory/reservations
{
  "sku": "BK-001",
  "cantidad": 2,
  "carritoId": "c123"
}

✔ Confirmar o cancelar reservas

(se usa al momento de cerrar órdenes)

🟨 3. Base de datos (MySQL)

Tablas necesarias:

carritos

carrito_items

ordenes

(Las estructuras SQL se agregarán en fases siguientes.)




## 🗺️ Diagrama general de módulos


   Catálogo ──────┐
                   │   (datos de productos)
                   ▼
Usuario → Carrito → Órdenes
                   ▲
                   │   (reservas de stock)
   Inventario ─────┘



## 🎯 Estado actual del módulo

Sección	         Estado
Carritos		✔ Completo
Items	        	✔ Completo
Cálculo totales		✔ Completo
Cierre de carrito	✔ Funcional
Creación de órdenes	✔ Funcionando
Integración inventario	🔶 Simulada
Integración catálogo	🔶 Simulada
MySQL real		🔶 Pendiente
Validaciones extra	🔶 Pendiente
README			✔ Completo


## ✔ Próximos pasos

Agregar validaciones faltantes

Crear tablas MySQL

Implementar conexión real a MySQL

Integrar con APIs reales de Inventario y Catálogo


## 👥 Equipo

Este README permite que todos los miembros del grupo entiendan qué está hecho y qué falta.
