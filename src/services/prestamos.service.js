// src/services/prestamos.service.js
import { prisma } from "../db.js";
import { conflicto, noEncontrado } from "../errores.js";

export async function crearPrestamo({ socioId, libroId }) {
  // Todo ocurre dentro de una transacción interactiva
  return prisma.$transaction(async (tx) => {
    // 1. Si el socio no existe -> 404 Socio no encontrado
    const socio = await tx.socio.findUnique({
      where: { id: socioId },
    });
    if (!socio) {
      throw noEncontrado("Socio no encontrado");
    }

    // 2. Si el libro no existe -> 404 Libro no encontrado
    const libro = await tx.libro.findUnique({
      where: { id: libroId },
    });
    if (!libro) {
      throw noEncontrado("Libro no encontrado");
    }

    // 3. Si el socio ya tiene 3 préstamos ACTIVO -> 409
    const prestamosActivos = await tx.prestamo.count({
      where: {
        socioId,
        estado: "ACTIVO",
      },
    });
    if (prestamosActivos >= 3) {
      throw conflicto("El socio ya tiene 3 préstamos activos");
    }

    // 4. Si el libro no tiene ejemplares disponibles -> 409
    // Descuento atómico con condición dentro del update para evitar condición de carrera (concurrency-safe)
    const { count } = await tx.libro.updateMany({
      where: {
        id: libroId,
        ejemplaresDisponibles: { gt: 0 },
      },
      data: {
        ejemplaresDisponibles: { decrement: 1 },
      },
    });

    if (count === 0) {
      throw conflicto("El libro no tiene ejemplares disponibles");
    }

    // 5. Descuenta un ejemplar (hecho arriba) y crea el préstamo con fechaLimite = hoy + 14 días
    const fechaLimite = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const nuevoPrestamo = await tx.prestamo.create({
      data: {
        socioId,
        libroId,
        estado: "ACTIVO",
        fechaLimite,
      },
      include: {
        libro: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    return nuevoPrestamo;
  });
}

export async function devolverPrestamo(prestamoId) {
  return prisma.$transaction(async (tx) => {
    // Si el préstamo no existe -> 404
    const prestamo = await tx.prestamo.findUnique({
      where: { id: prestamoId },
    });

    if (!prestamo) {
      throw noEncontrado("Préstamo no encontrado");
    }

    // Si ya está DEVUELTO -> 409
    if (prestamo.estado === "DEVUELTO") {
      throw conflicto("El préstamo ya fue devuelto");
    }

    // El préstamo pasa a DEVUELTO con fechaDevolucion = ahora
    const prestamoActualizado = await tx.prestamo.update({
      where: { id: prestamoId },
      data: {
        estado: "DEVUELTO",
        fechaDevolucion: new Date(),
      },
      include: {
        libro: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    // Y el libro recupera un ejemplar disponible
    await tx.libro.update({
      where: { id: prestamo.libroId },
      data: {
        ejemplaresDisponibles: { increment: 1 },
      },
    });

    return prestamoActualizado;
  });
}

