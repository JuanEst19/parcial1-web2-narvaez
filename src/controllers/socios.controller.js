// src/controllers/socios.controller.js
import * as servicio from "../services/socios.service.js";

export async function listarPrestamos(req, res, next) {
  try {
    const socioId = Number(req.params.id);
    const estado = req.query.estado;
    const prestamos = await servicio.listarPrestamosDeSocio(socioId, estado);
    res.status(200).json(prestamos);
  } catch (error) {
    next(error);
  }
}

