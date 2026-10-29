// prisma/seed.js — datos de arranque de Biblioteca
import { prisma } from "../src/db.js";

async function main() {
  const socios = [
    { id: 1, nombre: "Laura Gómez", email: "laura@ucaldas.edu.co" },
    { id: 2, nombre: "Andrés Ríos", email: "andres@ucaldas.edu.co" },
    { id: 3, nombre: "Sofía Marín", email: "sofia@ucaldas.edu.co" },
  ];

  for (const socio of socios) {
    await prisma.socio.upsert({
      where: { id: socio.id },
      update: socio,
      create: socio,
    });
  }

  const libros = [
    {
      id: 1,
      titulo: "Cien años de soledad",
      autor: "Gabriel García Márquez",
      isbn: "ISBN-001",
      ejemplaresTotales: 3,
      ejemplaresDisponibles: 3,
    },
    {
      id: 2,
      titulo: "El amor en los tiempos del cólera",
      autor: "Gabriel García Márquez",
      isbn: "ISBN-002",
      ejemplaresTotales: 2,
      ejemplaresDisponibles: 1,
    },
    {
      id: 3,
      titulo: "Clean Code",
      autor: "Robert C. Martin",
      isbn: "ISBN-003",
      ejemplaresTotales: 1,
      ejemplaresDisponibles: 0,
    },
    {
      id: 4,
      titulo: "Node.js Design Patterns",
      autor: "Mario Casciaro",
      isbn: "ISBN-004",
      ejemplaresTotales: 2,
      ejemplaresDisponibles: 1,
    },
    {
      id: 5,
      titulo: "La vorágine",
      autor: "José Eustasio Rivera",
      isbn: "ISBN-005",
      ejemplaresTotales: 1,
      ejemplaresDisponibles: 1,
    },
  ];

  for (const libro of libros) {
    await prisma.libro.upsert({
      where: { id: libro.id },
      update: libro,
      create: libro,
    });
  }

  const fechaLimite = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const prestamos = [
    {
      id: 1,
      socioId: 3,
      libroId: 2,
      estado: "ACTIVO",
      fechaLimite,
    },
    {
      id: 2,
      socioId: 3,
      libroId: 3,
      estado: "ACTIVO",
      fechaLimite,
    },
    {
      id: 3,
      socioId: 3,
      libroId: 4,
      estado: "ACTIVO",
      fechaLimite,
    },
  ];

  for (const prestamo of prestamos) {
    await prisma.prestamo.upsert({
      where: { id: prestamo.id },
      update: prestamo,
      create: prestamo,
    });
  }

  // Sincronizar secuencias para autoincrementables
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Socio"', 'id'), coalesce(max(id), 1)) FROM "Socio";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Libro"', 'id'), coalesce(max(id), 1)) FROM "Libro";`
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Prestamo"', 'id'), coalesce(max(id), 1)) FROM "Prestamo";`
  );

  console.log("Seed completado: 3 socios, 5 libros y 3 préstamos");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

