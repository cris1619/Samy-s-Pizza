const params = new URLSearchParams(window.location.search);
const auth = params.get("auth");

let pedidosGlobal = [];
let useLocalStorage = false;
let menuGlobal = [];
let indexPedidoFinalizando = null;
let indexProductoEditando = null;

// Función auxiliar para formatear fechas
function formatearFecha(isoString) {
  const fecha = new Date(isoString);
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = fecha.getFullYear();
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${dia}/${mes}/${año} ${horas}:${minutos}`;
}

function almacenarPedidosLocal(pedidos) {
  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function obtenerPedidosLocal() {
  return JSON.parse(localStorage.getItem("pedidos") || "[]");
}

async function cargarPedidos() {
  // Preferir pedidos almacenados localmente (si existen), ya que el proyecto actualmente guarda pedidos en localStorage.
  const pedidosLS = obtenerPedidosLocal();
  if (pedidosLS.length > 0) {
    useLocalStorage = true;
    pedidosGlobal = pedidosLS;
    renderPedidos(pedidosGlobal);
    return;
  }

  // Si no hay pedidos en localStorage, intentar cargar desde Firestore (si está configurado correctamente).
  try {
    const querySnapshot = await getDocs(collection(window.db, "pedidos"));
    pedidosGlobal = [];
    querySnapshot.forEach((doc) => {
      pedidosGlobal.push({ id: doc.id, ...doc.data() });
    });
    useLocalStorage = false;
    renderPedidos(pedidosGlobal);
  } catch (error) {
    console.error('Error loading orders:', error);
    // Si falla, caer en un estado vacío.
    pedidosGlobal = [];
    renderPedidos(pedidosGlobal);
  }
}

if (auth !== "ok") {
  window.location.href = "login.html";
}

function renderPedidos(pedidos) {
  let contenedor = document.getElementById("listaPedidos");
  let totalGeneral = 0;

  contenedor.innerHTML = "";

  if (pedidos.length === 0) {
    contenedor.innerHTML = `
      <div class="card-custom text-center">
        <p>No hay pedidos 📭</p>
      </div>
    `;
    document.getElementById("totalVentas").innerText = "$0";
    return;
  }

  // Ordenar pedidos del más reciente al más viejo
  let pedidosOrdenados = [...pedidos].reverse();

  pedidosOrdenados.forEach((pedido, index) => {
    // Obtener el índice original en pedidosGlobal
    let indexOriginal = pedidosGlobal.findIndex(p => p === pedido);
    if (pedido.estado === "finalizado") {
      totalGeneral += pedido.total;
    }

    let productosHTML = "";
    pedido.productos.forEach(p => {
      productosHTML += `
        <li>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</li>
      `;
    });

    let tipoEntregaHTML = pedido.tipoEntrega ? `<p><strong>Tipo de entrega:</strong> ${pedido.tipoEntrega === 'fisico' ? 'Punto Físico' : 'Domicilio'}</p>` : '';
    let direccionHTML = pedido.direccion ? `<p><strong>Dirección:</strong> ${pedido.direccion}</p>` : '';
    let metodoPagoHTML = pedido.metodoPago ? `<p><strong>Método de pago:</strong> ${pedido.metodoPago === 'efectivo' ? '💵 Efectivo' : '💳 Transferencia'}</p>` : '';

    contenedor.innerHTML += `
      <div class="pedido-card">
        <h5>${pedido.cliente}</h5>
        <p><strong>Teléfono:</strong> ${pedido.telefono || 'No especificado'}</p>
        ${tipoEntregaHTML}
        ${direccionHTML}
        ${metodoPagoHTML}
        <small><strong>Fecha:</strong> ${formatearFecha(pedido.fecha)}</small>
        <p><strong>Estado:</strong> ${pedido.estado || 'Pendiente'}</p>

        <ul>${productosHTML}</ul>

        <strong>Total: $${pedido.total}</strong><br>

        ${pedido.estado !== 'finalizado' ? `<button class="btn btn-success btn-sm mt-2 me-2"
          onclick="finalizarPedido(${indexOriginal})">
          Finalizar venta
        </button>` : '<span class="badge bg-success">Venta finalizada</span>'}

        ${pedido.estado !== 'finalizado' ? `<button class="btn btn-danger btn-sm mt-2"
          onclick="eliminarPedido(${indexOriginal})">
          Cancelar pedido
        </button>` : ''}
      </div>
    `;
  });

  document.getElementById("totalVentas").innerText = "$" + totalGeneral;
}

function filtrarPedidos() {
  let texto = document.getElementById("filtroCliente").value.toLowerCase();
  let fechaInicio = document.getElementById("fechaInicio").value;
  let fechaFin = document.getElementById("fechaFin").value;

  let filtrados = pedidosGlobal.filter(pedido => {
    let coincideNombre = pedido.cliente.toLowerCase().includes(texto);
    let coincideTelefono = (pedido.telefono || '').toLowerCase().includes(texto);

    let fechaPedido = new Date(pedido.fecha);
    let inicio = fechaInicio ? new Date(fechaInicio) : null;
    let fin = fechaFin ? new Date(fechaFin) : null;

    let coincideFecha = true;
    if (inicio && fechaPedido < inicio) coincideFecha = false;
    if (fin && fechaPedido > fin) coincideFecha = false;

    return (coincideNombre || coincideTelefono) && coincideFecha;
  });

  renderPedidos(filtrados);
}

function limpiarFiltros() {
  document.getElementById("filtroCliente").value = "";
  document.getElementById("fechaInicio").value = "";
  document.getElementById("fechaFin").value = "";

  renderPedidos(pedidosGlobal);
}

async function finalizarPedido(index) {
  indexPedidoFinalizando = index;
  document.getElementById("modalPago").style.display = "flex";
}

async function eliminarPedido(index) {
  const pedido = pedidosGlobal[index];
  const clienteNombre = pedido.cliente || "Cliente";
  mostrarConfirmacion(
    "Cancelar Venta",
    `Desea cancelar el pedido de ${clienteNombre}? Esta accion no se puede deshacer.`,
    "❌",
    async () => {
      try {
        if (useLocalStorage) {
          const pedidos = obtenerPedidosLocal();
          pedidos.splice(index, 1);
          almacenarPedidosLocal(pedidos);
          pedidosGlobal = pedidos;
          renderPedidos(pedidosGlobal);
          mostrarAlerta(`Venta de ${clienteNombre} cancelada`, "error");
        } else {
          const order = pedidosGlobal[index];
          await deleteDoc(doc(window.db, "pedidos", order.id));
          await cargarPedidos();
          mostrarAlerta(`Venta de ${clienteNombre} cancelada`, "error");
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        mostrarAlerta("Error al cancelar la venta", "error");
      }
    }
  );
}

async function seleccionarMetodoPago(metodo) {
  const index = indexPedidoFinalizando;
  
  try {
    if (useLocalStorage) {
      const pedidos = obtenerPedidosLocal();
      pedidos[index].estado = "finalizado";
      pedidos[index].metodoPago = metodo;
      almacenarPedidosLocal(pedidos);
      pedidosGlobal = pedidos;
      renderPedidos(pedidosGlobal);
    } else {
      const order = pedidosGlobal[index];
      await updateDoc(doc(window.db, "pedidos", order.id), { 
        estado: "finalizado",
        metodoPago: metodo
      });
      await cargarPedidos();
    }
    
    cerrarModalPago();
  } catch (error) {
    console.error('Error updating order:', error);
  }
}

function cerrarModalPago() {
  document.getElementById("modalPago").style.display = "none";
  indexPedidoFinalizando = null;
}

// Variables para el sistema de confirmación
let accionConfirmacion = null;

function mostrarConfirmacion(titulo, mensaje, icono = "⚠️", accion = null) {
  document.getElementById("modalConfirmacionTitulo").innerText = titulo;
  document.getElementById("modalConfirmacionMensaje").innerText = mensaje;
  document.getElementById("modalConfirmacionIcono").innerText = icono;
  accionConfirmacion = accion;
  document.getElementById("modalConfirmacion").style.display = "flex";
}

function confirmarAccion() {
  document.getElementById("modalConfirmacion").style.display = "none";
  if (accionConfirmacion && typeof accionConfirmacion === "function") {
    accionConfirmacion();
  }
  accionConfirmacion = null;
}

function cancelarConfirmacion() {
  document.getElementById("modalConfirmacion").style.display = "none";
  accionConfirmacion = null;
}

function cerrarSesion() {
  mostrarConfirmacion(
    "Cerrar Sesión",
    "¿Estás seguro de que quieres cerrar tu sesión?",
    "⏻",
    () => {
      mostrarAlerta("👋 Sesión cerrada, regresando...", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    }
  );
}

function cargarMenu() {
  const menuLS = localStorage.getItem("menu");
  if (menuLS) {
    menuGlobal = JSON.parse(menuLS);
  } else {
    // Load from menu.json
    fetch('menu.json')
      .then(response => response.json())
      .then(data => {
        menuGlobal = data;
        localStorage.setItem("menu", JSON.stringify(menuGlobal));
      })
      .catch(error => {
        console.error('Error loading menu:', error);
        menuGlobal = [];
      });
  }
  renderMenu();
}

function renderMenu() {
  const contenedor = document.getElementById("listaMenu");
  contenedor.innerHTML = "";

  const categorias = [...new Set(menuGlobal.map(p => p.categoria))];

  categorias.forEach(cat => {
    const productos = menuGlobal.filter(p => p.categoria === cat);
    
    let productosHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px;">`;
    
    productos.forEach((p) => {
      const globalIndex = menuGlobal.indexOf(p);
      const imagenSrc = p.imagen ? p.imagen : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23999" width="100" height="100"/%3E%3C/svg%3E';
      
      productosHTML += `
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:all 0.2s; display:flex; flex-direction:column;">
          <img src="${imagenSrc}" style="width:100%; height:140px; object-fit:cover;">
          <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
            <h6 style="color:var(--text); margin-bottom:6px; font-size:14px; font-weight:600;">${p.nombre}</h6>
            <p style="color:var(--muted); font-size:11px; margin-bottom:8px; line-height:1.3; flex:1;">${p.descripcion}</p>
            <p style="color:var(--accent2); font-size:15px; font-weight:600; margin-bottom:10px;">${p.precio}</p>
            <div style="display:flex; gap:6px;">
              <button onclick="abrirModalEditar(${globalIndex})" style="flex:1; padding:8px; background:rgba(255,184,0,0.1); color:var(--accent2); border:1px solid var(--accent2); border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; text-transform:uppercase; transition:all 0.2s;">✏️ Editar</button>
              <button onclick="eliminarProducto(${globalIndex})" style="flex:1; padding:8px; background:rgba(220,53,69,0.1); color:#ff5060; border:1px solid rgba(220,53,69,0.4); border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; text-transform:uppercase; transition:all 0.2s;">🗑️ Borrar</button>
            </div>
          </div>
        </div>
      `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += `<div style="margin-bottom:24px;"><h5 style="color:var(--accent); margin-bottom:16px; font-size:18px; font-weight:600;">${cat}</h5>${productosHTML}</div>`;
  });
}

