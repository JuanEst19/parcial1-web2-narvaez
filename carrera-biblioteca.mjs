// carrera-biblioteca.mjs — Prueba de resistencia a condiciones de carrera
// 10 clientes intentan prestar EL MISMO libro con 1 solo ejemplar disponible AL MISMO TIEMPO.
// Uso: node carrera-biblioteca.mjs [idLibro] [puerto] (por defecto: libro 5 en puerto 4000)

const idLibro = Number(process.argv[2] ?? 5);
const puerto = process.argv[3] ?? 4000;
const URL_API = `http://localhost:${puerto}/api`;
const jsonHeaders = { "Content-Type": "application/json" };

// 1. Verificar el libro antes de la prueba
const resLibroAntes = await fetch(`${URL_API}/libros/${idLibro}`);
const libroAntes = await resLibroAntes.json();

if (!resLibroAntes.ok) {
  throw new Error(`El libro ${idLibro} no existe. Corre npx prisma db seed primero.`);
}

console.log(`\n📚 Probando condición de carrera en «${libroAntes.titulo}» (ID ${idLibro})`);
console.log(`   Ejemplares disponibles iniciales: ${libroAntes.ejemplaresDisponibles}`);

// 2. Disparar 10 peticiones simultáneas alternando entre socios 1 y 2
const peticiones = Array.from({ length: 10 }, (_, i) => {
  const socioId = (i % 2) + 1; // alterna entre socio 1 y socio 2
  return fetch(`${URL_API}/prestamos`, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ socioId, libroId: idLibro }),
  }).then(async (r) => r.status);
});

const codigos = await Promise.all(peticiones);

// 3. Verificar estado final
const resLibroDespues = await fetch(`${URL_API}/libros/${idLibro}`);
const libroDespues = await resLibroDespues.json();

const aceptadas = codigos.filter((c) => c === 201).length;
const rechazadas = codigos.filter((c) => c === 409).length;

console.log("\n📊 Resultado de la carrera:");
console.log(`   Aceptadas (201): ${aceptadas}  ·  Rechazadas (409): ${rechazadas}`);
console.log(`   Ejemplares disponibles finales: ${libroDespues.ejemplaresDisponibles}`);

if (aceptadas === 1 && rechazadas === 9 && libroDespues.ejemplaresDisponibles === 0) {
  console.log("\n✅ ÉXITO: 1 aceptado · 9 rechazados · 0 disponibles (la base no dejó prestar de más).");
} else if (libroDespues.ejemplaresDisponibles < 0) {
  console.log("\n💥 FALLO: Los ejemplares disponibles quedaron en negativo.");
} else {
  console.log(`\n⚠️ Se aceptaron ${aceptadas} préstamos.`);
}
