# MERN Authentication Boilerplate - Backend

Backend profesional para autenticación con las mejores prácticas de seguridad, arquitectura escalable y manejo robusto de errores.

## 🔐 Características

- ✅ **Autenticación JWT** con cookies httpOnly y secure
- ✅ **Protección CSRF** mediante verificación de origin/referer
- ✅ **Encriptación de contraseñas** con bcrypt (salt 12)
- ✅ **Validación de datos** con express-validator
- ✅ **Manejo de errores centralizado** con AppError personalizado
- ✅ **AsyncHandler** para funciones asíncronas
- ✅ **Graceful shutdown** (SIGTERM y unhandledRejection)
- ✅ **Middleware de autenticación** con verificación de tokens
- ✅ **CORS configurado** con credentials
- ✅ **Health check endpoint**
- ✅ **Separación de responsabilidades** (MVC pattern)

## 🛠️ Tecnologías

- Node.js con ES6 Modules
- Express.js 5
- MongoDB con Mongoose 9
- JWT (jsonwebtoken)
- Bcrypt para hash de contraseñas
- Express Validator para validación
- Cookie Parser

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── database.js          # Configuración de MongoDB
├── controllers/
│   └── auth.controller.js   # Lógica de autenticación
├── middlewares/
│   ├── auth.js              # Middleware de autenticación
│   ├── csrfProtection.js    # Protección CSRF
│   └── errorHandler.js      # Manejo centralizado de errores
├── models/
│   └── User.js              # Modelo de usuario
├── routes/
│   └── auth.routes.js       # Rutas de autenticación
├── utils/
│   ├── asyncHandler.js      # Wrapper para async/await
│   └── jwt.js               # Utilidades JWT
├── validators/
│   └── auth.validator.js    # Validación de auth
└── server.js                # Punto de entrada
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

3. Editar `.env` con tus valores:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mern-auth
JWT_SECRET=tu-clave-secreta-muy-segura
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CORS_ORIGIN=http://localhost:3000
```

4. Iniciar servidor:
```bash
npm start         # Producción
npm run dev       # Desarrollo con watch mode
```

## 📡 API Endpoints

### Autenticación con Cookies

**IMPORTANTE**: Esta API utiliza **cookies httpOnly** para la autenticación. El token JWT se envía automáticamente en una cookie segura con cada request. También se incluye el token en el body de la respuesta para compatibilidad con clientes que prefieran usar el header `Authorization: Bearer`.

### Autenticación

#### Registro
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario",
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (201):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "...",
      "username": "usuario",
      "email": "usuario@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Headers de respuesta:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=None; Max-Age=604800
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "password123"
}
```

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "data": {
    "user": {
      "_id": "...",
      "username": "usuario",
      "email": "usuario@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Headers de respuesta:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIs...; HttpOnly; Secure; SameSite=None; Max-Age=604800
```

#### Logout
```http
POST /api/auth/logout
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

**Nota**: No requiere header Authorization. La cookie se envía automáticamente.

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

**Headers de respuesta:**
```
Set-Cookie: token=none; HttpOnly; Expires=<fecha-pasada>
```

#### Obtener usuario actual
```http
GET /api/auth/me
Cookie: token=eyJhbGciOiJIUzI1NiIs...
```

**Nota**: No requiere header Authorization. La cookie se envía automáticamente.

**Respuesta exitosa (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "...",
      "username": "usuario",
      "email": "usuario@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### Autenticación Alternativa con Bearer Token

Si prefieres no usar cookies, puedes usar el header `Authorization`:

```http
GET /api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

El middleware de autenticación acepta ambos métodos (cookie o Bearer token).

### Health Check

```http
GET /api/health
```

**Respuesta (200):**
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📊 Modelo de Datos

### User
- `username`: string (único, 3-30 caracteres, solo letras, números y guiones bajos)
- `email`: string (único, formato de email válido)
- `password`: string (hasheado con bcrypt, mínimo 6 caracteres)
- `isActive`: boolean (default: true)
- `createdAt`: timestamp (auto-generado)
- `updatedAt`: timestamp (auto-generado)

## 🔒 Seguridad

Este boilerplate implementa múltiples capas de seguridad:

1. **Passwords**: Hasheadas con bcrypt (salt rounds: 12)
2. **JWT**: Tokens firmados con secret key configurable
3. **Cookies httpOnly**: El token se envía en cookies httpOnly (no accesibles desde JavaScript)
   - `httpOnly: true` - Protección contra XSS
   - `secure: true` - Solo HTTPS en producción
   - `sameSite: 'none'|'strict'` - Protección CSRF
4. **CSRF**: Protección mediante verificación de origin/referer (solo en producción)
5. **Validación**: Validación exhaustiva en todas las entradas
6. **Error Handling**: No expone información sensible en producción
7. **CORS**: Configurado con origins permitidos específicos y `credentials: true`

### Configuración CORS para Cookies

Para que las cookies funcionen correctamente, la configuración de CORS debe incluir:

```javascript
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // ⭐ CRUCIAL para cookies
  })
);
```

**Importante**:
- `credentials: true` permite que el navegador envíe y reciba cookies
- El `origin` debe ser específico (no puede ser `*` cuando se usan cookies)
- El frontend debe usar `withCredentials: true` en Axios

## ✨ Buenas Prácticas Implementadas

- Arquitectura MVC escalable
- Separación de responsabilidades (controllers, models, routes, middlewares, utils, validators)
- Código DRY (Don't Repeat Yourself)
- Manejo centralizado de errores con clase AppError
- Validación robusta de datos en múltiples capas
- Middleware reutilizable y modular
- Índices optimizados en MongoDB para performance
- Async/await con manejo de errores consistente
- Variables de entorno para toda la configuración
- Logs informativos para debugging
- Graceful shutdown para cierre ordenado del servidor

## 🔍 Características Detalladas

### 1. Autenticación JWT con Cookies httpOnly y Secure

**¿Qué es?**
JSON Web Tokens (JWT) es un estándar para transmitir información de forma segura entre partes. Este boilerplate implementa JWT usando **cookies httpOnly** en lugar de localStorage.

**¿Por qué cookies httpOnly?**
- ✅ **Protección contra XSS**: Las cookies httpOnly NO son accesibles desde JavaScript, por lo que si un atacante inyecta código malicioso, no puede robar el token
- ✅ **Automático**: El navegador envía la cookie automáticamente en cada request
- ✅ **Secure**: En producción, solo se envían sobre HTTPS
- ✅ **SameSite**: Protege contra ataques CSRF

**Implementación:**

```javascript
// src/utils/jwt.js
export const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // ⭐ No accesible desde JavaScript
    secure: process.env.NODE_ENV === 'production', // ⭐ Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  };

  res.cookie('token', token, cookieOptions);

  // También enviamos el token en el body para flexibilidad
  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};