function mostrarAlerta(mensaje, tipo = "success") {
  const colores = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-primary"
  };

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white ${colores[tipo]} border-0 show mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');

  toast.innerHTML = `
    <div class="d-flex w-100">
      <div class="toast-body fw-500">
        ${mensaje}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()" aria-label="Close"></button>
    </div>
  `;

  const container = document.getElementById("toastContainer");
  if (container) {
    container.appendChild(toast);
    
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, 3000);
  } else {
    console.error("toastContainer no encontrado");
  }
}

function agregarCategoria() {
  const nuevaCat = document.getElementById("nuevaCategoria").value.trim();
  if (nuevaCat && !menuGlobal.some(p => p.categoria === nuevaCat)) {
    mostrarAlerta("✅ Categoría agregada. Ahora puedes agregar productos a ella.", "success");
    document.getElementById("nuevaCategoria").value = "";
    renderMenu();
  } else {
    mostrarAlerta("❌ Categoría ya existe o inválida.", "error");
  }
}

function agregarProducto() {
  const cat = document.getElementById("categoriaProducto").value.trim();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const desc = document.getElementById("descripcionProducto").value.trim();
  const precio = document.getElementById("precioProducto").value.trim();
  const imagenFile = document.getElementById("imagenProducto").files[0];

  if (!nombre || !desc || !precio || !imagenFile) {
    mostrarAlerta("⚠️ Todos los campos son requeridos, incluyendo la imagen.", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const imagenData = e.target.result;
    menuGlobal.push({
      nombre,
      descripcion: desc,
      precio,
      imagen: imagenData,
      categoria: cat
    });
    localStorage.setItem("menu", JSON.stringify(menuGlobal));
    renderMenu();
    // Clear fields
    document.getElementById("categoriaProducto").value = "";
    document.getElementById("nombreProducto").value = "";
    document.getElementById("descripcionProducto").value = "";
    document.getElementById("precioProducto").value = "";
    document.getElementById("imagenProducto").value = "";
  };
  reader.readAsDataURL(imagenFile);
}


function abrirModalEditar(index) {
  indexProductoEditando = index;
  const producto = menuGlobal[index];
  
  // Cargar datos del producto
  document.getElementById("editNombre").value = producto.nombre;
  document.getElementById("editDescripcion").value = producto.descripcion;
  document.getElementById("editPrecio").value = producto.precio;
  
  // Mostrar imagen
  const imagenSrc = producto.imagen ? producto.imagen : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23999" width="100" height="100"/%3E%3C/svg%3E';
  document.getElementById("editImagenPreview").src = imagenSrc;
  
  // Llenar select de categoría
  const selectCategoria = document.getElementById("editCategoria");
  selectCategoria.innerHTML = "";
  const categorias = [...new Set(menuGlobal.map(p => p.categoria))];
  categorias.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    selectCategoria.appendChild(option);
  });
  selectCategoria.value = producto.categoria;
  
  // Resetear el input de archivo de imagen
  document.getElementById("editImagenFile").value = "";
  
  document.getElementById("modalEditarProducto").style.display = "flex";
}

