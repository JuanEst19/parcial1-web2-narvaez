// src/controllers/prestamos.controller.js
import * as servicio from "../services/prestamos.service.js";

export async function crear(req, res, next) {
  try {
    const { socioId, libroId } = req.body;
    const nuevo = await servicio.crearPrestamo({ socioId, libroId });
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
}

export async function devolver(req, res, next) {
  try {
    const prestamoId = Number(req.params.id);
    const actualizado = await servicio.devolverPrestamo(prestamoId);
    res.status(200).json(actualizado);
  } catch (error) {
    next(error);
  }
}

