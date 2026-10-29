// src/services/socios.service.js
import { prisma } from "../db.js";
import { noEncontrado } from "../errores.js";

export async function listarPrestamosDeSocio(socioId, estado) {
  // Si el socio no existe -> 404
  const socio = await prisma.socio.findUnique({
    where: { id: socioId },
  });

  if (!socio) {
    throw noEncontrado("Socio no encontrado");
  }

  const where = { socioId };
  if (estado) {
    where.estado = estado;
  }

  // Una sola consulta sin N+1, del más reciente al más antiguo, libro con id, titulo y autor
  const prestamos = await prisma.prestamo.findMany({
    where,
    orderBy: [
      { fechaPrestamo: "desc" },
      { id: "desc" },
    ],
    include: {
      libro: {
        select: {
          id: true,
          titulo: true,
          autor: true,
        },
      },
    },
  });

  return prestamos;
}