function cerrarModalEditar() {
  document.getElementById("modalEditarProducto").style.display = "none";
  indexProductoEditando = null;
}

function guardarEdicionProducto() {
  const index = indexProductoEditando;
  const nuevoNombre = document.getElementById("editNombre").value.trim();
  const nuevaDesc = document.getElementById("editDescripcion").value.trim();
  const nuevoPrecio = document.getElementById("editPrecio").value.trim();
  const nuevaCategoria = document.getElementById("editCategoria").value.trim();
  const imagenFile = document.getElementById("editImagenFile").files[0];
  const producto = menuGlobal[index];

  if (nuevoNombre && nuevaDesc && nuevoPrecio && nuevaCategoria) {
    if (imagenFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        menuGlobal[index] = {
          ...producto,
          nombre: nuevoNombre,
          descripcion: nuevaDesc,
          precio: nuevoPrecio,
          categoria: nuevaCategoria,
          imagen: e.target.result
        };
        localStorage.setItem("menu", JSON.stringify(menuGlobal));
        renderMenu();
        cerrarModalEditar();
        mostrarAlerta("✅ Producto actualizado", "success");
      };
      reader.readAsDataURL(imagenFile);
    } else {
      menuGlobal[index] = {
        ...producto,
        nombre: nuevoNombre,
        descripcion: nuevaDesc,
        precio: nuevoPrecio,
        categoria: nuevaCategoria
      };
      localStorage.setItem("menu", JSON.stringify(menuGlobal));
      renderMenu();
      cerrarModalEditar();
      mostrarAlerta("✅ Producto actualizado", "success");
    }
  } else {
    mostrarAlerta("⚠️ Completa todos los campos", "warning");
  }
}

