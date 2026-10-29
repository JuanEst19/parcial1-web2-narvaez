// src/app.js — configura Express (sin arrancarlo)
import express from "express";
import morgan from "morgan";
import librosRouter from "./routes/libros.routes.js";
import prestamosRouter from "./routes/prestamos.routes.js";
import sociosRouter from "./routes/socios.routes.js";
import { manejadorErrores } from "./middlewares/errores.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ nombre: "Biblioteca API", version: "1.0" }),
);

// Endpoints
app.use("/api/libros", librosRouter);
app.use("/api/prestamos", prestamosRouter);
app.use("/api/socios", sociosRouter);

// 404 para todo lo demás (va al final de las rutas)
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// Middleware central de errores (4 parámetros, siempre al final)
app.use(manejadorErrores);

export default app;