```

**Variables de entorno:**
- `JWT_SECRET`: Clave secreta para firmar tokens (debe ser única y segura)
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (ej: '7d', '24h')
- `JWT_COOKIE_EXPIRES_IN`: Días hasta que expire la cookie

---

### 2. Protección CSRF mediante Verificación de Origin/Referer

**¿Qué es CSRF?**
Cross-Site Request Forgery es un ataque donde un sitio malicioso engaña al navegador del usuario para que haga requests no autorizados a tu API.

**¿Cómo lo prevenimos?**
En lugar de usar tokens CSRF (que agregan complejidad), validamos que el request viene del origin correcto.

**Implementación:**

```javascript
// src/middlewares/csrfProtection.js
export const csrfProtection = (req, res, next) => {
  // Solo validar en producción y solo para métodos que modifican datos
  if (
    process.env.NODE_ENV !== 'production' ||
    ['GET', 'HEAD', 'OPTIONS'].includes(req.method)
  ) {
    return next();
  }

  const origin = req.get('origin');
  const referer = req.get('referer');
  const allowedOrigin = process.env.CORS_ORIGIN;

  // Validar que el request viene de un origin permitido
  if (origin && origin !== allowedOrigin) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF validation failed'
    });
  }

  if (referer && !referer.startsWith(allowedOrigin)) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF validation failed'
    });
  }

  next();
};
```

**Beneficios:**
- ✅ Simple de implementar
- ✅ No requiere tokens adicionales
- ✅ Compatible con cookies httpOnly
- ✅ Solo activo en producción (no interfiere con desarrollo)

---

### 3. Encriptación de Contraseñas con Bcrypt (Salt 12)

**¿Qué es bcrypt?**
Bcrypt es un algoritmo de hashing diseñado específicamente para contraseñas. Es intencionalmente lento para dificultar ataques de fuerza bruta.

**¿Qué son los salt rounds?**
El número de "salt rounds" (12 en nuestro caso) determina qué tan computacionalmente costoso es el hash. Cada incremento duplica el tiempo de procesamiento.

**Implementación:**

```javascript
// src/models/User.js
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false, // ⭐ No incluir password en queries por defecto
  },
  // ... otros campos
});