// Cerrar modales al hacer click fuera
document.addEventListener("click", function(event) {
  const modalEditar = document.getElementById("modalEditarProducto");
  if (event.target === modalEditar) {
    cerrarModalEditar();
  }
  
  const modalPago = document.getElementById("modalPago");
  if (modalPago && event.target === modalPago) {
    cerrarModalPago();
  }
});

function editarProducto(index) {
  abrirModalEditar(index);
}

function eliminarProducto(index) {
  const producto = menuGlobal[index];
  mostrarConfirmacion(
    "Eliminar Producto",
    `¿Está seguro de que desea eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`,
    "🗑️",
    () => {
      menuGlobal.splice(index, 1);
      localStorage.setItem("menu", JSON.stringify(menuGlobal));
      renderMenu();
      mostrarAlerta("🗑️ " + producto.nombre + " eliminado", "error");
    }
  );
}

function actualizarEstadisticas() {
  const ahora = new Date();
  const hoyInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const hoyFin = new Date(hoyInicio.getTime() + 24 * 60 * 60 * 1000);
  
  let pedidosHoy = 0;
  let completados = 0;
  let totalVendidoHoy = 0;

  pedidosGlobal.forEach(pedido => {
    const fechaPedido = new Date(pedido.fecha);
    if (fechaPedido >= hoyInicio && fechaPedido < hoyFin) {
      pedidosHoy++;
      if (pedido.estado === 'finalizado') {
        totalVendidoHoy += pedido.total;
      }
    }
    if (pedido.estado === 'finalizado') {
      completados++;
    }
  });
  
  const elPedidosHoy = document.getElementById("pedidosHoy");
  const elCompletados = document.getElementById("pedidosCompletados");
  const elTotalVendidoHoy = document.getElementById("totalVendidoHoy");

  if (elPedidosHoy) elPedidosHoy.innerText = pedidosHoy;
  if (elCompletados) elCompletados.innerText = completados;
  if (elTotalVendidoHoy) elTotalVendidoHoy.innerText = `$${totalVendidoHoy}`;
}

