// Variables globales
let productoEditando = null;
let filtroInventarioActual = 'todos';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    inicializarPanel();
    cargarProductosEnSelect();
    actualizarResumen();
    cargarHistorialVentas();
});

// Funciones de navegación
function cambiarTab(tab) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
        content.classList.remove('active');
    });
    
    // Remover clase activa de todos los tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(`contenido-${tab}`).classList.remove('hidden');
    document.getElementById(`contenido-${tab}`).classList.add('active');
    
    // Activar tab seleccionado
    document.getElementById(`tab-${tab}`).classList.add('tab-active');
    
    // Actualizar datos específicos de cada tab
    if (tab === 'resumen') {
        actualizarResumen();
    } else if (tab === 'productos') {
        cargarListaProductos();
    } else if (tab === 'inventario') {
        cargarInventario();
    } else if (tab === 'reportes') {
        generarReportes();
    }
}

// Funciones del resumen
function actualizarResumen() {
    const totalVentas = ventas.reduce((total, venta) => total + venta.total, 0);
    const totalProductosVendidos = ventas.reduce((total, venta) => total + venta.cantidad, 0);
    const totalStock = productos.reduce((total, producto) => total + producto.stock, 0);
    const totalStockBajo = productos.filter(p => p.stock <= 5 && p.stock > 0).length;
    
    document.getElementById('total-ventas').textContent = `S/ ${totalVentas.toFixed(2)}`;
    document.getElementById('total-productos').textContent = totalProductosVendidos;
    document.getElementById('total-stock').textContent = totalStock;
    document.getElementById('total-stock-bajo').textContent = totalStockBajo;
    
    // Productos más vendidos
    const topProductos = [...productos]
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 5);
    
    const topProductosHTML = topProductos.map(producto => `
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
                <p class="font-semibold">${producto.nombre}</p>
                <p class="text-sm text-gray-600">${producto.vendidos} vendidos</p>
            </div>
            <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                S/ ${producto.precio}
            </span>
        </div>
    `).join('');
    
    document.getElementById('top-productos').innerHTML = topProductosHTML;
    
    // Stock bajo
    const stockBajo = obtenerProductosStockBajo();
    const stockBajoHTML = stockBajo.map(producto => `
        <div class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div>
                <p class="font-semibold">${producto.nombre}</p>
                <p class="text-sm text-red-600">${producto.stock} unidades</p>
            </div>
            <button onclick="ajustarStock(${producto.id})" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
                Reabastecer
            </button>
        </div>
    `).join('');
    
    document.getElementById('stock-bajo-lista').innerHTML = stockBajoHTML || 
        '<p class="text-green-600 text-center p-4">¡Todo en orden! No hay productos con stock bajo.</p>';
}

// Funciones de gestión de productos
function mostrarFormularioProducto(producto = null) {
    const formulario = document.getElementById('formulario-producto');
    const titulo = document.getElementById('titulo-formulario');
    
    if (producto) {
        // Modo edición
        productoEditando = producto;
        titulo.textContent = 'Editar Producto';
        document.getElementById('producto-id').value = producto.id;
        document.getElementById('producto-nombre').value = producto.nombre;
        document.getElementById('producto-categoria').value = producto.categoria;
        document.getElementById('producto-precio').value = producto.precio;
        document.getElementById('producto-stock').value = producto.stock;
        document.getElementById('producto-imagen').value = producto.imagen || '';
        document.getElementById('producto-tallas').value = producto.tallas ? producto.tallas.join(', ') : '';
    } else {
        // Modo nuevo
        productoEditando = null;
        titulo.textContent = 'Nuevo Producto';
        document.getElementById('producto-form').reset();
        document.getElementById('producto-id').value = '';
    }
    
    formulario.classList.remove('hidden');
}

function ocultarFormularioProducto() {
    document.getElementById('formulario-producto').classList.add('hidden');
    productoEditando = null;
}

// Manejar envío del formulario de producto
document.getElementById('producto-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('producto-id').value;
    const nombre = document.getElementById('producto-nombre').value;
    const categoria = document.getElementById('producto-categoria').value;
    const precio = parseFloat(document.getElementById('producto-precio').value);
    const stock = parseInt(document.getElementById('producto-stock').value);
    const imagen = document.getElementById('producto-imagen').value;
    const tallasInput = document.getElementById('producto-tallas').value;
    const tallas = tallasInput ? tallasInput.split(',').map(t => t.trim()).filter(t => t) : [];
    
    if (productoEditando) {
        // Actualizar producto existente
        const index = productos.findIndex(p => p.id == id);
        if (index !== -1) {
            productos[index] = {
                ...productos[index],
                nombre,
                categoria,
                precio,
                stock,
                imagen: imagen || productos[index].imagen,
                tallas
            };
        }
    } else {
        // Crear nuevo producto
        const nuevoProducto = {
            id: generarId(),
            nombre,
            categoria,
            precio,
            imagen: imagen || 'https://images.unsplash.com/photo-1560743641-3914f2c45636?w=500&h=500&fit=crop',
            tallas,
            stock,
            vendidos: 0,
            fechaCreacion: new Date().toISOString().split('T')[0]
        };
        productos.push(nuevoProducto);
    }
    
    guardarDatos();
    ocultarFormularioProducto();
    cargarListaProductos();
    cargarProductosEnSelect();
    actualizarResumen();
    
    alert('Producto guardado correctamente');
});

