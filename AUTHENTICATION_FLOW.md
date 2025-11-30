# Flujo de Autenticación con Cookies

Este documento explica el sistema de autenticación basado en cookies implementado en el proyecto MERN boilerplate.

## Tabla de Contenidos

- [Resumen General](#resumen-general)
- [Componentes Principales](#componentes-principales)
- [Flujo de Registro](#flujo-de-registro)
- [Flujo de Login](#flujo-de-login)
- [Flujo de Validación](#flujo-de-validación)
- [Flujo de Logout](#flujo-de-logout)
- [Seguridad](#seguridad)
- [Configuración de Cookies](#configuración-de-cookies)

## Resumen General

El sistema de autenticación utiliza **JWT (JSON Web Tokens)** almacenados en **cookies HTTP-only** para mantener sesiones de usuario de forma segura. Esta arquitectura combina la seguridad de las cookies HTTP-only con la flexibilidad de JWT.

### Ventajas de este Enfoque

- **Protección contra XSS**: Las cookies `httpOnly` no son accesibles desde JavaScript
- **Protección contra CSRF**: Implementación de verificación de origin/referer
- **Stateless**: JWT permite validación sin consultar base de datos en cada request
- **Flexible**: Soporte tanto para cookies como para header Authorization

## Componentes Principales

### 1. JWT Utilities ([jwt.js](backend/src/utils/jwt.js))

#### `generateToken(userId)`
Genera un token JWT firmado con el ID del usuario.

```javascript
const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d'
});
```

- **Payload**: `{ id: userId }`
- **Expiración**: 7 días por defecto
- **Secret**: Variable de entorno `JWT_SECRET`

#### `sendTokenResponse(user, statusCode, res)`
Envía la respuesta con el token tanto en cookie como en el body JSON.

```javascript
res.status(statusCode)
  .cookie('token', token, cookieOptions)
  .json({
    status: 'success',
    token,
    data: { user }
  });
```

### 2. Middleware de Protección ([auth.js](backend/src/middlewares/auth.js:5))

El middleware `protect` valida el token en cada request protegido.

**Ubicaciones del token** (en orden de prioridad):
1. Cookie `token`
2. Header `Authorization: Bearer <token>`

**Validaciones realizadas**:
- ✓ Token existe
- ✓ Token es válido y no expiró
- ✓ Usuario existe en la base de datos
- ✓ Cuenta de usuario está activa

### 3. CSRF Protection ([csrfProtection.js](backend/src/middlewares/csrfProtection.js))

Protección adicional contra ataques CSRF mediante verificación de origen.

**Solo aplica en**:
- Entorno de producción
- Métodos HTTP mutantes (POST, PUT, PATCH, DELETE)

**Verifica**:
1. Header `Origin` coincide con `CORS_ORIGIN`
2. Header `Referer` coincide con `CORS_ORIGIN` (backup)
3. Al menos uno de los dos headers está presente

## Flujo de Registro

```
Cliente                    Backend                     Base de Datos
  |                          |                              |
  |--POST /api/auth/register-|                              |
  |  { username, email,      |                              |
  |    password }            |                              |
  |                          |                              |
  |                          |--Validar datos (validator)   |
  |                          |                              |
  |                          |--Verificar email/username--->|
  |                          |<--Usuario existe?------------|
  |                          |                              |
  |                          |--Crear usuario-------------->|
  |                          |  (password hasheado)         |
  |                          |<--Usuario creado-------------|
  |                          |                              |
  |                          |--Generar JWT token           |
  |                          |                              |
  |<--Set-Cookie: token=..---|                              |
  |   { status, token,       |                              |
  |     data: { user } }     |                              |
```

### Detalles del Registro

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validaciones** ([auth.validator.js](backend/src/validators/auth.validator.js)):
- Email y username únicos
- Password cumple requisitos de seguridad

**Response** (201 Created):
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2025-11-30T..."
    }
  }
}
```

**Cookie establecida**:
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;
  HttpOnly;
  Secure;
  SameSite=None;
  Max-Age=604800
```

## Flujo de Login

```
Cliente                    Backend                     Base de Datos
  |                          |                              |
  |--POST /api/auth/login----|                              |
  |  { email, password }     |                              |
  |                          |                              |
  |                          |--Validar datos               |
  |                          |                              |
  |                          |--Buscar usuario por email--->|
  |                          |<--Usuario (con password)-----|
  |                          |                              |
  |                          |--Verificar password          |
  |                          |  (bcrypt compare)            |
  |                          |                              |
  |                          |--Verificar isActive          |
  |                          |                              |
  |                          |--Generar JWT token           |
  |                          |                              |
  |<--Set-Cookie: token=..---|                              |
  |   { status, token,       |                              |
  |     data: { user } }     |                              |
```

### Detalles del Login

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validaciones**:
1. Usuario existe
2. Password es correcto (bcrypt comparison)
3. Cuenta está activa (`isActive: true`)

**Response** (200 OK):
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "...",
      "username": "john_doe",
      "email": "john@example.com",
      "createdAt": "2025-11-30T..."
    }
  }
}
```

## Flujo de Validación

Este flujo ocurre en **cada request a rutas protegidas**.

```
Cliente                    Middleware (protect)         Base de Datos
  |                          |                              |
  |--GET /api/auth/me--------|                              |
  |  Cookie: token=...       |                              |
  |                          |                              |
  |                          |--Extraer token de cookie     |
  |                          |  o header Authorization      |
  |                          |                              |
  |                          |--Verificar firma JWT         |
  |                          |  (jwt.verify)                |
  |                          |                              |
  |                          |--Decodificar payload         |
  |                          |  { id: "userId" }            |
  |                          |                              |
  |                          |--Buscar usuario por ID------>|
  |                          |<--Usuario (sin password)-----|
  |                          |                              |
  |                          |--Verificar isActive          |
  |                          |                              |
  |                          |--Adjuntar req.user           |
  |                          |                              |
  |                          |--next()                      |
  |                          |                              |
  |                       [Controller]                      |
  |                          |                              |
  |<--{ status, data }-------|                              |
```

### Middleware `protect`

**Ubicación**: Se usa en rutas protegidas
```javascript
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
```

**Proceso de validación** ([auth.js](backend/src/middlewares/auth.js:5-50)):

1. **Extracción del token**:
   ```javascript
   // Prioridad 1: Cookie
   if (req.cookies.token) {
     token = req.cookies.token;
   }
   // Prioridad 2: Header Authorization
   else if (req.headers.authorization?.startsWith('Bearer')) {
     token = req.headers.authorization.split(' ')[1];
   }
   ```

2. **Verificación JWT**:
   ```javascript
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   // decoded = { id: "userId", iat: ..., exp: ... }
   ```

3. **Validación de usuario**:
   ```javascript
   const user = await User.findById(decoded.id).select('-password');
   if (!user || !user.isActive) throw error;
   ```

4. **Adjuntar usuario al request**:
   ```javascript
   req.user = user;
   next();
   ```

### Errores Comunes

| Error | Status | Causa |
|-------|--------|-------|
| No token provided | 401 | Token ausente |
| Invalid token | 401 | Token manipulado o inválido |
| Token expired | 401 | Token expiró (> 7 días) |
| User no longer exists | 401 | Usuario fue eliminado |
| User account is deactivated | 401 | `isActive: false` |

## Flujo de Logout

```
Cliente                    Backend
  |                          |
  |--POST /api/auth/logout---|
  |  Cookie: token=...       |
  |  [protect middleware]    |
  |                          |
  |                          |--Verificar token (protect)
  |                          |
  |                          |--Reemplazar cookie
  |                          |  con valor 'none'
  |                          |  expiración en 10s
  |                          |
  |<--Set-Cookie: token=none-|
  |   expires=10s            |
  |   { status, message }    |
```

### Detalles del Logout

**Endpoint**: `POST /api/auth/logout`

**Mecanismo** ([auth.controller.js](backend/src/controllers/auth.controller.js:50-62)):
```javascript
res.cookie('token', 'none', {
  expires: new Date(Date.now() + 10 * 1000), // 10 segundos
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
});
```

**Nota**: No se mantiene blacklist de tokens. El token sigue siendo válido técnicamente hasta que expire, pero el cliente lo elimina.

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

## Seguridad

### 1. CORS (Cross-Origin Resource Sharing)

**Configuración** ([server.js](backend/src/server.js:16-21)):
```javascript
cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true  // Permite envío de cookies
})
```

- **credentials: true**: Crucial para que el navegador envíe cookies en requests cross-origin
- **origin**: Solo el origen configurado puede hacer requests

### 2. Protección CSRF

**Middleware activo solo en producción** ([server.js](backend/src/server.js:28-30)):

**Validaciones**:
- Métodos seguros (GET, HEAD, OPTIONS) pasan sin validación
- Métodos mutantes (POST, PUT, DELETE) requieren:
  - Header `Origin` o `Referer` presente
  - Coincidencia con `CORS_ORIGIN`

**Ejemplo de request bloqueado**:
```
POST /api/auth/login
Origin: https://malicious-site.com
→ 403 Forbidden: Invalid origin
```

### 3. Configuración de Cookies

**Atributos de seguridad** ([jwt.js](backend/src/utils/jwt.js:12-19)):

| Atributo | Desarrollo | Producción | Propósito |
|----------|-----------|-----------|-----------|
| `httpOnly` | ✓ | ✓ | Previene acceso via JavaScript (anti-XSS) |
| `secure` | ✗ | ✓ | Solo HTTPS |
| `sameSite` | strict | none | Control de envío cross-site |
| `expires` | 7 días | 7 días | Duración de sesión |

**SameSite Explicado**:
- **strict** (dev): Cookie solo se envía en requests same-site
- **none** (prod): Cookie se envía en requests cross-site (requiere `secure: true`)

### 4. Password Hashing

Los passwords se hashean con **bcrypt** antes de almacenarse (implementado en el modelo User):
```javascript
// Pre-save hook en User model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
```

### 5. Validación de Datos

Todas las rutas de autenticación usan validadores ([auth.validator.js](backend/src/validators/auth.validator.js)):
```javascript
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
```

## Configuración de Cookies

### Cookie de Autenticación

**Nombre**: `token`

**Configuración completa**:
```javascript
{
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
  httpOnly: true,                    // No accesible desde JS
  secure: NODE_ENV === 'production', // Solo HTTPS en prod
  sameSite: NODE_ENV === 'production' ? 'none' : 'strict'
}
```

### Variables de Entorno Requeridas

```env
# JWT
JWT_SECRET=tu_secreto_super_seguro_aqui
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7

