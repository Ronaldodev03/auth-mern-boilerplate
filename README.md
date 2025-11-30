# MERN Authentication Boilerplate

![MERN Auth UI](Screenshot%202025-11-30%20052654.png)

Sistema de autenticacion completo y seguro construido con MongoDB, Express, React y Node.js. Este boilerplate implementa las mejores practicas de la industria para la autenticacion de usuarios.

## Caracteristicas

### Backend
- Autenticacion JWT con cookies httpOnly y secure
- Proteccion CSRF mediante verificacion de origin/referer
- Encriptacion de contraseñas con bcrypt (salt 12)
- Validacion de datos con express-validator
- Manejo de errores centralizado con AppError personalizado
- AsyncHandler para funciones asincronas
- Graceful shutdown (SIGTERM y unhandledRejection)
- Middleware de autenticacion con verificacion de tokens
- CORS configurado con credentials
- Health check endpoint
- Separacion de responsabilidades (MVC pattern)

### Frontend
- React Router para navegacion
- Rutas protegidas (ProtectedRoute) y publicas (PublicRoute)
- Validacion con Zod y react-hook-form
- Dark mode con ThemeContext
- Tailwind CSS para estilos
- Toast notifications con react-hot-toast
- Componentes reutilizables (Input, Button, Loader, etc.)
- Custom hooks (useAuth)
- Axios configurado con interceptores

## Prerequisitos

- Node.js 18+
- MongoDB 5+
- npm o pnpm

## Instalacion

### 1. Clonar el repositorio
```bash
git clone <tu-repo>
cd mern-boilerplate
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env` en la carpeta `backend`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=tu_secret_key_super_segura_aqui
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:3000
```

### 3. Configurar el Frontend

```bash
cd frontend
npm install
```

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Uso

### Iniciar el Backend
```bash
cd backend
npm run dev
```

### Iniciar el Frontend
```bash
cd frontend
npm run dev
```

La aplicacion estara disponible en:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Estructura del Proyecto

```
mern-boilerplate/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── auth.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.js
│   │   │   ├── csrfProtection.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   └── auth.routes.js
│   │   ├── utils/
│   │   │   ├── asyncHandler.js
│   │   │   └── jwt.js
│   │   ├── validators/
│   │   │   └── auth.validator.js
│   │   └── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   ├── auth.api.js
    │   │   └── axios.js
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── PublicRoute.jsx
    │   │   └── common/
    │   │       ├── Button.jsx
    │   │       ├── Input.jsx
    │   │       └── Loader.jsx
    │   ├── contexts/
    │   │   └── ThemeContext.jsx
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   └── Settings.jsx
    │   ├── schemas/
    │   │   └── auth.schema.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## API Endpoints

### Autenticacion con Cookies httpOnly

**IMPORTANTE**: La autenticacion se realiza mediante **cookies httpOnly**. El token JWT se envia automaticamente en cada request a traves de cookies seguras. El navegador maneja esto automaticamente - no necesitas configurar headers manualmente.

### Autenticacion

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta**: Devuelve datos del usuario + establece cookie httpOnly con el token.

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@email.com",
  "password": "contraseña123"
}
```

**Respuesta**: Devuelve datos del usuario + establece cookie httpOnly con el token.

#### Logout
```http
POST /api/auth/logout
```

**Nota**: No requiere parametros. La cookie se envia automaticamente.

#### Obtener usuario actual
```http
GET /api/auth/me
```

**Nota**: No requiere parametros. La cookie se envia automaticamente.

### Configuracion de Cookies

Las cookies tienen las siguientes propiedades de seguridad:
- `httpOnly: true` - No accesible desde JavaScript (protege contra XSS)
- `secure: true` - Solo se envia en HTTPS (en produccion)
- `sameSite: 'none'|'strict'` - Proteccion CSRF
- `maxAge: 7 dias` - Expiracion configurable

## Seguridad

Este boilerplate implementa multiples capas de seguridad:

1. **Passwords**: Hasheadas con bcrypt (salt rounds: 12)
2. **JWT**: Tokens firmados con secret key
3. **Cookies**: httpOnly, secure (en produccion), sameSite
4. **CSRF**: Proteccion mediante verificacion de origin/referer (solo en produccion)
5. **Validacion**: Validacion en cliente y servidor
6. **CORS**: Configurado con origins permitidos
7. **Error Handling**: No expone informacion sensible en produccion

## Tecnologias Utilizadas

### Backend
- Express.js 5
- MongoDB con Mongoose 9
- JWT (jsonwebtoken)
- bcryptjs
- express-validator
- cookie-parser
- cors

### Frontend
- React 18
- React Router DOM 6
- Tailwind CSS 3
- React Hook Form
- Zod
- Axios
- React Hot Toast
- Lucide React (iconos)

## Notas de Desarrollo

### Agregar nuevos campos al usuario

1. Actualizar el modelo en `backend/src/models/User.js`
2. Actualizar el validador en `backend/src/validators/auth.validator.js`
3. Actualizar el schema en `frontend/src/schemas/auth.schema.js`
4. Actualizar el formulario en `frontend/src/pages/Register.jsx`

### Agregar nuevas rutas protegidas

1. Crear la pagina en `frontend/src/pages/`
2. Agregar la ruta en `frontend/src/App.jsx` usando `<ProtectedRoute>`
3. Agregar navegacion en el header (ver `Profile.jsx` y `Settings.jsx` como ejemplo)
4. Importar la nueva pagina en `App.jsx`

**Ejemplo**: Las paginas `Profile.jsx` y `Settings.jsx` demuestran como implementar navegacion entre rutas protegidas.

### Variables de entorno en produccion

Asegurate de configurar estas variables en tu servidor de produccion:
- `NODE_ENV=production`
- `JWT_SECRET` (usar un valor unico y seguro)
- `MONGODB_URI` (tu URI de MongoDB Atlas u otro)
- `CORS_ORIGIN` (URL de tu frontend en produccion)

