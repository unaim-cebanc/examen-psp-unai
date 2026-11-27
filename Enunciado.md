# Examen Práctico: API REST de una Plataforma de Videojuegos

**Duración sugerida:** 120 minutos
**Objetivo:** Desarrollar una API REST con Express que gestione dos recursos (`juegos` y `compras`), con persistencia en ficheros JSON independientes, reglas de negocio entre recursos y un logger de consola coloreado con `picocolors`.

---

## 📋 Instrucciones generales

* El fichero principal se llamará **`api.js`**.
* Crea la carpeta `BBDD` con los dos ficheros de datos iniciales indicados más abajo.
* Se te entrega el fichero `pruebas.http` (extensión REST Client) con las peticiones para probar la API. Puedes usarlo tal cual o adaptarlo.
* No se permite usar bases de datos. Toda la persistencia se hace en ficheros JSON.

---

## 📁 Archivos de Datos Iniciales (`BBDD/`)

### 1. `BBDD/juegos.json`
```json
[
  {
    "id": 1,
    "titulo": "Stardew Valley",
    "desarrollador": "ConcernedApe",
    "anio": 2016,
    "genero": "Simulación",
    "precio": 14.99,
    "retirado": false,
    "copiasVendidas": 1
  },
  {
    "id": 2,
    "titulo": "Hollow Knight",
    "desarrollador": "Team Cherry",
    "anio": 2017,
    "genero": "Metroidvania",
    "precio": 14.99,
    "retirado": false,
    "copiasVendidas": 1
  },
  {
    "id": 3,
    "titulo": "Celeste",
    "desarrollador": "Maddy Makes Games",
    "anio": 2018,
    "genero": "Plataformas",
    "precio": 19.99,
    "retirado": true,
    "copiasVendidas": 0
  }
]
```

### 2. `BBDD/compras.json`
```json
[
  {
    "codigo": "C001",
    "juegoId": 2,
    "usuario": "Gorka Oñederra",
    "fecha": "2026-11-10T00:00:00",
    "estado": "Activa"
  }
]
```

---

## 📋 Requisitos de la API

1. **Servidor y Logger de Consola:**
   * Arrancar el servidor Express en el puerto **`4567`**.
   * Habilitar la lectura de JSON (`express.json()`).
   * Usar un middleware global con `picocolors` que muestre por consola el método HTTP, la URL y el código de estado devuelto (en verde si es un `2xx` o `3xx` y en rojo si es un `4xx` o `5xx`).

2. **Endpoints para `Juegos`:**
   * `GET /api/juegos`: Lista todos los juegos y devuelve `200 OK`.
   * `GET /api/juegos/:id`: Devuelve un juego por su ID. Responde `404` si no existe.
   * `POST /api/juegos`: Crea un juego nuevo y devuelve `201 Created` con el objeto creado.
   * `PUT /api/juegos/:id`: Actualiza `titulo`, `desarrollador`, `anio`, `genero` y `precio` de un juego. Responde `404` si no existe. Los campos `retirado` y `copiasVendidas` **no** se modifican con este endpoint.
   * `DELETE /api/juegos/:id`: Elimina un juego. Responde `404` si no existe y `409 Conflict` si el juego tiene una compra en estado `Activa`.
   * `DELETE /api/juegos/titulo/:titulo`: Elimina un juego por su **título**, que debe coincidir exactamente con el parámetro (por ejemplo `Celeste`). Responde `404` si no existe y `409 Conflict` si el juego tiene una compra en estado `Activa`.

3. **Reglas del `POST` de juegos:**
   * El cliente envía `Content-Type: application/json` con los campos **`titulo`**, **`desarrollador`**, **`anio`**, **`genero`** y **`precio`**.
   * El **servidor** asigna:
     * `id`: el siguiente número disponible (si el último juego tiene el id 3, el nuevo tendrá el 4).
     * `retirado`: siempre `false` en el alta.
     * `copiasVendidas`: siempre `0` en el alta.
   * La respuesta debe tener los campos en este orden: `id`, `titulo`, `desarrollador`, `anio`, `genero`, `precio`, `retirado`, `copiasVendidas`.

   Ejemplo de petición:
   ```json
   {
     "titulo": "Hades",
     "desarrollador": "Supergiant Games",
     "anio": 2020,
     "genero": "Roguelike",
     "precio": 24.99
   }
   ```

   Ejemplo de respuesta (`201 Created`):
   ```json
   {
     "id": 4,
     "titulo": "Hades",
     "desarrollador": "Supergiant Games",
     "anio": 2020,
     "genero": "Roguelike",
     "precio": 24.99,
     "retirado": false,
     "copiasVendidas": 0
   }
   ```