function cargarListaProductos() {
    const tbody = document.getElementById('lista-productos');
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-6 text-center text-gray-500">
                    <i class="fas fa-box-open text-4xl mb-3 text-gray-300"></i>
                    <p>No hay productos registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productos.map(producto => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-3">
                <div class="flex items-center gap-3">
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="w-12 h-12 object-cover rounded-lg">
                    <div>
                        <p class="font-semibold">${producto.nombre}</p>
                        <p class="text-sm text-gray-600">ID: ${producto.id}</p>
                    </div>
                </div>
            </td>
            <td class="p-3">
                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                    producto.categoria === 'niñas' ? 'bg-pink-100 text-pink-800' :
                    producto.categoria === 'niños' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                }">
                    ${producto.categoria === 'niñas' ? '👧 Niñas' : 
                      producto.categoria === 'niños' ? '👦 Niños' : '💄 Cosméticos'}
                </span>
            </td>
            <td class="p-3 text-center font-semibold">S/ ${producto.precio}</td>
            <td class="p-3 text-center">
                <span class="${getStockClass(producto.stock)}">${producto.stock}</span>
            </td>
            <td class="p-3 text-center">${producto.vendidos}</td>
            <td class="p-3 text-center">
                <div class="flex gap-2 justify-center">
                    <button onclick="mostrarFormularioProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})" 
                            class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarProducto(${producto.id})" 
                            class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        productos = productos.filter(p => p.id !== id);
        guardarDatos();
        cargarListaProductos();
        cargarProductosEnSelect();
        actualizarResumen();
        alert('Producto eliminado correctamente');
    }
}

// Funciones de ventas
function cargarProductosEnSelect() {
    const select = document.getElementById('venta-producto');
    select.innerHTML = '<option value="">Seleccionar producto</option>';
    
    productos.forEach(producto => {
        if (producto.stock > 0) {
            const option = document.createElement('option');
            option.value = producto.id;
            option.textContent = `${producto.nombre} (Stock: ${producto.stock}) - S/ ${producto.precio}`;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            select.appendChild(option);
        }
    });
}

