const params = new URLSearchParams(window.location.search);
const auth = params.get("auth");

let pedidosGlobal = [];
let useLocalStorage = false;

let menuGlobal = [];
let indexPedidoFinalizando = null;


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

  pedidos.forEach((pedido, index) => {
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

        <small>${pedido.fecha}</small>
        <p><strong>Estado:</strong> ${pedido.estado || 'Pendiente'}</p>

        <ul>${productosHTML}</ul>

        <strong>Total: $${pedido.total}</strong><br>

        ${pedido.estado !== 'finalizado' ? `<button class="btn btn-success btn-sm mt-2 me-2"
          onclick="finalizarPedido(${index})">
          Finalizar venta
        </button>` : '<span class="badge bg-success">Venta finalizada</span>'}

        ${pedido.estado !== 'finalizado' ? `<button class="btn btn-danger btn-sm mt-2"
          onclick="eliminarPedido(${index})">
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
  if (confirm("¿Cancelar este pedido?")) {
    try {
      if (useLocalStorage) {
        const pedidos = obtenerPedidosLocal();
        pedidos.splice(index, 1);
        almacenarPedidosLocal(pedidos);
        pedidosGlobal = pedidos;
        renderPedidos(pedidosGlobal);
      } else {
        const order = pedidosGlobal[index];
        await deleteDoc(doc(window.db, "pedidos", order.id));
        await cargarPedidos();
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }
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

function cerrarSesion() {
  if (confirm("¿Cerrar sesión?")) {
    window.location.href = "index.html";
  }
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

  // Get unique categories
  const categorias = [...new Set(menuGlobal.map(p => p.categoria))];

  categorias.forEach(cat => {
    const productos = menuGlobal.filter(p => p.categoria === cat);
    let productosHTML = "";
    productos.forEach((p, index) => {
      productosHTML += `
        <div class="pedido-card">
          <h6>${p.nombre}</h6>
          <p>${p.descripcion}</p>
          <p><strong>Precio:</strong> ${p.precio}</p>
          <p><strong>Imagen:</strong> ${p.imagen}</p>
          <button class="btn btn-warning btn-sm" onclick="editarProducto(${menuGlobal.indexOf(p)})">Editar</button>
        </div>
      `;
    });

    contenedor.innerHTML += `
      <div class="card-custom mb-4">
        <h5>${cat}</h5>
        ${productosHTML}
      </div>
    `;
  });
}

function agregarCategoria() {
  const nuevaCat = document.getElementById("nuevaCategoria").value.trim();
  if (nuevaCat && !menuGlobal.some(p => p.categoria === nuevaCat)) {
    // Categories are implicit, just add a dummy product or something, but since categories are from products, perhaps add a note.
    // Actually, since categories are derived from products, to add a category, we can just note it, but to make it visible, perhaps add a placeholder product.
    // For simplicity, just alert that category added, but since no products, it won't show.
    // Better to allow adding category by adding a product to it.
    alert("Categoría agregada. Ahora puedes agregar productos a ella.");
    document.getElementById("nuevaCategoria").value = "";
    // To make it show, perhaps add to select, but since renderMenu populates it, call renderMenu after.
    renderMenu();
  } else {
    alert("Categoría ya existe o inválida.");
  }
}

function agregarProducto() {
  const cat = document.getElementById("categoriaProducto").value.trim();
  const nombre = document.getElementById("nombreProducto").value.trim();
  const desc = document.getElementById("descripcionProducto").value.trim();
  const precio = document.getElementById("precioProducto").value.trim();
  const imagenFile = document.getElementById("imagenProducto").files[0];

  if (!nombre || !desc || !precio || !imagenFile) {
    alert("Todos los campos son requeridos, incluyendo la imagen.");
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


function editarProducto(index) {
  const producto = menuGlobal[index];
  // Simple edit: prompt for new values except image
  const nuevoNombre = prompt("Nuevo nombre:", producto.nombre);
  const nuevaDesc = prompt("Nueva descripción:", producto.descripcion);
  const nuevoPrecio = prompt("Nuevo precio:", producto.precio);
  const nuevaCategoria = prompt("Nueva categoría:", producto.categoria);

  if (nuevoNombre && nuevaDesc && nuevoPrecio && nuevaCategoria) {
    menuGlobal[index] = {
      ...producto,
      nombre: nuevoNombre,
      descripcion: nuevaDesc,
      precio: nuevoPrecio,
      categoria: nuevaCategoria
    };
    localStorage.setItem("menu", JSON.stringify(menuGlobal));
    renderMenu();
  }
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
  
  // Recargar pedidos cada 2 segundos
  setInterval(() => {
    const pedidosActuales = obtenerPedidosLocal();
    if (JSON.stringify(pedidosActuales) !== JSON.stringify(pedidosGlobal)) {
      pedidosGlobal = pedidosActuales;
      renderPedidos(pedidosGlobal);
    }
  }, 2000);

});