4. **Endpoints para `Compras`:**
   * `GET /api/compras`: Lista todas las compras y devuelve `200 OK`.
   * `GET /api/compras/:titulo`: Devuelve, como array JSON, las compras del juego cuyo **título** coincide exactamente con el parámetro (por ejemplo `Hollow Knight`). Responde `404` si no existe ningún juego con ese título. Si el juego existe pero no tiene compras, responde `200` con un array vacío. Recuerda que el título puede contener espacios.
   * `POST /api/compras`: Registra una compra nueva. Ver reglas en el apartado 5.
   * `PUT /api/compras/:codigo/reembolsar`: Marca la compra como reembolsada. Ver reglas en el apartado 6.

5. **Reglas del `POST` de compras:**
   * El cliente envía **`juegoId`**, **`usuario`** y **`fecha`**.
   * Antes de crear la compra, el servidor debe comprobar:
     * Si el juego con ese `juegoId` **no existe**, responde `404` con un mensaje de error en JSON.
     * Si el juego existe pero **`retirado` es `true`**, responde `409 Conflict` con un mensaje de error en JSON.
     * Si el usuario ya tiene una compra en estado `Activa` de ese mismo juego, responde `409 Conflict` con un mensaje de error en JSON.
   * Si todo es correcto, el **servidor** asigna:
     * `codigo`: la letra `C` seguida de un número de 3 cifras. A partir de los datos iniciales, el primer código nuevo es `C002`, luego `C003`, etc.
     * `estado`: siempre `"Activa"`.
   * Además, el `copiasVendidas` del juego asociado **aumenta en 1**.
   * Se guardan **ambos ficheros** (`compras.json` y `juegos.json`) y se devuelve `201 Created`.
   * La `fecha` se guarda **tal cual llega**. No la conviertas con `new Date()`.
   * La respuesta debe tener los campos en este orden: `codigo`, `juegoId`, `usuario`, `fecha`, `estado`.

   Ejemplo de petición:
   ```json
   {
     "juegoId": 1,
     "usuario": "Germán Alonso",
     "fecha": "2026-11-12T00:00:00"
   }
   ```

   Ejemplo de respuesta (`201 Created`):
   ```json
   {
     "codigo": "C002",
     "juegoId": 1,
     "usuario": "Germán Alonso",
     "fecha": "2026-11-12T00:00:00",
     "estado": "Activa"
   }
   ```

6. **Reglas del `PUT /api/compras/:codigo/reembolsar`:**
   * Responde `404` si la compra no existe.
   * Responde `409 Conflict` si la compra ya estaba `Reembolsada`.
   * Si todo es correcto, cambia el `estado` de la compra a `"Reembolsada"`, **resta 1** al `copiasVendidas` del juego asociado, guarda ambos ficheros y responde `200 OK` con la compra actualizada.
   * No hace falta enviar ningún cuerpo en esta petición.

7. **Persistencia:**
   * Cada alta, modificación o baja debe guardarse en el fichero correspondiente (`juegos.json` o `compras.json`) para que los cambios sobrevivan a un reinicio del servidor.
   * Las operaciones que afectan a los dos recursos (crear o reembolsar una compra) deben guardar **los dos ficheros**.

8. **Fuera del alcance de este examen:**
   * No hace falta validar los campos (formatos, longitudes, precios válidos, etc.).
   * No hace falta control de autenticación ni de sesiones.
   * No hace falta paginación.

---

## 🧪 Pruebas mínimas que debe superar la API

Comprueba al menos estos casos con el fichero `pruebas.http` que se te entrega (o con tu cliente de pruebas):

| # | Petición | Resultado esperado |
|---|----------|--------------------|
| 1 | `GET /api/juegos` | `200` y 3 juegos |
| 2 | `GET /api/juegos/99` | `404` |
| 3 | `POST /api/juegos` con datos válidos | `201` con `id: 4`, `retirado: false` y `copiasVendidas: 0` |
| 4 | `POST /api/compras` con `juegoId: 3` | `409` (el juego está retirado) |
| 5 | `POST /api/compras` con `juegoId: 99` | `404` |
| 6 | `POST /api/compras` con `juegoId: 1` y usuario `Germán Alonso` | `201` con código `C002`, y el juego 1 pasa a `copiasVendidas: 2` |
| 7 | `POST /api/compras` con `juegoId: 1` y el mismo usuario | `409` (ya tiene una compra activa de ese juego) |
| 8 | `GET /api/compras/Juego%20Inexistente` | `404` |
| 9 | `PUT /api/compras/C001/reembolsar` | `200`, compra `Reembolsada` y el juego 2 vuelve a `copiasVendidas: 0` |
| 10 | `PUT /api/compras/C001/reembolsar` (por segunda vez) | `409` |
| 11 | `DELETE /api/juegos/1` (con la compra C002 activa) | `409` |
| 12 | `DELETE /api/juegos/4` (sin compras activas) | `200` o mensaje de confirmación, y el juego desaparece de `juegos.json` |
| 13 | `DELETE /api/juegos/titulo/Celeste` (sin compras activas) | `200` o mensaje de confirmación, y el juego desaparece de `juegos.json` |

---

## 📦 Entrega

Entrega tu repositorio con el proyecto.