// Actualizar información del producto seleccionado
document.getElementById('venta-producto').addEventListener('change', function() {
    const productoId = this.value;
    const infoDiv = document.getElementById('info-producto');
    
    if (productoId) {
        const producto = productos.find(p => p.id == productoId);
        const precio = parseFloat(this.options[this.selectedIndex].dataset.precio);
        
        document.getElementById('venta-precio').value = precio;
        calcularTotalVenta();
        
        infoDiv.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="w-32 h-32 object-cover rounded-xl mx-auto mb-3">
            <h4 class="font-bold text-lg">${producto.nombre}</h4>
            <p class="text-sm text-gray-600 mb-2">${producto.categoria === 'niñas' ? '👧 Niñas' : producto.categoria === 'niños' ? '👦 Niños' : '💄 Cosméticos'}</p>
            <div class="space-y-1 text-sm">
                <p><span class="font-semibold">Stock:</span> ${producto.stock} unidades</p>
                <p><span class="font-semibold">Precio:</span> S/ ${producto.precio}</p>
                <p><span class="font-semibold">Vendidos:</span> ${producto.vendidos}</p>
            </div>
        `;
    } else {
        infoDiv.innerHTML = `
            <i class="fas fa-box text-4xl mb-3 text-gray-300"></i>
            <p>Selecciona un producto para ver detalles</p>
        `;
    }
});

// Calcular total de venta
document.getElementById('venta-cantidad').addEventListener('input', calcularTotalVenta);
document.getElementById('venta-precio').addEventListener('input', calcularTotalVenta);

function calcularTotalVenta() {
    const cantidad = parseInt(document.getElementById('venta-cantidad').value) || 0;
    const precio = parseFloat(document.getElementById('venta-precio').value) || 0;
    const subtotal = cantidad * precio;
    
    document.getElementById('venta-subtotal').textContent = `S/ ${subtotal.toFixed(2)}`;
    document.getElementById('venta-total').textContent = `S/ ${subtotal.toFixed(2)}`;
}

// Manejar envío del formulario de venta
document.getElementById('venta-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productoId = parseInt(document.getElementById('venta-producto').value);
    const cantidad = parseInt(document.getElementById('venta-cantidad').value);
    const precio = parseFloat(document.getElementById('venta-precio').value);
    const cliente = document.getElementById('venta-cliente').value;
    
    if (registrarVenta(productoId, cantidad, precio, cliente)) {
        alert('Venta registrada correctamente');
        this.reset();
        cargarProductosEnSelect();
        actualizarResumen();
        cargarHistorialVentas();
        document.getElementById('info-producto').innerHTML = `
            <i class="fas fa-box text-4xl mb-3 text-gray-300"></i>
            <p>Selecciona un producto para ver detalles</p>
        `;
    }
});

function cargarHistorialVentas() {
    const tbody = document.getElementById('historial-ventas');
    const ventasRecientes = [...ventas].reverse().slice(0, 10);
    
    if (ventasRecientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="p-6 text-center text-gray-500">
                    <i class="fas fa-receipt text-4xl mb-3 text-gray-300"></i>
                    <p>No hay ventas registradas</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = ventasRecientes.map(venta => `
        <tr class="border-b border-gray-200 hover:bg-gray-50">
            <td class="p-3">${venta.fecha}</td>
            <td class="p-3">${venta.productoNombre}</td>
            <td class="p-3 text-center">${venta.cantidad}</td>
            <td class="p-3 text-center font-semibold">S/ ${venta.total.toFixed(2)}</td>
            <td class="p-3 text-center">${venta.cliente || '---'}</td>
        </tr>
    `).join('');
}

// Funciones de inventario
function cargarInventario() {
    const tbody = document.getElementById('tabla-inventario');
    let productosFiltrados = productos;
    
    if (filtroInventarioActual === 'bajo') {
        productosFiltrados = obtenerProductosStockBajo();
    } else if (filtroInventarioActual === 'agotado') {
        productosFiltrados = obtenerProductosAgotados();
    }
    
    const busqueda = document.getElementById('busqueda-inventario').value.toLowerCase();
    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p => 
            p.nombre.toLowerCase().includes(busqueda) ||
            p.categoria.toLowerCase().includes(busqueda)
        );
    }
    
    if (productosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="p-6 text-center text-gray-500">
                    <i class="fas fa-search text-4xl mb-3 text-gray-300"></i>
                    <p>No se encontraron productos</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = productosFiltrados.map(producto => {
        const stockClass = producto.stock === 0 ? 'producto-agotado' : 
                          producto.stock <= 5 ? 'stock-bajo' :
                          producto.stock <= 10 ? 'stock-medio' : 'stock-alto';
        
        return `
            <tr class="border-b border-gray-200 hover:bg-gray-50 ${stockClass}">
                <td class="p-3">
                    <div class="flex items-center gap-3">
                        <img src="${producto.imagen}" alt="${producto.nombre}" class="w-10 h-10 object-cover rounded">
                        <div>
                            <p class="font-semibold">${producto.nombre}</p>
                            <p class="text-sm text-gray-600">ID: ${producto.id}</p>
                        </div>
                    </div>
                </td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        producto.categoria === 'niñas' ? 'bg-pink-100 text-pink-800' :
                        producto.categoria === 'niños' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                    }">
                        ${producto.categoria === 'niñas' ? '👧 Niñas' : 
                          producto.categoria === 'niños' ? '👦 Niños' : '💄 Cosméticos'}
                    </span>
                </td>
                <td class="p-3 text-center font-semibold ${getStockClass(producto.stock)}">
                    ${producto.stock}
                </td>
                <td class="p-3 text-center">
                    <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                        producto.stock === 0 ? 'bg-red-100 text-red-800' :
                        producto.stock <= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }">
                        ${producto.stock === 0 ? 'Agotado' :
                          producto.stock <= 5 ? 'Stock Bajo' :
                          producto.stock <= 10 ? 'Stock Medio' : 'Stock Alto'}
                    </span>
                </td>
                <td class="p-3 text-center">${producto.vendidos}</td>
                <td class="p-3 text-center">
                    <button onclick="ajustarStock(${producto.id})" 
                            class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded text-sm">
                        <i class="fas fa-edit mr-1"></i>Ajustar
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function filtrarInventario(filtro) {
    filtroInventarioActual = filtro;
    
    // Actualizar botones de filtro
    document.querySelectorAll('.filtro-inv-btn').forEach(btn => {
        btn.className = 'filtro-inv-btn px-6 py-3 rounded-xl font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
    });
    
    event.target.className = 'filtro-inv-btn px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-pink-500 to-purple-500 text-white';
    
    cargarInventario();
}

// Búsqueda en inventario
document.getElementById('busqueda-inventario').addEventListener('input', cargarInventario);

// Funciones del modal de stock
function ajustarStock(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    document.getElementById('modal-stock-titulo').textContent = `Ajustar Stock - ${producto.nombre}`;
    document.getElementById('modal-producto-id').value = producto.id;
    document.getElementById('modal-stock-actual').textContent = producto.stock;
    document.getElementById('modal-nuevo-stock').value = producto.stock;
    
    document.getElementById('modal-stock').classList.remove('hidden');
}

function cerrarModalStock() {
    document.getElementById('modal-stock').classList.add('hidden');
}

document.getElementById('form-stock').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const productoId = parseInt(document.getElementById('modal-producto-id').value);
    const nuevoStock = parseInt(document.getElementById('modal-nuevo-stock').value);
    
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        producto.stock = nuevoStock;
        guardarDatos();
        cerrarModalStock();
        cargarInventario();
        actualizarResumen();
        cargarProductosEnSelect();
        alert('Stock actualizado correctamente');
    }
});

