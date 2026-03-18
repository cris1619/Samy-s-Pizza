# Samy's Pizza

Sitio web para la pizzería Sam's Pizza.

## Configuración de Firebase

Para que los pedidos persistan en diferentes navegadores, se utiliza Firebase Firestore.

### Pasos para configurar:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Ve a Configuración del proyecto > General > Tus apps > Agrega una app web
5. Copia la configuración de Firebase

### Actualizar archivos:

En `index.html` y `admin.html`, reemplaza la configuración de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};
```

### Reglas de Firestore:

En Firebase Console > Firestore Database > Reglas, establece:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Nota:** Para producción, configura reglas de seguridad apropiadas.

## Despliegue en GitHub Pages

1. Sube el código a un repositorio de GitHub
2. Ve a Settings > Pages
3. Selecciona la rama `main` y carpeta `/ (root)`
4. El sitio estará disponible en `https://tuusuario.github.io/turepositorio/`

## Funcionalidades

- Menú interactivo
- Carrito de compras
- Envío de pedidos por WhatsApp
- Panel de administración para gestionar pedidos
- Persistencia de datos con Firebase</content>
<parameter name="filePath">c:\Users\nylle\OneDrive\Desktop\pizzeria\Samy-s-Pizza\README.md