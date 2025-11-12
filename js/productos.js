// Base de datos de productos
let productos = JSON.parse(localStorage.getItem('productos_paola')) || [
    {
        id: 1,
        nombre: "Polo Unicornio Niña",
        categoria: "niñas",
        precio: 25,
        imagen: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500&h=500&fit=crop",
        tallas: ["2-4", "4-6", "6-8", "8-10"],
        stock: 15,
        vendidos: 32,
        fechaCreacion: "2024-01-01"
    },
    {
        id: 2,
        nombre: "Polo Dinosaurio Niño",
        categoria: "niños",
        precio: 25,
        imagen: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?w=500&h=500&fit=crop",
        tallas: ["2-4", "4-6", "6-8", "8-10"],
        stock: 8,
        vendidos: 28,
        fechaCreacion: "2024-01-01"
    }
];

// Base de datos de ventas
let ventas = JSON.parse(localStorage.getItem('ventas_paola')) || [];

// Función para guardar datos en localStorage
function guardarDatos() {
    localStorage.setItem('productos_paola', JSON.stringify(productos));
    localStorage.setItem('ventas_paola', JSON.stringify(ventas));
}

// Función para generar un ID único
function generarId() {
    return productos.length > 0 ? Math.max(...productos.map(p => p.id)) + 1 : 1;
}

// Función para obtener productos por categoría
function obtenerProductosPorCategoria(categoria) {
    if (categoria === 'todos') return productos;
    return productos.filter(p => p.categoria === categoria);
}

// Función para buscar productos
function buscarProductos(termino) {
    return productos.filter(p => 
        p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        p.categoria.toLowerCase().includes(termino.toLowerCase())
    );
}

// Función para obtener productos con stock bajo
function obtenerProductosStockBajo() {
    return productos.filter(p => p.stock <= 5 && p.stock > 0);
}

// Función para obtener productos agotados
function obtenerProductosAgotados() {
    return productos.filter(p => p.stock === 0);
}

// Función para registrar una venta
function registrarVenta(productoId, cantidad, precio, cliente = '') {
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        alert('Producto no encontrado');
        return false;
    }
    
    if (producto.stock < cantidad) {
        alert(`Stock insuficiente. Solo quedan ${producto.stock} unidades.`);
        return false;
    }
    
    // Actualizar stock y ventas del producto
    producto.stock -= cantidad;
    producto.vendidos += cantidad;
    
    // Registrar la venta
    const venta = {
        id: ventas.length + 1,
        productoId: productoId,
        productoNombre: producto.nombre,
        cantidad: cantidad,
        precioUnitario: precio,
        total: cantidad * precio,
        cliente: cliente,
        fecha: new Date().toISOString().split('T')[0],
        timestamp: new Date().getTime()
    };
    
    ventas.push(venta);
    guardarDatos();
    
    return true;
}

// Función para obtener ventas del mes actual
function obtenerVentasMesActual() {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    
    return ventas.filter(venta => {
        const fechaVenta = new Date(venta.timestamp);
        return fechaVenta.getMonth() === mesActual && fechaVenta.getFullYear() === añoActual;
    });
}

// Función para obtener estadísticas de ventas por categoría
function obtenerEstadisticasCategorias() {
    const stats = {};
    
    ventas.forEach(venta => {
        const producto = productos.find(p => p.id === venta.productoId);
        if (producto) {
            const categoria = producto.categoria;
            if (!stats[categoria]) {
                stats[categoria] = { ventas: 0, ingresos: 0 };
            }
            stats[categoria].ventas += venta.cantidad;
            stats[categoria].ingresos += venta.total;
        }
    });
    
    return stats;
}

// Función para exportar datos
function exportarDatos() {
    const datos = {
        productos: productos,
        ventas: ventas,
        fechaExportacion: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paola-boutique-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Datos exportados correctamente');
}

// Función para importar datos (opcional)
function importarDatos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (datos.productos && datos.ventas) {
                productos = datos.productos;
                ventas = datos.ventas;
                guardarDatos();
                alert('Datos importados correctamente');
                location.reload();
            } else {
                alert('Archivo inválido');
            }
        } catch (error) {
            alert('Error al importar datos: ' + error.message);
        }
    };
    reader.readAsText(file);
}