function buscarProductos() {
  const busqueda = document.getElementById("buscarProducto").value.toLowerCase();
  const contenedor = document.getElementById("listaMenu");
  
  if (!busqueda.trim()) {
    renderMenu();
    return;
  }
  
  contenedor.innerHTML = "";
  const productosFiltrados = menuGlobal.filter(p => 
    p.nombre.toLowerCase().includes(busqueda) || 
    p.descripcion.toLowerCase().includes(busqueda) ||
    p.categoria.toLowerCase().includes(busqueda)
  );
  
  if (productosFiltrados.length === 0) {
    contenedor.innerHTML = '<p style="color:var(--muted); text-align:center; padding:20px;">No se encontraron productos</p>';
    return;
  }
  
  const categorias = [...new Set(productosFiltrados.map(p => p.categoria))];
  
  categorias.forEach(cat => {
    const productos = productosFiltrados.filter(p => p.categoria === cat);
    let productosHTML = `<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(220px, 1fr)); gap:14px;">`;
    
    productos.forEach((p) => {
      const globalIndex = menuGlobal.indexOf(p);
      const imagenSrc = p.imagen ? p.imagen : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23999" width="100" height="100"/%3E%3C/svg%3E';
      
      productosHTML += `
        <div style="background:var(--surface); border:1px solid var(--border); border-radius:12px; overflow:hidden; transition:all 0.2s; display:flex; flex-direction:column;">
          <img src="${imagenSrc}" style="width:100%; height:140px; object-fit:cover;">
          <div style="padding:16px; flex:1; display:flex; flex-direction:column;">
            <h6 style="color:var(--text); margin-bottom:6px; font-size:14px; font-weight:600;">${p.nombre}</h6>
            <p style="color:var(--muted); font-size:11px; margin-bottom:8px; line-height:1.3; flex:1;">${p.descripcion}</p>
            <p style="color:var(--accent2); font-size:15px; font-weight:600; margin-bottom:10px;">${p.precio}</p>
            <div style="display:flex; gap:6px;">
              <button onclick="abrirModalEditar(${globalIndex})" style="flex:1; padding:8px; background:rgba(255,184,0,0.1); color:var(--accent2); border:1px solid var(--accent2); border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; text-transform:uppercase; transition:all 0.2s;">✏️ Editar</button>
              <button onclick="eliminarProducto(${globalIndex})" style="flex:1; padding:8px; background:rgba(220,53,69,0.1); color:#ff5060; border:1px solid rgba(220,53,69,0.4); border-radius:6px; cursor:pointer; font-size:11px; font-weight:600; text-transform:uppercase; transition:all 0.2s;">🗑️ Borrar</button>
            </div>
          </div>
        </div>
      `;
    });
    
    productosHTML += `</div>`;
    contenedor.innerHTML += `<div style="margin-bottom:24px;"><h5 style="color:var(--accent); margin-bottom:16px; font-size:18px; font-weight:600;">${cat}</h5>${productosHTML}</div>`;
  });
}

window.addEventListener('storage', (event) => {
  if (event.key === 'pedidos') {
    cargarPedidos();
  }
  if (event.key === 'menu') {
    cargarMenu();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  cargarPedidos();
  cargarMenu();
  actualizarEstadisticas();
  
  // Recargar pedidos cada 2 segundos
  setInterval(() => {
    const pedidosActuales = obtenerPedidosLocal();
    if (JSON.stringify(pedidosActuales) !== JSON.stringify(pedidosGlobal)) {
      pedidosGlobal = pedidosActuales;
      renderPedidos(pedidosGlobal);
      actualizarEstadisticas();
    }
  }, 2000);
});
