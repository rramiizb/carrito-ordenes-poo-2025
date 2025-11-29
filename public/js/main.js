// public/js/main.js
const USER_ID = 1;
let currentCartId = null;
let itemToDelete = null; // Variable para el modal

// Catálogo Simulado (Frontend)
const CATALOGO = [
    { sku: 'BK-001', nombre: 'Libro POO Avanzado', precio: 15000, cat: 'Libros' },
    { sku: 'TE-002', nombre: 'Teclado Mecánico', precio: 45000, cat: 'Tecnología' },
    { sku: 'TE-003', nombre: 'Mouse Gamer', precio: 12000, cat: 'Tecnología' },
    { sku: 'RO-004', nombre: 'Remera Dev', precio: 8000, cat: 'Ropa' },
    { sku: 'BK-005', nombre: 'Clean Code', precio: 22000, cat: 'Libros' },
    { sku: 'TE-006', nombre: 'Monitor 24"', precio: 120000, cat: 'Tecnología' },
];

// --- INICIO ---
async function initApp() {
    renderCatalog();
    lucide.createIcons();
    try {
        const res = await fetch('/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: USER_ID })
        });
        const data = await res.json();
        currentCartId = data.id || data.carritoId; 
    } catch (e) {
        showToast("Error conectando al servidor.");
    }
}

// --- NAVEGACIÓN ---
function hideAll() {
    ['view-catalog', 'view-cart', 'view-success', 'view-orders'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
}

function renderCatalog() {
    hideAll();
    document.getElementById('view-catalog').classList.remove('hidden');
    
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = CATALOGO.map(prod => `
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition group">
            <div class="h-40 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300 mb-4 group-hover:scale-105 transition-transform">
                <i data-lucide="package" size="64"></i>
            </div>
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full uppercase tracking-wide">${prod.cat}</span>
                    <h3 class="font-bold text-lg mt-2 text-slate-800 leading-tight">${prod.nombre}</h3>
                </div>
            </div>
            <div class="flex items-end justify-between mt-4 pt-4 border-t border-slate-100">
                <div>
                    <p class="text-xs text-slate-400">Precio</p>
                    <p class="text-xl font-bold text-slate-900">$${prod.precio.toLocaleString()}</p>
                </div>
                <button onclick="addToCart('${prod.sku}')" class="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-indigo-700 transition shadow-md hover:shadow-indigo-200">
                    <i data-lucide="plus"></i>
                </button>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- LÓGICA DE NEGOCIO ---

async function addToCart(sku) {
    if (!currentCartId) return showToast("Inicializando carrito...");

    try {
        const res = await fetch(`/carts/${currentCartId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku: sku, cantidad: 1 })
        });

        if (res.ok) {
            showToast("¡Producto agregado al carrito!");
            const badge = document.getElementById('badge-count');
            badge.innerText = parseInt(badge.innerText) + 1;
            badge.classList.remove('hidden');
        } else {
            const err = await res.json();
            showToast(err.message || "Error al agregar");
        }
    } catch (e) { showToast("Error de conexión"); }
}

async function renderCart() {
    hideAll();
    document.getElementById('view-cart').classList.remove('hidden');
    const list = document.getElementById('cart-items-list');
    const footer = document.getElementById('cart-footer');
    
    list.innerHTML = '<div class="p-8 text-center text-slate-400">Cargando...</div>';

    try {
        const res = await fetch(`/carts/${currentCartId}`);
        if (!res.ok) throw new Error("Error fetching cart");
        
        const cart = await res.json();
        const items = cart.items || [];

        if (items.length === 0) {
            list.innerHTML = `
                <div class="text-center py-16">
                    <div class="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="shopping-cart" class="text-slate-300" size="32"></i>
                    </div>
                    <p class="text-slate-500 text-lg">Tu carrito está vacío</p>
                    <button onclick="renderCatalog()" class="text-indigo-600 font-bold mt-4 hover:underline">Volver al catálogo</button>
                </div>
            `;
            footer.classList.add('hidden');
        } else {
            footer.classList.remove('hidden');
            // Lista con botón de eliminar actualizado
            list.innerHTML = items.map(item => `
                <div class="p-4 flex items-center gap-4 hover:bg-slate-50 transition border-b last:border-0 border-slate-100">
                    <div class="w-16 h-16 bg-white border border-slate-200 rounded flex items-center justify-center text-slate-300">
                        <i data-lucide="package"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-slate-800">${item.nombre || item.sku}</h4>
                        <p class="text-sm text-slate-500">Cantidad: ${item.cantidad}</p>
                    </div>
                    <div class="text-right flex items-center gap-4">
                        <p class="font-bold text-lg text-slate-700">$${(item.precio || 0).toLocaleString()}</p>
                        <button onclick="removeFromCart('${item.sku}')" class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition" title="Eliminar">
                            <i data-lucide="trash-2" size="20"></i>
                        </button>
                    </div>
                </div>
            `).join('');

            const subtotal = cart.subtotal || items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
            const impuestos = cart.impuestos || subtotal * 0.21;
            const total = cart.total || subtotal + impuestos;

            document.getElementById('summary-subtotal').innerText = `$${subtotal.toLocaleString()}`;
            document.getElementById('summary-tax').innerText = `$${impuestos.toLocaleString()}`;
            document.getElementById('summary-total').innerText = `$${total.toLocaleString()}`;
        }
        lucide.createIcons();
    } catch (e) {
        list.innerHTML = '<p class="text-red-500 p-4 text-center">No se pudo cargar el carrito.</p>';
    }
}

async function createOrder() {
    const btn = document.querySelector('#cart-footer button:last-child');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Procesando...';
    btn.disabled = true;

    try {
        const res = await fetch(`/orders/${currentCartId}`, { method: 'POST' });
        const result = await res.json();

        if (res.ok) {
            hideAll();
            document.getElementById('view-success').classList.remove('hidden');
            document.getElementById('order-id-display').innerText = `#${result.id || result.ordenId || 'N/A'}`;
            document.getElementById('order-total-display').innerText = `$${(result.total || 0).toLocaleString()}`;
            currentCartId = null; 
            document.getElementById('badge-count').classList.add('hidden');
            document.getElementById('badge-count').innerText = "0";
        } else {
            showToast(result.message || "Error al crear orden");
        }
    } catch (e) {
        showToast("Error de conexión");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function renderOrders() {
        hideAll();
        document.getElementById('view-orders').classList.remove('hidden');
}

function showToast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    el.classList.remove('translate-y-32');
    setTimeout(() => el.classList.add('translate-y-32'), 3000);
}

// --- LÓGICA DE MODAL ---

function removeFromCart(sku) {
    itemToDelete = sku;
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

// Event Listeners
document.getElementById('confirm-btn-action').addEventListener('click', async () => {
    if (!itemToDelete) return;
    
    const btn = document.getElementById('confirm-btn-action');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Eliminando..."; 
    
    try {
        const res = await fetch(`/carts/${currentCartId}/items/${itemToDelete}`, {
            method: 'DELETE'
        });

        if (res.ok) {
            showToast("Producto eliminado");
            renderCart(); 
        } else {
            showToast("Error al eliminar");
        }
    } catch (e) {
        showToast("Error de conexión");
    } finally {
        btn.innerHTML = originalText;
        closeModal();
    }
});

// Inicializar cuando carga la página
window.onload = initApp;