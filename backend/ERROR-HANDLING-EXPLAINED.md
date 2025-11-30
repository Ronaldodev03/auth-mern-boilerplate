# Manejo de Errores en Detalle - AppError Class

Este documento explica en profundidad cómo funciona el sistema de manejo de errores del boilerplate, específicamente la clase `AppError` y el middleware `errorHandler`.

## Tabla de Contenidos

1. [Conceptos Básicos de JavaScript](#conceptos-basicos-de-javascript)
2. [La Clase AppError](#la-clase-apperror)
3. [El Middleware errorHandler](#el-middleware-errorhandler)
4. [Funciones Helper](#funciones-helper)
5. [Flujo Completo de Manejo de Errores](#flujo-completo-de-manejo-de-errores)
6. [Ejemplos Prácticos](#ejemplos-practicos)

---

## Conceptos Básicos de JavaScript

### ¿Qué es una Clase?

Una **clase** es un "molde" o "plantilla" para crear objetos. En JavaScript, las clases son una forma de implementar programación orientada a objetos (OOP).

```javascript
// Definición de una clase simple
class Persona {
  constructor(nombre, edad) {
    this.nombre = nombre;
    this.edad = edad;
  }

  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
}

// Crear una instancia (objeto) de la clase
const juan = new Persona('Juan', 25);
console.log(juan.saludar()); // "Hola, soy Juan"
```

### ¿Qué es Herencia (extends)?

La herencia permite crear una clase basada en otra clase existente. La clase hija **hereda** todas las propiedades y métodos de la clase padre.

```javascript
// Clase padre
class Animal {
  constructor(nombre) {
    this.nombre = nombre;
  }

  hacerSonido() {
    return "Algún sonido";
  }
}

// Clase hija que hereda de Animal
class Perro extends Animal {
  constructor(nombre, raza) {
    super(nombre); // Llama al constructor del padre
    this.raza = raza;
  }

  hacerSonido() {
    return "Guau guau"; // Sobrescribe el método del padre
  }
}

const miPerro = new Perro('Firulais', 'Labrador');
console.log(miPerro.nombre); // "Firulais" (heredado de Animal)
console.log(miPerro.hacerSonido()); // "Guau guau"
```

### ¿Qué es la Clase Error?

JavaScript tiene una clase **Error** nativa que se usa para representar errores. Cuando creas errores personalizados, debes heredar de esta clase.

```javascript
// Error nativo de JavaScript
const error = new Error('Algo salió mal');
console.log(error.message); // "Algo salió mal"
console.log(error.stack);   // Stack trace del error
```

---

## La Clase AppError

### Código Completo

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
```

### Análisis Línea por Línea

#### 1. `export class AppError extends Error`

```javascript
export class AppError extends Error
```

**Desglose:**
- `export`: Permite importar esta clase en otros archivos
- `class AppError`: Define una nueva clase llamada AppError
- `extends Error`: AppError **hereda** de la clase Error nativa de JavaScript

**¿Por qué extends Error?**
- Heredamos todas las propiedades y métodos de Error (como `message`, `stack`, `name`)
- JavaScript reconoce AppError como un tipo de Error
- Podemos usar `instanceof Error` para verificar si es un error
- Obtenemos el stack trace automáticamente

**Analogía:**
Si Error es un "molde para errores genéricos", AppError es un "molde especializado para errores de nuestra aplicación".

---

#### 2. `constructor(message, statusCode)`

```javascript
constructor(message, statusCode) {
  // ...
}
```

**¿Qué es el constructor?**
El constructor es un método especial que se ejecuta **automáticamente** cuando creas una nueva instancia de la clase con `new`.

**Parámetros:**
- `message`: El mensaje descriptivo del error (ej: "User not found")
- `statusCode`: El código HTTP de estado (ej: 404, 500, 401)

**¿Cuándo se ejecuta?**
Cuando haces:
```javascript
const error = new AppError('User not found', 404);
```

El constructor recibe:
- `message` = "User not found"
- `statusCode` = 404

---

#### 3. `super(message)`

```javascript
super(message);
```

**¿Qué hace super()?**
`super()` llama al **constructor de la clase padre** (en este caso, la clase Error).

**¿Por qué es necesario?**
Cuando heredas de otra clase con `extends`, **DEBES** llamar a `super()` antes de usar `this`. Es una regla de JavaScript.

**¿Por qué ANTES de `this`?**

La razón fundamental es que el objeto `this` **NO EXISTE** hasta que se ejecute `super()`.

Es la clase padre la que **crea** el objeto `this`. Hasta que no llames a `super()`, no hay ningún objeto `this` disponible para usar.

**Visualización del proceso:**

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    // En este punto: this = ❌ NO EXISTE

    super(message); // ← Aquí Error CREA el objeto this

    // Ahora: this = ✅ EXISTE y podemos usarlo
    this.statusCode = statusCode;
  }
}
```

**¿Qué pasa internamente?**

```javascript
// Cuando haces: new AppError('User not found', 404)

// JavaScript internamente hace:
// 1. NO crea this todavía
// 2. Entra al constructor de AppError
// 3. Espera a que llames a super()
// 4. super() ejecuta el constructor de Error
// 5. El constructor de Error CREA el objeto this
// 6. El constructor de Error inicializa this.message, this.stack, etc.
// 7. super() retorna ese this a AppError
// 8. Ahora AppError puede usar this
```

**Ejemplo del error si intentas usar this antes:**

```javascript
export class AppError extends Error {
  constructor(message, statusCode) {
    // ❌ ESTO FALLA
    this.statusCode = statusCode; // ReferenceError: Must call super() before accessing 'this'
    super(message);
  }
}
```

**¿Por qué JavaScript funciona así?**

1. **Garantiza inicialización correcta**: La clase padre necesita inicializar sus propias propiedades primero
2. **Cadena de herencia clara**: JavaScript construye el objeto de "abajo hacia arriba" (Error primero, luego AppError)

**Analogía simple:**

`super()` es como llamar al constructor de papá antes de que el hijo pueda construir su cuarto:
1. **Papá construye la casa** (super) → Crea `this`
2. **Hijo decora su cuarto** (this.miPropiedad) → Usa `this`

No puedes decorar el cuarto si la casa no existe.

**La regla de oro:**

> **Si tu clase usa `extends` Y vas a usar `this`, SIEMPRE debes llamar `super()` primero, con o sin parámetros.**

Incluso si no le pasas parámetros a `super()`, **DEBES** llamarlo antes de usar `this`:

```javascript
class Animal {
  constructor() {
    this.vivo = true;
  }
}

class Perro extends Animal {
  constructor(nombre) {
    super(); // ← DEBES llamarlo, aunque no le pases nada
    this.nombre = nombre; // ← Ahora puedes usar this
  }
}
```

**¿Por qué le pasamos `message` al super()?**

La clase `Error` nativa de JavaScript tiene un constructor que **acepta un parámetro**: el mensaje del error.

```javascript
// Así funciona la clase Error nativa (simplificado)
class Error {
  constructor(message) {
    this.message = message; // Guarda el mensaje aquí
    // ... otra lógica interna
  }
}
```

Cuando hacemos `super(message)`, estamos:
1. **Llamando al constructor de Error**
2. **Pasándole el mensaje** que recibimos en nuestro constructor
3. **Error guarda ese mensaje** en `this.message` internamente

**Ejemplo práctico:**
```javascript
const error = new AppError('User not found', 404);

// ¿De dónde viene error.message?
console.log(error.message); // "User not found"

// Viene de super(message):
// 1. AppError recibe message = "User not found"
// 2. Llama a super("User not found")
// 3. Error ejecuta internamente: this.message = "User not found"
// 4. Ahora podemos acceder a error.message
```

**¿Qué pasaría si NO pasamos el message?**

```javascript
// ❌ Sin pasar message
export class AppError extends Error {
  constructor(message, statusCode) {
    super(); // ← No pasamos nada
    this.statusCode = statusCode;
  }
}

const error = new AppError('User not found', 404);
console.log(error.message); // undefined o ""
// ¡Perdemos el mensaje del error!
```

**Comparación visual:**

```javascript
// ✅ CON message
super(message);
↓
Error constructor recibe: "User not found"
↓
Error hace: this.message = "User not found"
↓
Resultado: error.message = "User not found" ✓


// ❌ SIN message
super();
↓
Error constructor recibe: undefined
↓
Error hace: this.message = undefined
↓
Resultado: error.message = undefined ✗
```

**¿Qué pasa internamente?**
```javascript
// Cuando hacemos:
const error = new AppError('User not found', 404);

// JavaScript hace (simplificado):
// 1. Llama a super('User not found')
// 2. Esto ejecuta: Error.constructor('User not found')
// 3. La clase Error establece: this.message = 'User not found'
// 4. La clase Error genera el stack trace
// 5. Luego continúa con el resto del constructor de AppError
```

**Sin super(), esto fallaría:**
```javascript
constructor(message, statusCode) {
  // ❌ ERROR: Must call super() before using 'this'
  this.statusCode = statusCode;
}
```

**Resumen:**

| Con `super(message)` | Sin `super()` o `super()` vacío |
|---------------------|----------------------------------|
| ✅ `error.message` = "User not found" | ❌ `error.message` = undefined |
| ✅ Stack trace muestra el mensaje | ❌ Stack trace sin mensaje claro |
| ✅ Logs útiles | ❌ Logs confusos |
| ✅ Debugging fácil | ❌ Debugging difícil |

**En conclusión**: Le pasamos `message` a `super()` porque la clase `Error` lo necesita para crear la propiedad `this.message` que todos los errores deben tener. Sin ese mensaje, perdemos información valiosa sobre qué salió mal.

---

#### 4. `this.statusCode = statusCode`

```javascript
this.statusCode = statusCode;
```

**¿Qué hace?**
Agrega una propiedad personalizada `statusCode` al objeto error.

**Ejemplo:**
```javascript
const error = new AppError('User not found', 404);
console.log(error.statusCode); // 404
```

**¿Por qué es útil?**
Nos permite saber qué código HTTP responder:
```javascript
res.status(error.statusCode).json({ message: error.message });
```

---

#### 5. `this.status = ...`

```javascript
this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
```

**Desglose:**
1. `${statusCode}`: Convierte el número a string (ej: 404 → "404")
2. `.startsWith('4')`: Verifica si empieza con "4" (códigos 4xx)
3. `? 'fail' : 'error'`: Operador ternario (if-else corto)

**Lógica:**
- Si statusCode empieza con 4 (400, 401, 404, etc.) → `status = 'fail'`
- Si NO (500, 503, etc.) → `status = 'error'`

**¿Por qué esta distinción?**

| Categoría | Código | Status | Significado | Ejemplo |
|-----------|--------|--------|-------------|---------|
| 4xx | 400-499 | `fail` | Error del cliente (usuario) | Validación fallida, no autorizado |
| 5xx | 500-599 | `error` | Error del servidor (nuestra culpa) | Bug, BD caída, servicio no disponible |

**Ejemplo:**
```javascript
const error1 = new AppError('Invalid email', 400);
console.log(error1.status); // "fail"

const error2 = new AppError('Database connection failed', 500);
console.log(error2.status); // "error"
```

**Uso en respuestas:**
```json
// Error 4xx (fail)
{
  "status": "fail",
  "message": "Invalid email format"
}

// Error 5xx (error)
{
  "status": "error",
  "message": "Something went wrong"
}
```

---

#### 6. `this.isOperational = true`

```javascript
this.isOperational = true;
```

**¿Qué es un error operacional?**
Un error **operacional** es un error que **esperamos** que pueda ocurrir durante la operación normal de la aplicación.

**Ejemplos de errores operacionales:**
- ✅ Usuario no encontrado (404)
- ✅ Email ya registrado (400)
- ✅ Token inválido (401)
- ✅ Validación fallida (400)
- ✅ Base de datos no disponible (503)

**Ejemplos de errores NO operacionales (bugs):**
- ❌ Variable undefined (TypeError)
- ❌ Función que no existe (ReferenceError)
- ❌ División por cero
- ❌ Errores de sintaxis

**¿Por qué marcar `isOperational = true`?**

En producción, queremos **comportamientos diferentes**:

```javascript
if (err.isOperational) {
  // Error esperado: mostrar mensaje al usuario
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message // "User not found"
  });
} else {
  // Bug/Error inesperado: NO exponer detalles
  console.error('BUG!', err);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!' // Mensaje genérico
  });
}
```

**Seguridad:**
Esto previene que información sensible (rutas de archivos, estructura de BD, etc.) se exponga en producción cuando hay un bug.

---

#### 7. `Error.captureStackTrace(this, this.constructor)`

```javascript
Error.captureStackTrace(this, this.constructor);
```

**¿Por qué esta línea es necesaria?**

Esta línea **no es obligatoria** para que el error funcione, pero es **esencial para tener stack traces limpios y útiles**.

---

### El Problema: Stack Traces Confusos

**Sin** `Error.captureStackTrace`, el stack trace incluye información **no útil**.

### Ejemplo SIN `Error.captureStackTrace`

```javascript
// ❌ Sin captureStackTrace
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    // ❌ Falta Error.captureStackTrace
  }
}

// En un controller
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404); // ← Línea 45
  }
};
```

**Stack trace resultante:**
```
Error: User not found
    at new AppError (errorHandler.js:3)        ← NO ÚTIL (constructor)
    at getUser (userController.js:45)         ← ÚTIL (donde ocurrió)
    at asyncHandler (asyncHandler.js:12)
    at Layer.handle (express/router.js:95)
```

**Problema:** La primera línea del stack trace (`at new AppError`) **no nos ayuda**. Ya sabemos que ahí se crea el error. Queremos ver **dónde se llamó**.

---

### Ejemplo CON `Error.captureStackTrace`

```javascript
// ✅ Con captureStackTrace
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor); // ✅ Aquí
  }
}

// Mismo controller
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404); // ← Línea 45
  }
};
```

**Stack trace resultante:**
```
Error: User not found
    at getUser (userController.js:45)         ← ÚTIL (empieza aquí)
    at asyncHandler (asyncHandler.js:12)
    at Layer.handle (express/router.js:95)
```

**Beneficio:** Ya NO aparece `at new AppError`. El stack trace empieza directamente en **donde realmente ocurrió el problema** (línea 45 del controller).

---

### ¿Qué hace `Error.captureStackTrace(this, this.constructor)`?

**Parámetros:**

```javascript
Error.captureStackTrace(targetObject, constructorOpt)
```

1. **`this`** (primer parámetro): El objeto donde guardar el stack trace
2. **`this.constructor`** (segundo parámetro): Desde dónde **NO** incluir en el stack trace

**Visualización:**

```javascript
// Stack de llamadas cuando ocurre el error:
Express Router
  → asyncHandler
    → getUser (userController.js:45)
      → new AppError (errorHandler.js:3)  ← Constructor
        → super(message)
          → Error constructor

// SIN this.constructor:
// Captura DESDE Error constructor HASTA Express Router
// Resultado: Muestra TODO incluyendo "at new AppError"

// CON this.constructor:
// Le dice: "Omite todo desde this.constructor hacia abajo"
// Resultado: Muestra desde getUser hacia arriba (omite constructor)
```

---

### Comparación Práctica

**Caso Real: Error en Login**

```javascript
// auth.controller.js
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    throw new AppError('Incorrect email or password', 401); // ← Línea 28
  }

  // ... resto del código
});
```

**Stack trace SIN `Error.captureStackTrace`:**
```
Error: Incorrect email or password
    at new AppError (errorHandler.js:3)        ← Ruido
    at login (auth.controller.js:28)           ← Lo que importa
    at asyncHandler (asyncHandler.js:2)
```

**Stack trace CON `Error.captureStackTrace`:**
```
Error: Incorrect email or password
    at login (auth.controller.js:28)           ← Directo al punto
    at asyncHandler (asyncHandler.js:2)
```

---

### ¿Es Obligatorio?

**No es obligatorio**, pero es **altamente recomendado**.

**✅ Con `Error.captureStackTrace`:**
- Stack traces limpios y útiles
- Debugging más rápido
- Logs profesionales
- Fácil encontrar el origen del error

**❌ Sin `Error.captureStackTrace`:**
- Stack traces con información innecesaria
- Debugging más lento
- Primera línea siempre es el constructor (no útil)

---

### Analogía

Imagina que estás investigando un crimen:

**Sin `Error.captureStackTrace`:**
```
Testimonio del detective:
1. "Fui a la estación de policía" (constructor - no relevante)
2. "Me dijeron que hubo un robo en la calle 5" (el error real - relevante)
3. "El sospechoso huyó hacia el norte" (contexto - relevante)
```

**Con `Error.captureStackTrace`:**
```
Testimonio del detective:
1. "Hubo un robo en la calle 5" (el error real - directo al punto)
2. "El sospechoso huyó hacia el norte" (contexto - relevante)
```

Le decimos al sistema: "No me cuentes que fuiste a la estación (constructor), solo cuéntame sobre el crimen (el error real)".

---

### Tabla Comparativa

| Aspecto | Sin `Error.captureStackTrace` | Con `Error.captureStackTrace` |
|---------|-------------------------------|-------------------------------|
| **Stack trace** | Incluye línea del constructor | Empieza donde se lanzó el error |
| **Debugging** | Más lento (ruido visual) | Más rápido (directo al punto) |
| **Logs** | Menos profesionales | Más limpios |
| **¿Funciona?** | ✅ Sí | ✅ Sí |
| **¿Recomendado?** | ❌ No | ✅ Sí |

---

**En conclusión:** `Error.captureStackTrace(this, this.constructor)` **no es obligatorio** para que el error funcione, pero es **esencial** para tener stack traces limpios y útiles que faciliten el debugging. Le dice al motor de JavaScript: "Omite el constructor en el stack trace, empieza desde donde realmente se lanzó el error".

---

### ¿Qué Retorna la Clase?

**Respuesta corta:** Nada explícitamente, pero `new AppError()` retorna una instancia de la clase.

```javascript
const error = new AppError('User not found', 404);

// error es un objeto con:
console.log(error.message);        // "User not found" (heredado de Error)
console.log(error.statusCode);     // 404
console.log(error.status);         // "fail"
console.log(error.isOperational);  // true
console.log(error.stack);          // Stack trace completo
console.log(error instanceof Error); // true
console.log(error instanceof AppError); // true
```

---

## El Middleware errorHandler

### Código Completo

```javascript
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
```

### ¿Cómo Funciona?

#### 1. Firma del Middleware de Error

```javascript
(err, req, res, next)
```

**Importante:** Express reconoce esto como middleware de error porque tiene **4 parámetros** (incluyendo `err` al inicio).

---

### ¿Cómo Sabe Express que es un Error Handler?

**Pregunta común:** En [server.js:48-49](../src/server.js#L48-L49) hacemos `app.use(errorHandler)` sin pasar parámetros. ¿Cómo sabe Express que debe llamarlo solo cuando hay errores?

**Respuesta:** Express **cuenta los parámetros** de la función usando `.length`.

#### La Regla Simple

```javascript
// 3 parámetros = Middleware Normal (se ejecuta SIEMPRE)
const logger = (req, res, next) => { };
console.log(logger.length); // 3

// 4 parámetros = Error Handler (se ejecuta SOLO con errores)
const errorHandler = (err, req, res, next) => { };
console.log(errorHandler.length); // 4
```

#### Cómo Funciona

```javascript
// Cuando haces:
app.use(errorHandler);

// Express internamente hace (simplificado):
if (errorHandler.length === 4) {
  // "Tiene 4 parámetros, es un error handler"
  // Solo ejecutar cuando haya un error
} else {
  // "Tiene 3 o menos, es middleware normal"
  // Ejecutar en cada request
}
```

#### Flujo Completo

```javascript
// 1. Middleware normal (3 params) - se ejecuta SIEMPRE
app.use((req, res, next) => {
  console.log('Request recibido');
  next();
});

// 2. Ruta que lanza error
app.get('/users', (req, res) => {
  throw new Error('Algo salió mal'); // ← Error!
});

// 3. Error handler (4 params) - se ejecuta SOLO si hay error
app.use((err, req, res, next) => {
  console.log('Error capturado:', err.message);
  res.status(500).json({ error: err.message });
});
```

**¿Qué pasó?**
1. Request llega a `/users`
2. Se lanza un error
3. Express **salta** middlewares normales
4. Express **busca** funciones con 4 parámetros
5. Express **ejecuta** `errorHandler(error, req, res, next)`

#### Importante: El Orden Importa

```javascript
// ✅ CORRECTO: Error handler AL FINAL
app.use(middleware1);
app.use(routes);
app.use(errorHandler); // ← Después de todo

// ❌ INCORRECTO: Error handler AL PRINCIPIO
app.use(errorHandler); // ← Muy temprano
app.use(routes);
// Los errores de routes NO se capturarán
```

**Por qué:** Express ejecuta middlewares en orden. El error handler debe estar **después** de todo lo que pueda lanzar errores.

---

### ¿Por Qué el errorHandler NO Usa `next()`?

**Pregunta común:** El errorHandler recibe el parámetro `next`, pero nunca lo usa. ¿Por qué?

**Respuesta:** El errorHandler **termina el ciclo request-response** enviando la respuesta al cliente. No necesita `next()` porque es el **último middleware** en la cadena.

#### Comparación: Middleware vs Error Handler

```javascript
// Middleware normal: usa next() para continuar
app.use((req, res, next) => {
  console.log('Request recibido');
  next(); // ← Pasa al siguiente middleware
});

// Error handler: NO usa next(), envía respuesta y termina
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message }); // ← Responde y termina
  // ❌ NO hay next() porque el ciclo terminó
});
```

#### En Nuestro errorHandler

```javascript
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res); // ← Envía res.json() y TERMINA
  } else {
    sendErrorProd(error, res); // ← Envía res.json() y TERMINA
  }

  // ❌ NO llamamos next() porque ya respondimos
  // ✓ El cliente recibió la respuesta
  // ✓ El ciclo request-response terminó
}
```

#### Regla de Oro

> **Si tu middleware envía una respuesta** (`res.send()`, `res.json()`, `res.render()`), **NO llames `next()`** porque el ciclo ya terminó.

---

#### 2. Valores por Defecto

```javascript
err.statusCode = err.statusCode || 500;
err.status = err.status || 'error';
```

Si el error NO tiene `statusCode` o `status`, usa valores por defecto:
- `statusCode`: 500 (Internal Server Error)
- `status`: 'error'

**Ejemplo:**
```javascript
// Error nativo de JavaScript (no tiene statusCode)
throw new Error('Something broke');

// errorHandler agrega:
// err.statusCode = 500
// err.status = 'error'
```

#### 3. Modo Desarrollo vs Producción

**Desarrollo:**
```javascript
if (process.env.NODE_ENV === 'development') {
  sendErrorDev(err, res);
}
```

Muestra **TODA** la información (útil para debugging):
```json
{
  "status": "error",
  "error": { /* objeto completo */ },
  "message": "User not found",
  "stack": "Error: User not found\n    at ..."
}
```

**Producción:**
```javascript
else {
  // Transformar errores específicos
  if (err.name === 'CastError') error = handleCastErrorDB(err);
  // ...

  sendErrorProd(error, res);
}
```

Muestra **solo información segura** (no expone detalles internos):
```json
{
  "status": "fail",
  "message": "User not found"
}
```

#### 4. ¿De dónde viene `err.name`?

**Pregunta importante:** En el errorHandler vemos validaciones como:

```javascript
if (err.name === 'CastError') error = handleCastErrorDB(err);
if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
if (err.name === 'JsonWebTokenError') error = handleJWTError();
```

**¿De dónde viene la propiedad `name`?**

**Respuesta:** ¡NO la asignamos nosotros! Viene **automáticamente** de las librerías que lanzan los errores.

---

### Todos los Errores tienen `name` automáticamente

**Todos los objetos `Error` en JavaScript tienen la propiedad `name` por defecto:**

```javascript
const error = new Error('Algo salió mal');
console.log(error.name); // "Error" (nombre por defecto)

const typeError = new TypeError('Tipo incorrecto');
console.log(typeError.name); // "TypeError"

const rangeError = new RangeError('Fuera de rango');
console.log(rangeError.name); // "RangeError"
```

---

### Mongoose asigna `name` automáticamente

#### CastError (MongoDB)

```javascript
// Cuando intentas buscar con un ID inválido:
const user = await User.findById('xyz123'); // ID inválido

// MongoDB/Mongoose lanza un CastError con:
// {
//   name: 'CastError',           ← Mongoose lo pone automáticamente
//   path: '_id',
//   value: 'xyz123',
//   message: 'Cast to ObjectId failed for value "xyz123"'
// }
```

**¿Dónde se asigna?**
Internamente en Mongoose:
```javascript
// Dentro de Mongoose (simplificado)
class CastError extends Error {
  constructor(path, value) {
    super(`Cast to ObjectId failed for value "${value}"`);
    this.name = 'CastError'; // ← Mongoose lo asigna aquí
    this.path = path;
    this.value = value;
  }
}
```

#### ValidationError (Mongoose)

```javascript
// Cuando falla la validación del schema:
const user = await User.create({
  username: 'ab', // Muy corto (mínimo 3)
  email: 'invalid-email', // Email inválido
  password: '123' // Muy corta (mínimo 6)
});

// Mongoose lanza ValidationError con:
// {
//   name: 'ValidationError',     ← Mongoose lo pone
//   errors: {
//     username: { message: 'Username must be at least 3 characters' },
//     email: { message: 'Invalid email format' },
//     password: { message: 'Password must be at least 6 characters' }
//   }
// }
```

#### Código Duplicado (MongoDB)

```javascript
// Cuando intentas crear un usuario con email que ya existe:
const user = await User.create({
  email: 'test@test.com' // Ya existe
});

// MongoDB lanza error con:
// {
//   code: 11000,                 ← Código de error de duplicado
//   name: 'MongoServerError',    ← MongoDB lo pone
//   keyPattern: { email: 1 },
//   keyValue: { email: 'test@test.com' }
// }
```

---

### JWT (jsonwebtoken) asigna `name` automáticamente

#### JsonWebTokenError

```javascript
import jwt from 'jsonwebtoken';

// Token inválido
try {
  jwt.verify('token.malformado.aqui', process.env.JWT_SECRET);
} catch (error) {
  console.log(error.name); // "JsonWebTokenError" ← JWT lo asigna
  console.log(error.message); // "jwt malformed"
}
```

**¿Dónde se asigna?**
```javascript
// Dentro de la librería jsonwebtoken (simplificado)
class JsonWebTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JsonWebTokenError'; // ← JWT lo asigna aquí
  }
}
```

#### TokenExpiredError

```javascript
import jwt from 'jsonwebtoken';

// Token expirado
try {
  jwt.verify(expiredToken, process.env.JWT_SECRET);
} catch (error) {
  console.log(error.name); // "TokenExpiredError" ← JWT lo asigna
  console.log(error.message); // "jwt expired"
  console.log(error.expiredAt); // Fecha de expiración
}
```

---

### Tabla de Errores y sus `name`

| Error | Quién lo lanza | `name` automático | Cuándo ocurre |
|-------|----------------|-------------------|---------------|
| **CastError** | Mongoose | `'CastError'` | ID inválido en MongoDB |
| **ValidationError** | Mongoose | `'ValidationError'` | Validación de schema falla |
| **MongoServerError** | MongoDB | `'MongoServerError'` | Error de MongoDB (ej: duplicado con `code: 11000`) |
| **JsonWebTokenError** | jsonwebtoken | `'JsonWebTokenError'` | Token JWT malformado o firma inválida |
| **TokenExpiredError** | jsonwebtoken | `'TokenExpiredError'` | Token JWT expirado |
| **AppError** | Nosotros | `'Error'` (hereda de Error) | Errores personalizados |

---

### Ejemplo de Flujo Completo

```javascript
// 1. Request con ID inválido
GET /api/users/abc123

// 2. Controller
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById('abc123'); // ID inválido
  res.json({ user });
});

// 3. Mongoose detecta que 'abc123' no es un ObjectId válido
// 4. Mongoose crea un CastError:
const error = new CastError('_id', 'abc123');
// error.name = 'CastError' ← Mongoose lo pone automáticamente

// 5. asyncHandler captura el error y lo pasa a next(error)

// 6. errorHandler recibe el error
export const errorHandler = (err, req, res, next) => {
  console.log(err.name); // "CastError" ← Ya viene con name

  // 7. Detecta que err.name === 'CastError'
  if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  }

  // 8. Transforma a AppError amigable
}
```

---

### Cómo verificar qué `name` tiene un error

```javascript
export const errorHandler = (err, req, res, next) => {
  // Logs útiles para debugging:
  console.log('Error name:', err.name);
  console.log('Error code:', err.code);
  console.log('Error message:', err.message);
  console.log('Full error:', err);

  // Ahora puedes ver qué errors llegan y sus propiedades
  if (err.name === 'CastError') { ... }
  if (err.code === 11000) { ... }
  // etc.
}
```

---

### Resumen

**Pregunta:** ¿Dónde se asigna la propiedad `name` a los errores?

**Respuesta:**

1. **NO la asignamos nosotros** manualmente
2. La asignan **automáticamente** las librerías:
   - **Mongoose** → `'CastError'`, `'ValidationError'`
   - **MongoDB** → `'MongoServerError'`
   - **jsonwebtoken** → `'JsonWebTokenError'`, `'TokenExpiredError'`
   - **JavaScript** → `'Error'`, `'TypeError'`, `'ReferenceError'`, etc.

3. Nosotros solo **verificamos** esa propiedad en el `errorHandler`:
```javascript
if (err.name === 'CastError') { ... }
if (err.name === 'ValidationError') { ... }
```

Es como verificar el "tipo" del error para transformarlo a un mensaje amigable para el usuario.

---

## Funciones Helper

### handleCastErrorDB

```javascript
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
```

**¿Cuándo ocurre?**
Cuando pasas un ID inválido a MongoDB.

**Ejemplo:**
```javascript
// ID inválido (no es un ObjectId de MongoDB)
User.findById('abc123');

// MongoDB lanza CastError
// err.path = "_id"
// err.value = "abc123"

// Transformamos a AppError con mensaje claro:
// "Invalid _id: abc123"
```

### handleDuplicateFieldsDB

```javascript
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyPattern)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: ${field} = "${value}". Please use another value`;
  return new AppError(message, 400);
};
```

**¿Cuándo ocurre?**
Cuando intentas crear un documento con un valor único que ya existe.

**Ejemplo:**
```javascript
// Intento registrar email que ya existe
User.create({ email: 'test@test.com' });

// MongoDB lanza error con código 11000
// err.keyPattern = { email: 1 }
// err.keyValue = { email: 'test@test.com' }

// Transformamos a:
// "Duplicate field value: email = "test@test.com". Please use another value"
```

### handleValidationErrorDB

```javascript
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
```

**¿Cuándo ocurre?**
Cuando falla la validación de Mongoose schema.

**Ejemplo:**
```javascript
// Schema requiere minlength: 6 para password
User.create({ password: '123' });

// Mongoose lanza ValidationError
// err.errors = {
//   password: { message: 'Password must be at least 6 characters' }
// }

// Transformamos a:
// "Invalid input data. Password must be at least 6 characters"
```

### handleJWTError y handleJWTExpiredError

```javascript
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again', 401);
```

**¿Cuándo ocurren?**
- **JsonWebTokenError**: Token malformado o con firma inválida
- **TokenExpiredError**: Token válido pero expirado

---

## Flujo Completo de Manejo de Errores

### Ejemplo 1: Error Operacional (Usuario no encontrado)

```javascript
// 1. Controller lanza error
export const getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404); // ← Error lanzado aquí
  }

  res.json({ user });
});

// 2. asyncHandler captura el error y lo pasa a next()
// (ver documentación de AsyncHandler)

// 3. Express llama al errorHandler middleware
errorHandler(err, req, res, next) {
  // err.statusCode = 404
  // err.status = "fail"
  // err.isOperational = true

  // 4. En producción, verifica isOperational
  if (err.isOperational) {
    // 5. Responde al cliente
    res.status(404).json({
      status: "fail",
      message: "User not found"
    });
  }
}
```

### Ejemplo 2: Error de MongoDB (ID inválido)

```javascript
// 1. Request con ID inválido
GET /api/users/xyz123

// 2. Controller
const user = await User.findById('xyz123'); // ← MongoDB lanza CastError

// 3. asyncHandler captura el error y lo pasa a next()

// 4. errorHandler recibe CastError
errorHandler(err, req, res, next) {
  // err.name = "CastError"
  // err.path = "_id"
  // err.value = "xyz123"

  // 5. Transforma a AppError
  error = handleCastErrorDB(err);
  // error.message = "Invalid _id: xyz123"
  // error.statusCode = 400

  // 6. Responde
  res.status(400).json({
    status: "fail",
    message: "Invalid _id: xyz123"
  });
}
```

### Ejemplo 3: Bug Inesperado (Error de Programación)

```javascript
// 1. Bug en el código
export const buggyFunction = asyncHandler(async (req, res) => {
  const result = undefined.someMethod(); // ← TypeError!
});

// 2. asyncHandler captura TypeError

// 3. errorHandler recibe el error
errorHandler(err, req, res, next) {
  // err es TypeError nativo
  // err.isOperational = undefined (no es AppError)

  // 4. En producción
  if (!err.isOperational) {
    // 5. NO exponer detalles
    console.error('ERROR:', err); // Log interno

    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!' // Mensaje genérico
    });
  }
}
```

---

## Ejemplos Prácticos

### Crear y Lanzar Errores

```javascript
import { AppError } from '../middlewares/errorHandler.js';