// Funciones de reportes
function generarReportes() {
    // Ventas por categoría
    const statsCategorias = obtenerEstadisticasCategorias();
    const reporteCategorias = document.getElementById('reporte-categorias');
    
    if (Object.keys(statsCategorias).length === 0) {
        reporteCategorias.innerHTML = '<p class="text-center text-gray-500 p-4">No hay datos de ventas por categoría</p>';
    } else {
        reporteCategorias.innerHTML = Object.entries(statsCategorias).map(([categoria, datos]) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <p class="font-semibold">${
                        categoria === 'niñas' ? '👧 Niñas' : 
                        categoria === 'niños' ? '👦 Niños' : '💄 Cosméticos'
                    }</p>
                    <p class="text-sm text-gray-600">${datos.ventas} productos vendidos</p>
                </div>
                <span class="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                    S/ ${datos.ingresos.toFixed(2)}
                </span>
            </div>
        `).join('');
    }
    
    // Top productos
    const topProductos = [...productos]
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 5);
    
    const reporteTop = document.getElementById('reporte-top-productos');
    
    if (topProductos.length === 0) {
        reporteTop.innerHTML = '<p class="text-center text-gray-500 p-4">No hay datos de productos vendidos</p>';
    } else {
        reporteTop.innerHTML = topProductos.map((producto, index) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-3">
                    <span class="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                        ${index + 1}
                    </span>
                    <div>
                        <p class="font-semibold">${producto.nombre}</p>
                        <p class="text-sm text-gray-600">${producto.vendidos} vendidos</p>
                    </div>
                </div>
                <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-semibold">
                    S/ ${(producto.precio * producto.vendidos).toFixed(2)}
                </span>
            </div>
        `).join('');
    }
    
    // Ventas del mes
    const ventasMes = obtenerVentasMesActual();
    const tablaVentasMes = document.getElementById('tabla-ventas-mensual');
    
    if (ventasMes.length === 0) {
        tablaVentasMes.innerHTML = `
            <tr>
                <td colspan="5" class="p-6 text-center text-gray-500">
                    <i class="fas fa-chart-line text-4xl mb-3 text-gray-300"></i>
                    <p>No hay ventas este mes</p>
                </td>
            </tr>
        `;
    } else {
        tablaVentasMes.innerHTML = ventasMes.map(venta => `
            <tr class="border-b border-gray-200 hover:bg-gray-50">
                <td class="p-3">${venta.fecha}</td>
                <td class="p-3">${venta.productoNombre}</td>
                <td class="p-3 text-center">${venta.cantidad}</td>
                <td class="p-3 text-center font-semibold">S/ ${venta.total.toFixed(2)}</td>
                <td class="p-3 text-center">${venta.cliente || '---'}</td>
            </tr>
        `).join('');
    }
}

// Función auxiliar para clases de stock
function getStockClass(stock) {
    if (stock === 0) return 'stock-low';
    if (stock <= 5) return 'stock-low';
    if (stock <= 10) return 'stock-medium';
    return 'stock-high';
}

// Inicialización del panel
function inicializarPanel() {
    // Cargar datos iniciales
    cargarListaProductos();
    cargarInventario();
    generarReportes();
}

// Agregar input para importar datos (opcional)
function agregarInputImportacion() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    input.id = 'import-input';
    input.addEventListener('change', importarDatos);
    document.body.appendChild(input);
    
    const importBtn = document.createElement('button');
    importBtn.className = 'bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-all text-white';
    importBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Importar Datos';
    importBtn.onclick = () => document.getElementById('import-input').click();
    
    document.querySelector('header .flex.gap-4').appendChild(importBtn);
}

// Llamar a esta función si quieres agregar la funcionalidad de importación
// agregarInputImportacion();