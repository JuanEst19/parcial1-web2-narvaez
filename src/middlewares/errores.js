// src/middlewares/errores.js — EL middleware de errores (4 parámetros)
import { ErrorHttp } from "../errores.js";

export function manejadorErrores(err, req, res, next) {
  // Errores esperados del dominio → su código y su mensaje
  if (err instanceof ErrorHttp) {
    return res.status(err.codigo).json({ error: err.message });
  }
  // Errores inesperados → log completo para nosotros, 500 genérico para el cliente
  console.error("Error no controlado:", err);
  res.status(500).json({ error: "Error interno del servidor" });
}

