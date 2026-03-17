const params = new URLSearchParams(window.location.search);
const auth = params.get("auth");

let pedidosGlobal = [];

function cargarPedidos() {
  pedidosGlobal = JSON.parse(localStorage.getItem("pedidos")) || [];
  renderPedidos(pedidosGlobal);
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

    totalGeneral += pedido.total;

    let productosHTML = "";

    pedido.productos.forEach(p => {
      productosHTML += `
        <li>${p.nombre} x${p.cantidad} - $${p.precio * p.cantidad}</li>
      `;
    });

    contenedor.innerHTML += `
      <div class="pedido-card">
        <h5>${pedido.cliente}</h5>
        <small>${pedido.fecha}</small>

        <ul>${productosHTML}</ul>

        <strong>Total: $${pedido.total}</strong><br>

        <button class="btn btn-danger btn-sm mt-2"
          onclick="eliminarPedido(${index})">
          Eliminar
        </button>
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

    let fechaPedido = new Date(pedido.fecha);
    let inicio = fechaInicio ? new Date(fechaInicio) : null;
    let fin = fechaFin ? new Date(fechaFin) : null;

    let coincideFecha = true;

    if (inicio && fechaPedido < inicio) coincideFecha = false;
    if (fin && fechaPedido > fin) coincideFecha = false;

    return coincideNombre && coincideFecha;
  });

  renderPedidos(filtrados);
}
function limpiarFiltros() {
  document.getElementById("filtroCliente").value = "";
  document.getElementById("fechaInicio").value = "";
  document.getElementById("fechaFin").value = "";

  renderPedidos(pedidosGlobal);
}
function eliminarPedido(index) {

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  if (confirm("¿Eliminar este pedido?")) {
    pedidos.splice(index, 1);
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
    cargarPedidos();
  }
}

function cerrarSesion() {
  if (confirm("¿Cerrar sesión?")) {
    window.location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", cargarPedidos);