// Middleware pre-save: hashear password antes de guardar
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  // 12 rounds = muy seguro pero no demasiado lento
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
```

**¿Por qué 12 rounds?**
- 10 rounds: Rápido (~65ms) - mínimo aceptable
- **12 rounds: Balanceado (~250ms) - recomendado** ⭐
- 14 rounds: Muy seguro (~1000ms) - puede afectar UX

**Seguridad:**
- ✅ Cada password tiene un salt único (generado automáticamente)
- ✅ Imposible revertir el hash (one-way function)
- ✅ Resistente a ataques de rainbow tables
- ✅ El campo password tiene `select: false` para no exponerlo accidentalmente

---

### 4. Validación de Datos con Express-Validator

**¿Por qué validar?**
La validación previene datos maliciosos o incorrectos, protege contra inyecciones y asegura la integridad de los datos.

**Implementación:**

```javascript
// src/validators/auth.validator.js
import { body, validationResult } from 'express-validator';

export const registerValidator = [
  // Validación de username
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  // Validación de email
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(), // Sanitización automática

  // Validación de password
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Middleware para verificar resultados de validación
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array(),
    });
  }
  next();
};
```

**Uso en rutas:**

```javascript
// src/routes/auth.routes.js
router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
```

**Capas de validación:**
1. ✅ **Frontend**: Validación con Zod (feedback inmediato al usuario)
2. ✅ **Backend**: Express-validator (seguridad, nunca confiar en el cliente)
3. ✅ **Base de datos**: Schema constraints de Mongoose (última línea de defensa)

---

### 5. Manejo de Errores Centralizado con AppError

**¿Por qué centralizar errores?**
- Consistencia en formato de respuestas de error
- No exponer información sensible en producción
- Facilita debugging con logs apropiados
- Código más limpio (DRY)

**Implementación:**

```javascript
// src/middlewares/errorHandler.js

// Clase personalizada para errores operacionales
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Errores que esperamos (vs bugs)

    Error.captureStackTrace(this, this.constructor);
  }
}

// Middleware global de manejo de errores
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    // En desarrollo: mostrar toda la info para debugging
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // En producción: solo mostrar errores operacionales
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      // Error de programación: no exponer detalles
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!',
      });
    }
  }
};
```

**Uso:**

```javascript
// En cualquier controller
import { AppError } from '../middlewares/errorHandler.js';

const user = await User.findById(id);
if (!user) {
  throw new AppError('User not found', 404);
}
```

**Tipos de errores manejados:**
- ✅ Errores operacionales (404, validación, duplicados, etc.)
- ✅ Errores de Mongoose (CastError, ValidationError, DuplicateKey)
- ✅ Errores de JWT (JsonWebTokenError, TokenExpiredError)
- ✅ Errores de programación (bugs inesperados)

---

### 6. AsyncHandler para Funciones Asíncronas

**¿El problema?**
En Express, los errores en funciones async no se capturan automáticamente. Sin async handler, necesitarías try-catch en cada controller.

**Sin AsyncHandler (repetitivo):**

```javascript
export const register = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.json({ user });
  } catch (error) {
    next(error); // Pasar al error handler
  }
};
```

**Con AsyncHandler (limpio):**

```javascript
// src/utils/asyncHandler.js
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Uso en controllers
export const register = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);
  res.json({ user });
  // ✅ No necesita try-catch, errores se capturan automáticamente
});
```

**Beneficios:**
- ✅ Código más limpio y legible
- ✅ DRY - no repetir try-catch
- ✅ Garantiza que todos los errores lleguen al error handler centralizado
- ✅ Funciona con async/await

---

### 7. Graceful Shutdown (SIGTERM y unhandledRejection)

**¿Qué es graceful shutdown?**
Cerrar el servidor de forma ordenada cuando se recibe una señal de terminación o ocurre un error fatal, permitiendo que las conexiones activas se completen.

**Implementación:**

```javascript
// src/server.js
import { connectDB } from './config/database.js';

const PORT = process.env.PORT || 5000;

// Conectar a la base de datos
connectDB();

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// 1. Manejar rechazos de promesas no capturados
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);

  // Cerrar servidor y salir del proceso
  server.close(() => {
    process.exit(1);
  });
});