# CORS
CORS_ORIGIN=http://localhost:3000

# Ambiente
NODE_ENV=development|production
```

## Diagramas de Flujo

### Flujo Completo: Desde Registro hasta Request Autenticado

```
┌─────────────┐
│   Cliente   │
└──────┬──────┘
       │
       │ 1. POST /api/auth/register
       │    { username, email, password }
       ▼
┌──────────────────┐
│  Validación de   │
│  datos (express  │
│  validator)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Verificar si    │◄──── MongoDB
│  usuario existe  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Hash password   │
│  (bcrypt)        │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Crear usuario   │────► MongoDB
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generar JWT     │
│  token           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Establecer      │
│  cookie HttpOnly │
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │Response│
    │  201   │
    └────────┘
         │
         │ Cookie: token=eyJ...
         │
         ▼
┌─────────────────┐
│   Cliente       │
│   (cookie       │
│   guardada)     │
└────────┬────────┘
         │
         │ 2. GET /api/auth/me
         │    Cookie: token=eyJ...
         │
         ▼
┌──────────────────┐
│  Middleware      │
│  protect         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Extraer token   │
│  de cookie       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Verificar JWT   │
│  (jwt.verify)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Buscar usuario  │◄──── MongoDB
│  por ID          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  req.user = user │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Controller      │
│  getMe()         │
└────────┬─────────┘
         │
         ▼
    ┌────────┐
    │Response│
    │  200   │
    │ {user} │
    └────────┘
