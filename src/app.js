// src/app.js — configura Express (sin arrancarlo)
import express from "express";
import morgan from "morgan";
import { manejadorErrores } from "./middlewares/errores.js";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) =>
  res.json({ nombre: "Biblioteca API", version: "1.0" }),
);

// TODO: montar rutas aquí (ej. app.use("/api/...", router))

// 404 para todo lo demás (va al final de las rutas)
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// Middleware central de errores (4 parámetros, siempre al final)
app.use(manejadorErrores);

export default app;