// 2. Manejar señal SIGTERM (ej: de Heroku, Docker, PM2)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');

  server.close(() => {
    console.log('💥 Process terminated!');
  });
});
```

**¿Cuándo ocurre?**
- **unhandledRejection**: Promise rechazada sin `.catch()`
- **SIGTERM**: Señal de terminación del sistema operativo o plataforma de hosting
- **SIGINT**: Ctrl+C en la terminal (opcional)

**Beneficios:**
- ✅ No deja conexiones activas huérfanas
- ✅ Permite que MongoDB cierre conexiones correctamente
- ✅ Previene corrupción de datos
- ✅ Logs apropiados para debugging
- ✅ Compatible con Docker, Kubernetes, PM2, Heroku

---

### 8. Middleware de Autenticación con Verificación de Tokens

**¿Qué hace?**
Protege rutas verificando que el usuario está autenticado y tiene un token válido.

**Implementación:**

```javascript
// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from './errorHandler.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Obtener token (de cookie o header Authorization)
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Verificar que existe el token
  if (!token) {
    throw new AppError('You are not logged in', 401);
  }

  // 3. Verificar y decodificar el token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // 4. Verificar que el usuario aún existe
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  // 5. Verificar que el usuario está activo
  if (!user.isActive) {
    throw new AppError('User account is deactivated', 401);
  }

  // 6. Adjuntar usuario a request para uso posterior
  req.user = user;
  next();
});
```

**Uso en rutas:**

```javascript
// Ruta pública (no requiere autenticación)
router.post('/login', loginValidator, validate, login);

// Ruta protegida (requiere autenticación)
router.get('/me', protect, getMe);
```

**Capas de seguridad:**
1. ✅ Verifica presencia del token (cookie o Bearer)
2. ✅ Valida firma del token (no ha sido modificado)
3. ✅ Verifica expiración del token
4. ✅ Confirma que el usuario existe en BD
5. ✅ Verifica que la cuenta está activa

---

### 9. CORS Configurado con Credentials

**¿Qué es CORS?**
Cross-Origin Resource Sharing es un mecanismo de seguridad del navegador que controla qué dominios pueden hacer requests a tu API.

**¿Por qué es importante `credentials: true`?**
Para que las cookies funcionen entre diferentes orígenes (ej: frontend en puerto 3000, backend en 5000), CORS debe permitir el envío de credenciales.

**Implementación:**

```javascript
// src/server.js
import cors from 'cors';

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // ⭐ CRUCIAL: permite cookies cross-origin
  })
);
```

**Configuración según entorno:**

```javascript
// Desarrollo
CORS_ORIGIN=http://localhost:3000

// Producción
CORS_ORIGIN=https://miapp.com
```

**Restricciones importantes:**
- ❌ **NO** puedes usar `origin: '*'` con `credentials: true`
- ✅ **Debes** especificar el origin exacto
- ✅ El frontend debe usar `withCredentials: true` en Axios
- ✅ En producción, ambos deben usar HTTPS

**Flow completo:**

```javascript
// Backend (Express)
app.use(cors({
  origin: 'https://miapp.com',
  credentials: true,
}));

// Frontend (Axios)
const api = axios.create({
  baseURL: 'https://api.miapp.com',
  withCredentials: true, // ⭐ Envía cookies
});
```

**Preflight requests:**
Para requests con cookies, el navegador hace un preflight request (OPTIONS) automáticamente. Express CORS lo maneja por ti.

---

## 🎯 Resumen de Beneficios

| Característica | Beneficio Principal | Protege Contra |
|----------------|---------------------|----------------|
| JWT + httpOnly Cookies | Tokens seguros no accesibles desde JS | XSS, token theft |
| CSRF Protection | Solo requests de origins válidos | CSRF attacks |
| Bcrypt (12 rounds) | Passwords imposibles de revertir | Rainbow tables, brute force |
| Express Validator | Datos validados antes de procesarse | Inyecciones, datos corruptos |
| AppError | Errores consistentes sin exponer info | Information leakage |
| AsyncHandler | Manejo garantizado de errores async | Crashes por errores no capturados |
| Graceful Shutdown | Cierre ordenado del servidor | Corrupción de datos, conexiones huérfanas |
| Auth Middleware | Solo usuarios autenticados acceden | Acceso no autorizado |
| CORS + Credentials | Cookies funcionan cross-origin | CORS errors, ataques de otros dominios |

---

## 📚 Referencias y Recursos

- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Principales riesgos de seguridad web
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725) - RFC 8725
- [bcrypt Explained](https://github.com/kelektiv/node.bcrypt.js) - Documentación oficial
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html) - Guía oficial
- [MDN: HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) - Referencia completa
