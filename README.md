<div align="center">

# 🍕 Sammy's Pizza

### Sistema Web de Pedidos

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp_API-25D366?style=flat-square&logo=whatsapp&logoColor=white)](https://wa.me/)
[![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-orange?style=flat-square)]()

</div>

---

## 📌 Descripción

**Sammy's Pizza** es una aplicación web desarrollada para gestionar el menú de una pizzería y facilitar a los clientes la realización de pedidos de forma rápida y sencilla a través de WhatsApp.

El sistema cuenta con una interfaz de cliente para explorar el menú y armar pedidos, y un panel de administración *(actualmente en fase Beta)* para gestionar productos y visualizar pedidos.

---

## 🚀 Funcionalidades

### 👤 Clientes

| Funcionalidad | Estado |
|---|---|
| Visualización del menú de pizzas | ✅ Disponible |
| Modal con detalles del producto | ✅ Disponible |
| Selección y carrito de productos | ✅ Disponible |
| Generación de resumen del pedido | ✅ Disponible |
| Envío del pedido por WhatsApp | ✅ Disponible |

### 🛠️ Administrador

> ⚠️ **Fase Beta — No disponible en producción**

| Funcionalidad | Estado |
|---|---|
| Panel de administración | 🔄 Beta |
| Crear, editar y eliminar productos | 🔄 Beta |
| Visualización de pedidos realizados | 🔄 Beta |
| Persistencia de datos en LocalStorage | 🔄 Beta |

---

## 🧰 Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura del proyecto |
| **CSS3** | Estilos y diseño visual |
| **JavaScript (Vanilla)** | Lógica del cliente y del administrador |
| **Bootstrap** | Diseño responsive y componentes UI |
| **LocalStorage** | Almacenamiento temporal en el navegador |
| **API de WhatsApp** | Envío automatizado de pedidos |

---

## 📂 Estructura del proyecto

```
sammys-pizza/
│
├── index.html          # Página principal (vista del cliente)
├── admin.html          # Panel de administración (fase Beta)
│
├── css/
│   └── styles.css      # Estilos personalizados
│
├── js/
│   ├── app.js          # Lógica principal del cliente
│   ├── admin.js        # Lógica del administrador (fase Beta)
│   └── storage.js      # Manejo de LocalStorage
│
├── assets/
│   └── images/         # Imágenes de los productos
│
└── README.md
```

---

## ⚙️ Instalación y uso

### Prerrequisitos

- Navegador web moderno (Chrome, Firefox, Edge)
- Extensión **Live Server** para VS Code *(requerida para funcionamiento correcto)*

### Pasos

**1. Clona el repositorio:**
```bash
git clone https://github.com/cris1619/Samy-s-Pizza
```

**2. Accede al directorio del proyecto:**
```bash
cd sammys-pizza
```

**3. Abre el proyecto:**

Abre el archivo `index.html` con la extensión **Live Server** de VS Code.  
> Haz clic derecho sobre `index.html` → *"Open with Live Server"*

---

## 📲 Flujo del pedido

```
1. El usuario navega el menú y selecciona productos
        ↓
2. Los productos se agregan al carrito
        ↓
3. Se genera un resumen del pedido
        ↓
4. Se construye un mensaje automáticamente con el detalle
        ↓
5. Se redirige a WhatsApp con el pedido listo para enviar 🚀
```

---

## ⚠️ Limitaciones actuales

- 📦 Los datos se almacenan únicamente en **LocalStorage** (sin persistencia en servidor)
- 🔐 No existe autenticación de usuarios ni del administrador
- 🗄️ No hay base de datos real integrada
- 🧪 El panel de administración está en **fase Beta** y no está disponible en producción

---

## 🔮 Mejoras futuras

- [ ] Integración con base de datos (MySQL o Firebase)
- [ ] Backend con Node.js o Laravel
- [ ] Sistema de autenticación para administradores
- [ ] Pasarela de pagos en línea
- [ ] Historial de pedidos persistente en servidor
- [ ] Notificaciones en tiempo real

---

## 👨‍💻 Autor

**Cristian Solano**  
📚 Ingeniería de Sistemas — UNAD  
🎓 Tecnólogo ADSO — SENA  
📍 Málaga, Santander, Colombia

---

## 📄 Licencia

Este proyecto fue desarrollado con fines exclusivos para **Sammy's Pizza**.  
Todos los derechos reservados © 2026.
