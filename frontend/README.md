# MERN Authentication Boilerplate - Frontend

Frontend moderno construido con React 18 y Vite, implementando un sistema completo de autenticación con las mejores prácticas de la industria.

## 🚀 Tecnologías

- **React 18** - Biblioteca UI moderna con concurrent features
- **Vite** - Build tool ultra rápido con HMR instantáneo
- **React Router 6** - Navegación declarativa y rutas
- **TanStack Query** - Manejo de estado del servidor y caché
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - Cliente HTTP con interceptores
- **React Hook Form** - Formularios performantes con validación
- **Zod** - Validación de esquemas type-safe
- **React Hot Toast** - Notificaciones toast elegantes
- **Lucide React** - Iconos modernos y personalizables

## ✨ Características

### Autenticación
- ✅ Sistema completo de registro y login
- ✅ Validación de formularios en tiempo real
- ✅ Manejo de sesiones con JWT
- ✅ Rutas protegidas (ProtectedRoute)
- ✅ Rutas públicas (PublicRoute)
- ✅ Redirección automática según estado de autenticación
- ✅ Logout seguro

### UI/UX
- ✅ Diseño moderno y responsive
- ✅ Dark mode con ThemeContext
- ✅ Navegación integrada entre rutas protegidas
- ✅ Componentes reutilizables (Input, Button, Loader)
- ✅ Notificaciones toast para feedback
- ✅ Animaciones suaves
- ✅ Paleta de colores consistente
- ✅ Iconos modernos
- ✅ Páginas de ejemplo (Profile, Settings)

### Arquitectura
- ✅ Separación de responsabilidades
- ✅ Custom hooks (useAuth)
- ✅ Context API para estado global
- ✅ Interceptores de Axios para tokens
- ✅ Validación con Zod schemas
- ✅ Código modular y escalable

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Configuración de Axios y servicios API
│   ├── auth.api.js        # Servicios de autenticación
│   └── axios.js           # Configuración de Axios con interceptores
├── components/
│   ├── auth/              # Componentes de autenticación
│   │   ├── ProtectedRoute.jsx
│   │   └── PublicRoute.jsx
│   └── common/            # Componentes reutilizables
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Loader.jsx
├── contexts/              # Context API
│   └── ThemeContext.jsx  # Context para dark mode
├── hooks/                 # Custom hooks
│   └── useAuth.js        # Hook de autenticación
├── pages/                 # Páginas principales
│   ├── Home.jsx          # Página de inicio
│   ├── Login.jsx         # Página de login
│   ├── Register.jsx      # Página de registro
│   ├── Profile.jsx       # Página de perfil (protegida)
│   └── Settings.jsx      # Página de configuración (protegida)
├── schemas/               # Esquemas de validación Zod
│   └── auth.schema.js    # Schemas de autenticación
├── utils/                 # Utilidades
│   └── toast.js          # Configuración de toast
├── App.jsx               # Componente principal con rutas
├── main.jsx              # Punto de entrada
└── index.css             # Estilos globales con Tailwind
```

## 🚀 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📜 Scripts Disponibles

```bash
npm run dev        # Iniciar servidor de desarrollo con Vite
npm run build      # Build optimizado para producción
npm run preview    # Preview del build de producción
npm run lint       # Ejecutar ESLint
```

## 🎨 Características del UI

### Componentes Comunes

#### Input
Componente de input reutilizable con:
- Label configurable
- Validación visual de errores
- Soporte para diferentes tipos (text, email, password, etc.)
- Integración con react-hook-form
- Estilos consistentes con Tailwind

#### Button
Componente de botón con:
- Variantes (primary, secondary)
- Estado de carga (isLoading)
- Disabled state
- Iconos opcionales
- Tamaños configurables

#### Loader
Spinner de carga animado para estados de carga.

### Páginas

#### Home
- Hero section atractivo
- Sección de características
- Call to action
- Navegación con dark mode toggle
- Totalmente responsive

#### Login
- Formulario con validación en tiempo real
- Manejo de errores del servidor
- Redirección automática al autenticarse
- Link a página de registro

#### Register
- Formulario de registro con validación
- Confirmación de contraseña
- Validación de username, email y password
- Link a página de login

#### Profile (Ruta Protegida)
- Muestra información del usuario autenticado
- Datos del perfil: username, email, fecha de registro
- Estado de la cuenta
- Navegación a otras rutas protegidas
- Botón de logout
- Totalmente responsive

#### Settings (Ruta Protegida)
- Página de ejemplo de configuración
- Secciones: Cuenta, Apariencia, Notificaciones, Seguridad
- Navegación entre rutas protegidas
- Cambio de tema integrado
- Ejemplo de UI para configuraciones

### Rutas

#### ProtectedRoute
Componente que protege rutas que requieren autenticación:
- Verifica si el usuario está autenticado
- Redirige a /login si no está autenticado
- Muestra loader mientras verifica autenticación

#### PublicRoute
Componente para rutas solo accesibles sin autenticación:
- Redirige a /profile si el usuario ya está autenticado
- Útil para login y registro

### Navegación entre Rutas Protegidas

Las rutas protegidas (`/profile` y `/settings`) incluyen navegación integrada:
- Header compartido con links de navegación
- Usuario autenticado puede moverse entre páginas
- Botón de logout disponible en todas las rutas protegidas
- Toggle de dark mode en el header
- Resaltado visual de la página actual

**Rutas disponibles:**
- `/` - Home (pública, redirige a /profile si está autenticado)
- `/login` - Login (pública)
- `/register` - Registro (pública)
- `/profile` - Perfil del usuario (protegida)
- `/settings` - Configuración (protegida, ejemplo de ruta adicional)

## 🔐 Autenticación con Cookies httpOnly

### Método de Autenticación

**IMPORTANTE**: Este boilerplate utiliza **cookies httpOnly** para la autenticación, NO localStorage ni sessionStorage.

**Ventajas de las cookies httpOnly:**
- 🔒 No accesibles desde JavaScript (protección contra XSS)
- 🔒 Enviadas automáticamente en cada request
- 🔒 Más seguras que localStorage
- 🔒 Protección CSRF integrada

### useAuth Hook
Custom hook que proporciona:
```javascript
const {
  user,              // Usuario actual
  isAuthenticated,   // Estado de autenticación
  isLoading,         // Estado de carga inicial
  login,             // Función de login
  register,          // Función de registro
  logout,            // Función de logout
  isLoggingIn,       // Estado de login
  isRegistering      // Estado de registro
} = useAuth();
```

### Flujo de Autenticación
1. Usuario se registra o hace login
2. Backend devuelve datos del usuario + establece cookie httpOnly con el token JWT
3. La cookie se envía automáticamente en cada request (sin necesidad de código extra)
4. Axios está configurado con `withCredentials: true` para enviar cookies
5. Usuario autenticado accede a rutas protegidas

## 🎨 Personalización

### Colores
Edita `tailwind.config.js` para cambiar la paleta:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        50: '#eff6ff',
        // ... más tonos
      }
    }
  }
}
```

