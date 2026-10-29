# Biblioteca API — Parcial 1 Programación Web 2

API RESTful para la gestión de catálogo de libros y préstamos de biblioteca, desarrollada con **Node.js**, **Express 5**, **Prisma ORM 7** y **PostgreSQL 16**.

---

## 📋 Requisitos Previos

- **Node.js** v22.18 o superior (soporte para ES Modules `"type": "module"`).
- **npm** v10 o superior.
- **Docker** y Docker Desktop activo (para PostgreSQL 16).

---

## 🚀 Pasos para Levantar el Proyecto desde Cero

### 1. Entrar a la carpeta del proyecto
```bash
cd parcial1-web2-narvaez
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Copia el archivo [.env.example](file:///Users/juanestebannarvaez/Downloads/web%202/parcial1-web2-narvaez/.env.example) a `.env`:
```bash
cp .env.example .env
```
Verifica que la variable `DATABASE_URL` apunte al puerto 5433:
```env
PORT=4000
DATABASE_URL="postgresql://campuseats:secreto123@localhost:5433/biblioteca"
```

### 4. Iniciar contenedor de base de datos en Docker
Si usas el contenedor existente de CampusEats en el puerto 5433, asegúrate de que esté encendido.
Si necesitas crear uno nuevo desde cero:
```bash
docker run --name biblioteca-db -e POSTGRES_USER=campuseats -e POSTGRES_PASSWORD=secreto123 -e POSTGRES_DB=biblioteca -p 5433:5432 -d postgres:16
```

### 5. Ejecutar migraciones de base de datos
Crea y aplica la estructura en la base de datos `biblioteca`:
```bash
npx prisma migrate dev
```

### 6. Generar el cliente de Prisma 7
```bash
npx prisma generate
```

### 7. Poblar la base de datos con los datos iniciales (Seed)
Ejecuta el script de seed para sembrar los 3 socios, 5 libros y 3 préstamos de prueba:
```bash
npx prisma db seed
```
*(Nota: Si deseas reiniciar la base a su estado inicial en cualquier momento, puedes ejecutar `npx prisma migrate reset` o volver a correr `npx prisma db seed`).*

### 8. Arrancar el servidor
- En modo desarrollo (con recarga automática):
  ```bash
  npm run dev
  ```
- En modo producción:
  ```bash
  npm start
  ```

El servidor quedará escuchando en: **`http://localhost:4000`**

---

## 🏛️ Arquitectura del Código

El proyecto sigue una arquitectura en capas desacoplada:

```
src/
├── app.js                   # Configuración de Express, middlewares y rutas
├── server.js                # Arranque del servidor HTTP en el puerto 4000
├── db.js                    # Conexión e instancia única de PrismaClient con PrismaPg
├── errores.js               # Clases y helpers de errores de dominio (ErrorHttp, noEncontrado, conflicto)
├── middlewares/
│   ├── validar.js           # Middleware que recolecta errores de express-validator y responde 400
│   └── errores.js           # Manejador central de errores (4 parámetros)
├── routes/                  # Capa de rutas y validación de entrada
│   ├── libros.routes.js
│   ├── prestamos.routes.js
│   └── socios.routes.js
├── controllers/             # Capa de presentación (traducción HTTP <-> negocio)
│   ├── libros.controller.js
│   ├── prestamos.controller.js
│   └── socios.controller.js
└── services/                # Capa de lógica de negocio pura (sin req, res ni códigos HTTP)
    ├── libros.service.js
    ├── prestamos.service.js
    └── socios.service.js
```

### Principios de Calidad:
1. **Rutas que validan**: Toda entrada (`body`, `param`, `query`) se valida estrictamente en las rutas usando `express-validator`.
2. **Controllers que traducen HTTP**: Se limitan a extraer parámetros limpios, llamar al service y enviar la respuesta HTTP o pasar el error a `next(error)`.
3. **Services limpios**: La lógica de negocio no contiene `req`, `res` ni números de estado HTTP. Los errores de negocio lanzan `noEncontrado` (404) y `conflicto` (409).
4. **Manejador único de errores**: `manejadorErrores` en `src/middlewares/errores.js` captura todas las excepciones. Rutas inexistentes responden `404` en formato JSON (`{ "error": "Ruta no encontrada" }`).
5. **Resistencia a condición de carrera**: `POST /api/prestamos` usa transacciones atómicas con condición en el `WHERE` para garantizar que peticiones simultáneas por el último ejemplar nunca generen stock negativo.

---

## 📡 Endpoints de la API

### Catálogo de Libros (`/api/libros`)
- **`GET /api/libros`**: Listar libros con filtros y paginación.
  - Query params:
    - `buscar` (opcional): Filtro insensible a mayúsculas por título o autor.
    - `disponibles` (opcional): `true` o `false` (con `true` muestra solo con ejemplares > 0).
    - `pagina` (opcional, defecto `1`): Entero $\ge 1$.
    - `porPagina` (opcional, defecto `10`): Entero de 1 a 20.
  - Orden: Título ascendente.
- **`GET /api/libros/:id`**: Detalle de un libro por su ID (`200` si existe, `404` si no, `400` si el id no es entero positivo).
- **`POST /api/libros`**: Registrar un nuevo libro.
  - Body: `{ titulo, autor, isbn, ejemplares }`.
  - Responde `201` con el libro creado (`409` si el ISBN ya existe).

### Préstamos (`/api/prestamos`)
- **`POST /api/prestamos`**: Prestar un libro.
  - Body: `{ socioId, libroId }`.
  - Transacción atómica que valida existencia, límite de 3 préstamos activos por socio y disponibilidad de ejemplares.
  - Responde `201` con el préstamo e incluye su libro (`id`, `titulo`).
- **`PATCH /api/prestamos/:id/devolucion`**: Devolver un libro prestado.
  - Sin cuerpo. Marca el préstamo como `DEVUELTO` con la fecha actual e incrementa el stock disponible del libro.
  - Responde `200` (`404` si no existe, `409` si ya estaba devuelto).

### Socios (`/api/socios`)
- **`GET /api/socios/:id/prestamos`**: Historial de préstamos de un socio.
  - Query params: `estado` opcional (`ACTIVO` o `DEVUELTO`).
  - Responde `200` con el arreglo de préstamos ordenados del más reciente al más antiguo, incluyendo libro (`id`, `titulo`, `autor`) en una única consulta sin problema N+1.
