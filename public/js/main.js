const API_URL = "http://poo2025.unsada.edu.ar:8050";

let itemToDelete = null;
let currentCartId = null;
const USER_ID = 1;
// --- CATÁLOGO VISUAL ---
const CATALOGO = [
    { id: 1, sku: 'BK-001', nombre: 'Libro POO Avanzado', precio: 15000, cat: 'Libros', img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80' },
    { id: 2, sku: 'TE-002', nombre: 'Teclado Mecánico', precio: 45000, cat: 'Tecnología', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80' },
    { id: 3, sku: 'TE-003', nombre: 'Mouse Gamer', precio: 12000, cat: 'Tecnología', img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=400&q=80' },
    { id: 4, sku: 'RO-004', nombre: 'Remera Dev', precio: 8000, cat: 'Ropa', img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
    { id: 5, sku: 'BK-005', nombre: 'Clean Code', precio: 22000, cat: 'Libros', img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80' },
    { id: 6, sku: 'TE-006', nombre: 'Monitor 24"', precio: 120000, cat: 'Tecnología', img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80' },
];



// --- Inicializar carrito al cargar la app ---
async function initCart() {
    try {
        // 1. Buscar carrito activo del usuario
        const res = await fetch(`${API_URL}/carts/users/${USER_ID}/carts`);
        if (!res.ok) throw new Error("No se pudo buscar carritos");

        const carritos = await res.json();
        const activo = carritos.find(c => c.estado.toLowerCase() === "activo");

        if (activo) {
            currentCartId = activo.id;
            console.log("Carrito activo encontrado:", currentCartId);
            return;
        }

        // 2. Si no hay activo, crear uno nuevo
        await createNewCart();

    } catch (err) {
        console.error("initCart error:", err);
    }
}






// --- Crear un nuevo carrito ---
async function createNewCart() {
    try {
        const res = await fetch(`${API_URL}/carts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: USER_ID })
        });

        if (!res.ok) throw new Error("Error al crear carrito");

        const data = await res.json();
        currentCartId = data.id;
        console.log("Nuevo carrito creado:", currentCartId);
        return data;

    } catch (err) {
        console.error("createNewCart error:", err);
        return null;
    }
}



// --- FUNCIONES GENERALES ---
function hideAll() {
    ['view-catalog', 'view-cart', 'view-success', 'view-orders'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
}

function showToast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    el.classList.remove('translate-y-32');
    setTimeout(() => el.classList.add('translate-y-32'), 3000);
}

// --- CATALOGO ---
function renderCatalog() {
    hideAll();
    document.getElementById('view-catalog').classList.remove('hidden');
    
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = CATALOGO.map(prod => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition group flex flex-col h-full">
            <div class="h-48 overflow-hidden bg-slate-100 relative">
                <img src="${prod.img}" alt="${prod.nombre}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onerror="this.src='https://placehold.co/400x300?text=Sin+Imagen'">
                <span class="absolute top-2 right-2 text-xs font-bold text-indigo-600 bg-white/90 backdrop-blur px-2 py-1 rounded-full uppercase tracking-wide shadow-sm">
                    ${prod.cat}
                </span>
            </div>
            <div class="p-5 flex flex-col flex-grow justify-between">
                <div>
                    <h3 class="font-bold text-lg text-slate-800 leading-tight mb-1">${prod.nombre}</h3>
                    <p class="text-sm text-slate-400">SKU: ${prod.sku}</p>
                </div>
                <div class="flex items-end justify-between mt-4 pt-4 border-t border-slate-50">
                    <div>
                        <p class="text-xs text-slate-400 uppercase font-semibold">Precio</p>
                        <p class="text-xl font-bold text-slate-900">$${prod.precio.toLocaleString()}</p>
                    </div>
                    <button onclick="addToCart('${prod.sku}')" class="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 transition shadow-md hover:shadow-indigo-200 active:scale-95">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- AGREGAR PRODUCTO AL CARRITO ---
async function addToCart(sku) {
    try {
        const producto = CATALOGO.find(p => p.sku === sku);
        if (!producto) return showToast("Producto no encontrado");

        if (!currentCartId) await initCart();

        const res = await fetch(`${API_URL}/carts/${currentCartId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: producto.id, cantidad: 1 })
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok) {
            showToast("¡Producto agregado!");
            const badge = document.getElementById('badge-count');
            badge.innerText = parseInt(badge.innerText || 0) + 1;
            badge.classList.remove('hidden');
            renderCart(); // actualizar carrito visual
        } else if (data.error === "CarritoCerrado") {
            showToast("Carrito cerrado, creando uno nuevo...");
            await createNewCart();
            addToCart(sku); // reintentar agregar
        } else {
            showToast(data.message || "Error al agregar item");
        }

    } catch (e) {
        console.error(e);
        showToast("Error de conexión");
    }
}


// --- RENDERIZAR CARRITO CORREGIDO CON BOTÓN ELIMINAR ---
async function renderCart() {
    hideAll();
    document.getElementById('view-cart').classList.remove('hidden');

    // Asegurarse de tener un carrito activo
    if (!currentCartId) await initCart();

    const list = document.getElementById('cart-items-list');
    const footer = document.getElementById('cart-footer');

    try {
        const res = await fetch(`${API_URL}/carts/${currentCartId}`);
        
        // Si el carrito no existe o está cerrado, crear uno nuevo
        if (res.status === 404 || res.status === 409) {
            await createNewCart();
            return renderCart();
        }

        if (!res.ok) throw new Error("Error fetching cart");

        const cart = await res.json();
        const items = cart.items || [];

        if (!items.length) {
            list.innerHTML = `<p>Tu carrito está vacío</p>`;
            footer.classList.add('hidden');
        } else {
            footer.classList.remove('hidden');
            list.innerHTML = items.map(i => {
                const precio = Number(i.precio_unitario || 0);
                const cantidad = Number(i.cantidad || 0);
                return `
                    <div class="cart-item flex justify-between items-center border-b py-2">
                        <div>
                            <span class="font-semibold">${i.nombre}</span> 
                            <span>Cantidad: ${cantidad}</span>
                            <span>Precio unitario: $${precio.toFixed(2)}</span>
                            <span>Subtotal: $${(cantidad * precio).toFixed(2)}</span>
                        </div>
                        <button 
                            onclick="removeFromCart('${i.product_id}')" 
                            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Eliminar
                        </button>
                    </div>
                `;
            }).join('');

            document.getElementById('summary-subtotal').innerText = `$${Number(cart.subtotal || 0).toFixed(2)}`;
            document.getElementById('summary-tax').innerText = `$${Number(cart.impuestos || 0).toFixed(2)}`;
            document.getElementById('summary-total').innerText = `$${Number(cart.total || 0).toFixed(2)}`;
        }
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-red-500">No se pudo cargar el carrito.</p>';
    }
}


// --- CREAR NUEVA ORDEN ---
async function createOrder() {
    if (!currentCartId) return showToast("No hay carrito activo");

    try {
        const res = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ carritoId: currentCartId })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Orden creada correctamente");
            await createNewCart(); // inicia un carrito nuevo automáticamente
            renderCart();
            renderOrders();
        } else {
            showToast(data.message || "Error al crear orden");
        }
    } catch (err) {
        console.error(err);
        showToast("Error de conexión al crear orden");
    }
}


async function renderOrders() {
    hideAll();
    document.getElementById('view-orders').classList.remove('hidden');
    const list = document.getElementById('orders-list');

    try {
        const res = await fetch("/orders");
        if (!res.ok) throw new Error("Error al obtener órdenes");

        const orders = await res.json();

        list.innerHTML = orders.map(o => {
            const subtotal = Number(o.subtotal || 0).toFixed(2);
            const impuestos = Number(o.impuestos || 0).toFixed(2);
            const total = Number(o.total || 0).toFixed(2);

            const itemsHTML = o.items.map(i => {
                const nombre = i.nombre || "Producto";
                const cantidad = Number(i.cantidad || 0);
                const precio = Number(i.precio_unitario || i.precio || 0).toFixed(2);
                return `${nombre} x${cantidad} ($${precio})`;
            }).join(", ");

            return `
                <div class="order-item border p-4 mb-2">
                    <h4>Orden #${o.id} - Estado: ${o.estado}</h4>
                    <p>Subtotal: $${subtotal}, IVA: $${impuestos}, Total: $${total}</p>
                    <div>Items: ${itemsHTML}</div>
                </div>
            `;
        }).join('');

    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-red-500">No se pudo cargar las órdenes.</p>';
    }
}



// --- ELIMINAR ITEM ---
function removeFromCart(productId) {
    itemToDelete = productId;
    const modal = document.getElementById('confirm-modal');
    const content = document.getElementById('confirm-modal-content');

    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
        content.classList.add('scale-100');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('confirm-modal');
    const content = document.getElementById('confirm-modal-content');

    modal.classList.add('opacity-0');
    content.classList.remove('scale-100');
    content.classList.add('scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        itemToDelete = null;
    }, 300);
}

document.getElementById('confirm-btn-action').addEventListener('click', async () => {
    if (!itemToDelete || !currentCartId) return;
    const btn = document.getElementById('confirm-btn-action');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Eliminando..."; 

    try {
        const res = await fetch(`${API_URL}/carts/${currentCartId}/items/${itemToDelete}`, { method: 'DELETE' });
        if (res.ok) {
            showToast("Producto eliminado");
            renderCart();
        } else {
            showToast("Error al eliminar");
        }
    } catch (e) {
        console.error(e);
        showToast("Error de conexión");
    } finally {
        btn.innerHTML = originalText;
        closeModal();
    }
});

// --- INICIALIZACION ---
window.onload = initCart;