```

## Ejemplo de Uso del Cliente

### Registro
```javascript
const response = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  credentials: 'include', // ¡IMPORTANTE! Envía/recibe cookies
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const data = await response.json();
// Cookie 'token' se guarda automáticamente
```

### Request Autenticado
```javascript
const response = await fetch('http://localhost:5000/api/auth/me', {
  method: 'GET',
  credentials: 'include' // Envía cookie automáticamente
});

const data = await response.json();
console.log(data.data.user); // Información del usuario
```

### Logout
```javascript
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST',
  credentials: 'include'
});

// Cookie 'token' se elimina automáticamente
```

## Notas Importantes

1. **credentials: 'include'**: Siempre requerido en el cliente para enviar/recibir cookies
2. **SameSite=None en producción**: Permite que el frontend y backend estén en dominios diferentes
3. **Secure en producción**: Las cookies solo se envían por HTTPS
4. **Token en respuesta**: Aunque el token está en la cookie, también se devuelve en el body para flexibilidad (ej: mobile apps)

## Troubleshooting

### Las cookies no se están guardando

**Checklist**:
- [ ] `credentials: 'include'` en fetch del cliente
- [ ] CORS configurado con `credentials: true`
- [ ] En producción: `secure: true` y usar HTTPS
- [ ] En producción: `sameSite: 'none'`
- [ ] `CORS_ORIGIN` coincide con origin del cliente

### 403 Forbidden en producción

**Causa probable**: CSRF protection bloqueando el request

**Solución**:
- Verificar que el header `Origin` o `Referer` está presente
- Confirmar que coincide con `CORS_ORIGIN`

### Token expirado constantemente

**Verificar**:
- `JWT_EXPIRES_IN` en .env
- `JWT_COOKIE_EXPIRES_IN` en .env
- Sincronización de tiempo del servidor

## Conclusión

Este sistema de autenticación proporciona un equilibrio entre seguridad y usabilidad:

✓ **Seguro**: Cookies HttpOnly, CSRF protection, passwords hasheados
✓ **Flexible**: Soporta cookies y Authorization header
✓ **Stateless**: JWT permite escalabilidad horizontal
✓ **Moderno**: Configuración lista para producción cross-origin
