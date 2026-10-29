// src/routes/prestamos.routes.js
import { Router } from "express";
import { body, param } from "express-validator";
import * as controlador from "../controllers/prestamos.controller.js";
import { validar } from "../middlewares/validar.js";

const router = Router();

// P1 · POST /api/prestamos — prestar un libro
router.post(
  "/",
  body("socioId")
    .notEmpty()
    .withMessage("socioId es obligatorio")
    .isInt({ min: 1 })
    .withMessage("socioId debe ser un entero positivo")
    .toInt(),
  body("libroId")
    .notEmpty()
    .withMessage("libroId es obligatorio")
    .isInt({ min: 1 })
    .withMessage("libroId debe ser un entero positivo")
    .toInt(),
  validar,
  controlador.crear,
);

// P2 · PATCH /api/prestamos/:id/devolucion — devolver
router.patch(
  "/:id/devolucion",
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo")
    .toInt(),
  validar,
  controlador.devolver,
);

export default router;

