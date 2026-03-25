🍕 Sammy’s Pizza - Sistema Web de Pedidos
📌 Descripción

Sammy’s Pizza es una aplicación web desarrollada para gestionar el menú de una pizzería y permitir a los clientes realizar pedidos de manera sencilla a través de WhatsApp.

El sistema también incluye un panel de administración básico para gestionar productos y visualizar pedidos, utilizando almacenamiento local en el navegador.

🚀 Funcionalidades

👤 Cliente
Visualización del menú de pizzas
Modal con detalles del producto
Selección de productos
Generación de pedido
Envío del pedido por WhatsApp

🛠️ Administrador
Panel de administración sencillo
Crear, editar y eliminar productos
Visualización de pedidos realizados
Persistencia de datos en LocalStorage

🧰 Tecnologías utilizadas
HTML5
CSS3
JavaScript (Vanilla)
Bootstrap (para diseño responsive)
LocalStorage (almacenamiento temporal)
API de WhatsApp (para envío de pedidos)

📂 Estructura del proyecto
/sammys-pizza
│
├── index.html          # Página principal (cliente)
├── admin.html          # Panel de administración
├── css/
│   └── styles.css
├── js/
│   ├── app.js          # Lógica principal
│   ├── admin.js        # Lógica del administrador
│   └── storage.js      # Manejo de LocalStorage
├── assets/
│   └── images/         # Imágenes de productos
└── README.md

⚙️ Instalación y uso
Clona el repositorio:
git clone https://github.com/tu-usuario/sammys-pizza.git
Abre el proyecto:
cd sammys-pizza
Ejecuta el proyecto:
Abre el archivo index.html en tu navegador

📲 Funcionamiento del pedido
El usuario selecciona productos
Se genera un resumen del pedido
Se construye un mensaje automáticamente
Se redirige a WhatsApp con el pedido listo para enviar

⚠️ Limitaciones actuales
Los datos se almacenan en LocalStorage (no persistente en servidor)
No hay autenticación de usuarios
No hay base de datos real
El panel admin es básico

🔮 Mejoras futuras
Integración con base de datos (MySQL / Firebase)
Backend con Node.js o Laravel
Autenticación de administrador
Sistema de pagos en línea
Historial de pedidos en servidor
Notificaciones en tiempo real

👨‍💻 Autor

Cristian Solano
Ingeniería de Sistemas – UNAD
Tecnologo ADSO - SENA
Málaga, Santander

📄 Licencia

Este proyecto es de uso para Sammy's Pizza
