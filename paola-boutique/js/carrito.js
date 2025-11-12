// Sistema de Carrito de Compras
let carrito = JSON.parse(localStorage.getItem('carrito_paola')) || [];

// Función para agregar producto al carrito
function agregarAlCarrito(productoId, cantidad = 1) {
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    if (producto.stock < cantidad) {
        alert(`Solo quedan ${producto.stock} unidades disponibles`);
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        if (itemExistente.cantidad + cantidad > producto.stock) {
            alert(`No puedes agregar más de ${producto.stock} unidades`);
            return;
        }
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            categoria: producto.categoria,
            cantidad: cantidad,
            stockDisponible: producto.stock
        });
    }
    
    guardarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion('✅ Producto agregado al carrito');
}

// Función para eliminar producto del carrito
function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    guardarCarrito();
    actualizarContadorCarrito();
    actualizarCarritoModal();
}

// Función para actualizar cantidad en carrito
function actualizarCantidadCarrito(productoId, nuevaCantidad) {
    const item = carrito.find(item => item.id === productoId);
    const producto = productos.find(p => p.id === productoId);
    
    if (item && producto) {
        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(productoId);
        } else if (nuevaCantidad > producto.stock) {
            alert(`Solo quedan ${producto.stock} unidades disponibles`);
            item.cantidad = producto.stock;
        } else {
            item.cantidad = nuevaCantidad;
        }
        
        guardarCarrito();
        actualizarContadorCarrito();
        actualizarCarritoModal();
    }
}

// Función para guardar carrito en localStorage
function guardarCarrito() {
    localStorage.setItem('carrito_paola', JSON.stringify(carrito));
}

// Función para actualizar contador del carrito
function actualizarContadorCarrito() {
    const countElement = document.getElementById('cart-count');
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    
    if (totalItems > 0) {
        countElement.textContent = totalItems;
        countElement.classList.remove('hidden');
    } else {
        countElement.classList.add('hidden');
    }
}

// Función para mostrar/ocultar carrito
function toggleCarrito() {
    const modal = document.getElementById('cart-modal');
    if (carrito.length === 0) {
        mostrarNotificacion('🛒 Tu carrito está vacío');
        return;
    }
    actualizarCarritoModal();
    modal.classList.remove('hidden');
}

function cerrarCarrito() {
    document.getElementById('cart-modal').classList.add('hidden');
}

// Función para actualizar el modal del carrito
function actualizarCarritoModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-shopping-cart text-4xl mb-3 text-gray-300"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.textContent = 'S/ 0.00';
        return;
    }
    
    // Calcular total
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    cartTotal.textContent = `S/ ${total.toFixed(2)}`;
    
    // Mostrar items del carrito
    cartItems.innerHTML = carrito.map(item => `
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img src="${item.imagen}" alt="${item.nombre}" class="w-16 h-16 object-cover rounded-lg">
            <div class="flex-1">
                <h4 class="font-semibold text-gray-800">${item.nombre}</h4>
                <p class="text-purple-600 font-bold">S/ ${item.precio}</p>
                <p class="text-sm text-gray-600">Stock: ${item.stockDisponible}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="actualizarCantidadCarrito(${item.id}, ${item.cantidad - 1})" 
                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                    <i class="fas fa-minus text-xs"></i>
                </button>
                <span class="w-8 text-center font-semibold">${item.cantidad}</span>
                <button onclick="actualizarCantidadCarrito(${item.id}, ${item.cantidad + 1})" 
                        class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300">
                    <i class="fas fa-plus text-xs"></i>
                </button>
                <button onclick="eliminarDelCarrito(${item.id})" 
                        class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 ml-2">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Función para procesar pago
function procesarPago(metodo) {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const pagoInfo = document.getElementById('pago-info');
    const pagoDetails = document.getElementById('pago-details');
    
    let infoPago = '';
    if (metodo === 'yape') {
        infoPago = `
            <strong>Yape:</strong> 991 798 916<br>
            <strong>Nombre:</strong> PAOLA BOUTIQUE<br>
            <strong>Total a pagar:</strong> S/ ${total.toFixed(2)}<br>
            <strong>Referencia:</strong> PEDIDO-${Date.now().toString().slice(-6)}
        `;
    } else if (metodo === 'plin') {
        infoPago = `
            <strong>Plin:</strong> 991 798 916<br>
            <strong>Nombre:</strong> PAOLA BOUTIQUE<br>
            <strong>Total a pagar:</strong> S/ ${total.toFixed(2)}<br>
            <strong>Referencia:</strong> PEDIDO-${Date.now().toString().slice(-6)}
        `;
    }
    
    pagoDetails.innerHTML = infoPago;
    pagoInfo.classList.remove('hidden');
}

// Función para confirmar pago
function confirmarPago() {
    // Verificar stock antes de procesar
    const sinStock = carrito.some(item => {
        const producto = productos.find(p => p.id === item.id);
        return producto.stock < item.cantidad;
    });
    
    if (sinStock) {
        alert('❌ Algunos productos ya no tienen stock disponible. Actualiza tu carrito.');
        actualizarCarritoModal();
        return;
    }
    
    // Registrar venta y actualizar stock
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad;
            producto.vendidos += item.cantidad;
            
            // Registrar venta en el historial
            const venta = {
                id: Date.now(),
                productoId: producto.id,
                productoNombre: producto.nombre,
                cantidad: item.cantidad,
                precioUnitario: producto.precio,
                total: producto.precio * item.cantidad,
                fecha: new Date().toISOString().split('T')[0],
                timestamp: new Date().getTime(),
                metodoPago: document.querySelector('#pago-info:not(.hidden)') ? 'Yape/Plin' : 'No especificado'
            };
            
            if (!ventas) ventas = [];
            ventas.push(venta);
        }
    });
    
    // Guardar cambios
    guardarDatos();
    localStorage.setItem('ventas_paola', JSON.stringify(ventas));
    
    // Limpiar carrito y mostrar confirmación
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    
    document.getElementById('pago-info').classList.add('hidden');
    document.getElementById('cart-modal').classList.add('hidden');
    
    alert(`✅ ¡Pago confirmado! Total: S/ ${total.toFixed(2)}\n📦 Tu pedido está siendo procesado.`);
    
    // Enviar mensaje por WhatsApp
    const mensaje = `¡Hola! He realizado un pedido por S/ ${total.toFixed(2)}. Detalles del pago enviados.`;
    window.open(`https://wa.me/51991798916?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function cancelarPago() {
    document.getElementById('pago-info').classList.add('hidden');
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Inicializar carrito al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    actualizarContadorCarrito();
    
    // Configurar botón del carrito
    document.getElementById('cart-btn').addEventListener('click', toggleCarrito);
});