### Dark Mode
El tema se gestiona con ThemeContext y se persiste en localStorage.

## 🔧 Integración con Backend

El frontend se comunica con el backend mediante Axios con soporte para cookies.

### Endpoints Utilizados
- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login de usuario
- `POST /auth/logout` - Logout de usuario
- `GET /auth/me` - Obtener usuario actual

### Configuración de Axios para Cookies

**Configuración esencial** en `src/api/axios.js`:

```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ⭐ CRUCIAL: Permite envío de cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de respuesta para manejar errores de autenticación
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirigir a login si no está autenticado
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
```

**Importante**: `withCredentials: true` es necesario para que Axios envíe las cookies en cada request.

### CORS en Desarrollo

Para que las cookies funcionen entre diferentes orígenes (frontend en :3000, backend en :5000):

1. Backend debe tener `credentials: true` en CORS
2. Frontend debe usar `withCredentials: true` en Axios
3. Backend debe especificar el origin exacto (no puede usar `*`)

## 📦 Build para Producción

```bash
npm run build
```

Los archivos optimizados estarán en `dist/`:
- Code splitting automático
- Tree shaking
- Minificación
- Optimización de assets

Preview del build:
```bash
npm run preview
```

## 🚀 Despliegue

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Subir carpeta dist/
```

### Configuración de Variables de Entorno
En tu plataforma de hosting, configura:
- `VITE_API_URL`: URL de tu API backend

## 🔒 Seguridad

- ✅ Tokens JWT manejados de forma segura
- ✅ Cookies httpOnly (configuradas desde backend)
- ✅ Validación de datos en cliente y servidor
- ✅ Sanitización de inputs
- ✅ HTTPS en producción
- ✅ CORS configurado correctamente
