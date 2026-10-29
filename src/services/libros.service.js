// src/services/libros.service.js
import { prisma } from "../db.js";
import { conflicto, noEncontrado } from "../errores.js";

export async function listarLibros({ buscar, disponibles, pagina = 1, porPagina = 10 } = {}) {
  const numPagina = Number(pagina) || 1;
  const numPorPagina = Number(porPagina) || 10;

  const where = {};

  if (buscar && buscar.trim() !== "") {
    const termino = buscar.trim();
    where.OR = [
      { titulo: { contains: termino, mode: "insensitive" } },
      { autor: { contains: termino, mode: "insensitive" } },
    ];
  }

  if (disponibles === "true" || disponibles === true) {
    where.ejemplaresDisponibles = { gt: 0 };
  }

  const [datos, total] = await Promise.all([
    prisma.libro.findMany({
      where,
      orderBy: { titulo: "asc" },
      skip: (numPagina - 1) * numPorPagina,
      take: numPorPagina,
    }),
    prisma.libro.count({ where }),
  ]);

  return {
    datos,
    paginacion: {
      pagina: numPagina,
      porPagina: numPorPagina,
      total,
      totalPaginas: Math.ceil(total / numPorPagina),
    },
  };
}

export async function obtenerLibro(id) {
  const libro = await prisma.libro.findUnique({
    where: { id },
  });

  if (!libro) {
    throw noEncontrado("Libro no encontrado");
  }

  return libro;
}

export async function crearLibro({ titulo, autor, isbn, ejemplares }) {
  const isbnLimpio = isbn.trim();

  const existe = await prisma.libro.findUnique({
    where: { isbn: isbnLimpio },
  });

  if (existe) {
    throw conflicto(`Ya existe un libro con el ISBN ${isbnLimpio}`);
  }

  const cantidad = Number(ejemplares);

  try {
    return await prisma.libro.create({
      data: {
        titulo: titulo.trim(),
        autor: autor.trim(),
        isbn: isbnLimpio,
        ejemplaresTotales: cantidad,
        ejemplaresDisponibles: cantidad,
      },
    });
  } catch (error) {
    if (error?.code === "P2002") {
      throw conflicto(`Ya existe un libro con el ISBN ${isbnLimpio}`);
    }
    throw error;
  }
}

