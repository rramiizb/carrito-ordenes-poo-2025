const USER_ID = 1;
let currentCartId = null;
let itemToDelete = null; 

// --- CATÁLOGO VISUAL ---
const CATALOGO = [
    { 
        sku: 'BK-001', 
        nombre: 'Libro POO Avanzado', 
        precio: 15000, 
        cat: 'Libros',
        img: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80'
    },
    { 
        sku: 'TE-002', 
        nombre: 'Teclado Mecánico', 
        precio: 45000, 
        cat: 'Tecnología',
        img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=400&q=80'
    },
    { 
        sku: 'TE-003', 
        nombre: 'Mouse Gamer', 
        precio: 12000, 
        cat: 'Tecnología',
        img: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=400&q=80'
    },
    { 
        sku: 'RO-004', 
        nombre: 'Remera Dev', 
        precio: 8000, 
        cat: 'Ropa',
        img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80'
    },
    { 
        sku: 'BK-005', 
        nombre: 'Clean Code', 
        precio: 22000, 
        cat: 'Libros',
        img: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80'
    },
    { 
        sku: 'TE-006', 
        nombre: 'Monitor 24"', 
        precio: 120000, 
        cat: 'Tecnología',
        img: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80'
    },
];

async function initApp() {
    renderCatalog();
    lucide.createIcons();
    try {
        const res = await fetch('/carts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuarioId: USER_ID })
        });

        if (!res.ok) throw new Error("No se pudo crear carrito");

        const data = await res.json();
        currentCartId = data.id;
        console.log("Carrito iniciado:", currentCartId);
    } catch (e) {
        console.error(e);
        showToast("Error conectando al servidor.");
    }
}


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

async function addToCart(sku) {
    if (!currentCartId) return showToast("Inicializando carrito...");

    try {
        const res = await fetch(`/carts/${currentCartId}/items`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sku: sku, cantidad: 1 })
        });

        if (res.ok) {
            showToast("¡Producto agregado!");
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
            list.innerHTML = items.map(item => {
                const prodInfo = CATALOGO.find(p => p.sku === item.sku);
                const imgSrc = prodInfo ? prodInfo.img : 'https://placehold.co/100?text=SIN+IMG';

                return `
                <div class="p-4 flex items-center gap-4 hover:bg-slate-50 transition border-b last:border-0 border-slate-100">
                    <div class="w-16 h-16 bg-white border border-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                        <img src="${imgSrc}" class="w-full h-full object-cover">
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
            `}).join('');

            const subtotal = items.reduce((acc, i) => acc + (i.precio || 0) * (i.cantidad || 1), 0);
            const impuestos = subtotal * 0.21; // 21% de IVA
            const total = subtotal + impuestos;

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

async function renderOrders() {
    hideAll();
    const section = document.getElementById('view-orders');
    section.classList.remove('hidden');
    
    const list = document.getElementById('orders-list');
    list.innerHTML = '<p class="text-center text-slate-400 py-10">Cargando historial...</p>';

    try {
        const res = await fetch('/orders');
        
        if (!res.ok) throw new Error("Error al obtener órdenes");

        const ordenes = await res.json();
        ordenes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        if (ordenes.length === 0) {
            list.innerHTML = `
                <div class="text-center py-10 opacity-50">
                    <i data-lucide="clipboard-list" class="mx-auto mb-2" size="48"></i>
                    <p>No tienes órdenes generadas aún.</p>
                </div>
            `;
        } else {
            list.innerHTML = ordenes.map(orden => `
                <div class="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-4 hover:shadow-md transition">
                    <div class="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                        <div>
                            <h3 class="font-bold text-lg text-indigo-900">Orden #${orden.id}</h3>
                            <p class="text-xs text-slate-500">${new Date(orden.fecha).toLocaleString()}</p>
                        </div>
                        <div class="text-right">
                            <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">
                                ${orden.estado}
                            </span>
                        </div>
                    </div>
                    
                    <div class="space-y-2 mb-4">
                        ${orden.items.map(item => `
                            <div class="flex justify-between text-sm text-slate-600">
                                <span>${item.cantidad}x ${item.nombre || item.sku}</span>
                                <span>$${(item.precio * item.cantidad).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-lg">
                        <span>Total</span>
                        <span class="text-indigo-600">$${orden.total.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        }
        lucide.createIcons();
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-center text-red-400 py-10">Error al cargar el historial.</p>';
    }
}

function showToast(msg) {
    const el = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = msg;
    el.classList.remove('translate-y-32');
    setTimeout(() => el.classList.add('translate-y-32'), 3000);
}

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

document.getElementById('confirm-btn-action').addEventListener('click', async () => {
    if (!itemToDelete) return;
    const btn = document.getElementById('confirm-btn-action');
    const originalText = btn.innerHTML;
    btn.innerHTML = "Eliminando..."; 
    try {
        const res = await fetch(`/carts/${currentCartId}/items/${itemToDelete}`, { method: 'DELETE' });
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

window.onload = initApp;