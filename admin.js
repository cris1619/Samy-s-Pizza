const params = new URLSearchParams(window.location.search);
const auth = params.get("auth");

let pedidosGlobal = [];
let useLocalStorage = false;

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

    contenedor.innerHTML += `
      <div class="pedido-card">
        <h5>${pedido.cliente}</h5>
        <p><strong>Teléfono:</strong> ${pedido.telefono || 'No especificado'}</p>
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
  if (confirm("¿Finalizar esta venta? El cliente podrá hacer nuevos pedidos.")) {
    try {
      if (useLocalStorage) {
        const pedidos = obtenerPedidosLocal();
        pedidos[index].estado = "finalizado";
        almacenarPedidosLocal(pedidos);
        pedidosGlobal = pedidos;
        renderPedidos(pedidosGlobal);
      } else {
        const order = pedidosGlobal[index];
        await updateDoc(doc(window.db, "pedidos", order.id), { estado: "finalizado" });
        await cargarPedidos();
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  }
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

function cerrarSesion() {
  if (confirm("¿Cerrar sesión?")) {
    window.location.href = "index.html";
  }
}

window.addEventListener('storage', (event) => {
  if (event.key === 'pedidos') {
    cargarPedidos();
  }
});

document.addEventListener("DOMContentLoaded", cargarPedidos);