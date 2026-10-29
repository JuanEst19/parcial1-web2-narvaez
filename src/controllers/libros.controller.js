// src/controllers/libros.controller.js
import * as servicio from "../services/libros.service.js";

export async function listar(req, res, next) {
  try {
    const resultado = await servicio.listarLibros({
      buscar: req.query.buscar,
      disponibles: req.query.disponibles,
      pagina: req.query.pagina,
      porPagina: req.query.porPagina,
    });
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function obtener(req, res, next) {
  try {
    const libro = await servicio.obtenerLibro(Number(req.params.id));
    res.json(libro);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const { titulo, autor, isbn, ejemplares } = req.body;
    const nuevo = await servicio.crearLibro({
      titulo,
      autor,
      isbn,
      ejemplares,
    });
    res.status(201).json(nuevo);
  } catch (error) {
    next(error);
  }
}

