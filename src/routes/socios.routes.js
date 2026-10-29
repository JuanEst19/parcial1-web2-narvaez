// src/routes/socios.routes.js
import { Router } from "express";
import { param, query } from "express-validator";
import * as controlador from "../controllers/socios.controller.js";
import { validar } from "../middlewares/validar.js";

const router = Router();

// P3 · GET /api/socios/:id/prestamos — historial de un socio
router.get(
  "/:id/prestamos",
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
  query("estado")
    .optional()
    .isIn(["ACTIVO", "DEVUELTO"])
    .withMessage("estado debe ser ACTIVO o DEVUELTO"),
  validar,
  controlador.listarPrestamos,
);

export default router;

