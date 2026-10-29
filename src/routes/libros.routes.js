// src/routes/libros.routes.js
import { Router } from "express";
import { body, param, query } from "express-validator";
import * as controlador from "../controllers/libros.controller.js";
import { validar } from "../middlewares/validar.js";

const router = Router();

// L1 · GET /api/libros — listar con filtros y paginación
router.get(
  "/",
  query("buscar")
    .optional()
    .isString()
    .withMessage("buscar debe ser una cadena"),
  query("disponibles")
    .optional()
    .isIn(["true", "false"])
    .withMessage("disponibles debe ser true o false"),
  query("pagina")
    .optional()
    .isInt({ min: 1 })
    .withMessage("pagina debe ser un entero ≥ 1"),
  query("porPagina")
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage("porPagina debe ser un entero de 1 a 20"),
  validar,
  controlador.listar,
);

// L2 · GET /api/libros/:id — ver un libro
router.get(
  "/:id",
  param("id")
    .isInt({ min: 1 })
    .withMessage("El id debe ser un entero positivo"),
  validar,
  controlador.obtener,
);

// L3 · POST /api/libros — registrar un libro
router.post(
  "/",
  body("titulo")
    .trim()
    .notEmpty()
    .withMessage("El título es obligatorio"),
  body("autor")
    .trim()
    .notEmpty()
    .withMessage("El autor es obligatorio"),
  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("El ISBN es obligatorio"),
  body("ejemplares")
    .notEmpty()
    .withMessage("Los ejemplares son obligatorios")
    .isInt({ min: 1, max: 50 })
    .withMessage("Los ejemplares deben ser un entero de 1 a 50"),
  validar,
  controlador.crear,
);

export default router;