// Error simple
throw new AppError('User not found', 404);

// Error de autenticación
throw new AppError('Invalid credentials', 401);

// Error de validación
throw new AppError('Email is required', 400);

// Error de servidor
throw new AppError('Database connection failed', 500);
```

### Verificar Tipo de Error

```javascript
try {
  throw new AppError('Test error', 400);
} catch (error) {
  console.log(error instanceof Error);     // true
  console.log(error instanceof AppError);  // true
  console.log(error.isOperational);        // true
  console.log(error.statusCode);           // 400
}
```

### Uso en Middleware

```javascript
export const protect = asyncHandler(async (req, res, next) => {
  // 1. Verificar token
  if (!token) {
    throw new AppError('You are not logged in', 401);
  }

  // 2. Verificar usuario
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError('User no longer exists', 401);
  }

  // 3. Verificar cuenta activa
  if (!user.isActive) {
    throw new AppError('User account is deactivated', 401);
  }

  next();
});
```

---

## Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                         AppError                            │
├─────────────────────────────────────────────────────────────┤
│  Hereda de: Error (clase nativa de JavaScript)              │
│                                                             │
│  Constructor recibe:                                        │
│    - message: string (mensaje del error)                   │
│    - statusCode: number (código HTTP)                      │
│                                                             │
│  Propiedades:                                               │
│    - message: heredado de Error                            │
│    - statusCode: 400, 404, 500, etc.                       │
│    - status: 'fail' (4xx) o 'error' (5xx)                  │
│    - isOperational: true (error esperado)                  │
│    - stack: stack trace (para debugging)                   │
│                                                             │
│  Métodos:                                                   │
│    - Error.captureStackTrace(): captura el stack trace     │
└─────────────────────────────────────────────────────────────┘

                            ↓ throw new AppError()

┌─────────────────────────────────────────────────────────────┐
│                      errorHandler                           │
├─────────────────────────────────────────────────────────────┤
│  1. Recibe el error                                         │
│  2. Establece defaults (statusCode: 500, status: 'error')   │
│  3. Distingue desarrollo vs producción                      │
│     - Dev: Muestra todo (stack, error completo)            │
│     - Prod: Solo info segura (mensaje sin detalles)        │
│  4. Transforma errores de MongoDB/JWT a AppError           │
│  5. Responde al cliente con JSON                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Preguntas Frecuentes

### ¿Por qué no simplemente usar Error nativo?

```javascript
// ❌ Error nativo - información insuficiente
throw new Error('User not found');
// No sabemos qué código HTTP responder
// No sabemos si es error 4xx o 5xx
// No sabemos si es operacional o bug

