let menuData = [];
let enviando = false;

fetch('menu.json')
  .then(res => res.json())
  .then(data => {
    menuData = data;
    mostrarMenu(data);
  });

function mostrarMenu(data) {

  let container = document.getElementById("menuContainer");
  container.innerHTML = "";

  data.forEach(pizza => {

    container.innerHTML += `
      <div class="col-6 col-md-4">
        <div class="card pizza-card" onclick="abrirModal('${pizza.nombre}', '${pizza.descripcion}', '${pizza.precio}', '${pizza.imagen}')">
          <img src="${pizza.imagen}" class="card-img-top">
          <div class="card-body bg-dark text-white text-center">
            <h5>${pizza.nombre}</h5>
          </div>
        </div>
      </div>
    `;

    

  });
}

function filtrar(categoria) {
  if (categoria === 'todos') {
    mostrarMenu(menuData);
  } else {
    let filtrados = menuData.filter(p => p.categoria === categoria);
    mostrarMenu(filtrados);
  }
}

function abrirModal(nombre, descripcion, precio, imagen) {


  document.getElementById("modalTitulo").innerText = nombre;
  document.getElementById("modalDesc").innerText = descripcion;
  document.getElementById("modalPrecio").innerText = precio;
  document.getElementById("modalImg").src = imagen;

  let mensaje = `Hola, quiero pedir la pizza ${nombre} ${precio}`;
  let url = `https://wa.me/573143376449?text=${encodeURIComponent(mensaje)}`;

  document.getElementById("btnWhatsapp").href = url;

  let modal = new bootstrap.Modal(document.getElementById('pizzaModal'));
  modal.show();
}

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

document.addEventListener("DOMContentLoaded", () => {
  actualizarContador();
});

// 🔹 Agregar al carrito (llamar desde modal)
function agregarAlCarrito(nombre, precio) {

  let item = carrito.find(p => p.nombre === nombre);

  if (item) {
    item.cantidad++;
  } else {
    carrito.push({
      nombre,
      precio: parseInt(precio.replace(/\D/g, "")),
      cantidad: 1
    });
  }
  animarCarrito();

  guardarCarrito();

  mostrarAlerta(`✅ ${nombre} agregado al carrito`, "success");
  reproducirSonido();
}

// 🔹 Guardar
function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  cerrarTodosLosModales();
  actualizarContador();
}

// 🔹 Contador
function actualizarContador() {
  let total = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  document.getElementById("contador").innerText = total;
}

// 🔹 Abrir carrito
function abrirCarrito() {
  let lista = document.getElementById("listaCarrito");
  let total = 0;

  lista.innerHTML = "";

  carrito.forEach((item, index) => {
    let subtotal = item.precio * item.cantidad;
    total += subtotal;

    lista.innerHTML += `
      <div class="item-carrito">
        <div>
          <strong>${item.nombre}</strong><br>
          $${item.precio} c/u
        </div>

        <div class="controles">
          <button onclick="cambiarCantidad(${index}, -1)">−</button>
          <span>${item.cantidad}</span>
          <button onclick="cambiarCantidad(${index}, 1)">+</button>
        </div>

        <div>
          $${subtotal}
          <button onclick="eliminarItem(${index})">X</button>
        </div>
      </div>
    `;
  });

  document.getElementById("total").innerText = "$" + total;

  let modal = new bootstrap.Modal(document.getElementById('carritoModal'));
  modal.show();
}

// 🔹 Enviar pedido
function enviarPedido() {

  if (carrito.length === 0) {
    mostrarAlerta("⚠️ El carrito está vacío", "warning");
    return;
  }

  let modal = new bootstrap.Modal(document.getElementById('clienteModal'));
  modal.show();
}

function confirmarPedido() {

  if (enviando) return;

  let nombre = document.getElementById("nombreCliente").value.trim();

  if (nombre === "") {
    mostrarAlerta("⚠️ Ingresa tu nombre", "warning");
    return;
  }

  enviando = true;

  setTimeout(() => {
    enviando = false;
  }, 2000);

  let total = 0;
  let mensaje = "*PEDIDO PIZZERÍA SAMY'S*\n\n";
  mensaje += `Cliente: ${nombre}\n\n`;

  carrito.forEach(item => {
    let subtotal = item.precio * item.cantidad;
    total += subtotal;

    mensaje += `${item.nombre}\n`;
    mensaje += `${item.cantidad} x $${item.precio} = $${subtotal}\n\n`;
  });

  mensaje += `TOTAL: $${total}`;

  let url = `https://wa.me/573143376449?text=${encodeURIComponent(mensaje)}`;

  guardarPedido(nombre, carrito, total);

  window.open(url, "_blank");

  cerrarTodosLosModales();

  mostrarAlerta("Pedido listo para enviar en WhatsApp", "success");

  document.getElementById("nombreCliente").value = "";
}

function guardarPedido(nombre, carrito, total) {

  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

  let nuevoPedido = {
    cliente: nombre,
    productos: JSON.parse(JSON.stringify(carrito)),
    total: total,
    fecha: new Date().toISOString()
  };

  pedidos.push(nuevoPedido);

  localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function verPedidos() {
  let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  console.log(pedidos);
}

// 🔹 Inicializar contador al cargar
actualizarContador();

function cambiarCantidad(index, cambio) {
    mostrarAlerta("🔄 Cantidad actualizada", "info");
  carrito[index].cantidad += cambio;

  if (carrito[index].cantidad <= 0) {
    carrito.splice(index, 1);
  }

  guardarCarrito();
  cerrarTodosLosModales();
  abrirCarrito();
}

function mostrarAlerta(mensaje, tipo = "success") {

  let colores = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-primary"
  };

  let toast = document.createElement("div");
  toast.className = `toast align-items-center text-white ${colores[tipo]} border-0 show mb-2`;

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${mensaje}
      </div>
      <button class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>
  `;

  document.getElementById("toastContainer").appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

const sonidoAgregar = new Audio("sounds/click.mp3");

function reproducirSonido() {
  sonidoAgregar.currentTime = 0;
  sonidoAgregar.play();
}

let indexAEliminar = null;

function eliminarItem(index) {

  indexAEliminar = index;

  document.getElementById("productoEliminar").innerText =
    carrito[index].nombre;

  let modal = new bootstrap.Modal(document.getElementById('confirmModal'));
  modal.show();
}

// botón confirmar
document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("btnConfirmarEliminar")
    .addEventListener("click", () => {

      if (indexAEliminar !== null) {
        let nombre = carrito[indexAEliminar].nombre;

        carrito.splice(indexAEliminar, 1);

        guardarCarrito();
        cerrarTodosLosModales();
        abrirCarrito();

        mostrarAlerta(`❌ ${nombre} eliminado`, "error");

        indexAEliminar = null;
      }
    });

});

function cerrarTodosLosModales() {

  document.querySelectorAll('.modal.show').forEach(modal => {
    let instancia = bootstrap.Modal.getInstance(modal);
    if (instancia) instancia.hide();
  });

  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
  document.body.classList.remove('modal-open');
  document.body.style = '';
}

function animarCarrito() {
  let btn = document.querySelector(".carrito-btn");

  btn.classList.add("animar");

  setTimeout(() => {
    btn.classList.remove("animar");
  }, 300);
}

document.addEventListener("DOMContentLoaded", () => {

  const carousel = document.querySelector('#carouselPizza');

  if (carousel) {
    carousel.addEventListener('slide.bs.carousel', function () {
      const videos = document.querySelectorAll('video');
      videos.forEach(video => {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

});