// ✅ AppError - información completa
throw new AppError('User not found', 404);
// statusCode = 404
// status = "fail"
// isOperational = true
```

### ¿Cuándo usar AppError vs dejar que MongoDB lance el error?

```javascript
// Opción 1: Dejar que MongoDB lance el error
const user = await User.findById('invalid_id');
// MongoDB lanza CastError
// errorHandler lo transforma a AppError automáticamente

// Opción 2: Lanzar AppError explícitamente
const user = await User.findById(req.params.id);
if (!user) {
  throw new AppError('User not found', 404);
}

// Usa Opción 2 cuando quieras:
// - Mensaje personalizado
// - Lógica de negocio específica
// - Mayor control
```

### ¿Qué pasa si olvido llamar a super()?

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    // ❌ Olvidamos super()
    this.statusCode = statusCode; // ERROR!
  }
}

// Error: Must call super constructor before accessing 'this'
```

Siempre **debes** llamar a `super()` antes de usar `this` en clases que heredan.

---

## Conclusión

La clase **AppError** es una forma elegante y profesional de:
1. ✅ Crear errores personalizados con información completa
2. ✅ Heredar funcionalidad de la clase Error nativa
3. ✅ Distinguir errores operacionales de bugs
4. ✅ Capturar stack traces útiles
5. ✅ Mantener el código limpio y consistente
6. ✅ Proteger información sensible en producción

El sistema completo (AppError + errorHandler + funciones helper) proporciona un manejo de errores robusto, seguro y fácil de mantener.
