// src/db.js — una única instancia de PrismaClient para toda la app
import "dotenv/config"; // carga .env en process.env
import { PrismaPg } from "@prisma/adapter-pg"; // Prisma 7 se conecta con un adaptador
import { PrismaClient } from "./generated/prisma/client.ts"; // lo crea "npx prisma generate"

if (!process.env.DATABASE_URL) {
  throw new Error(
    "Falta DATABASE_URL: copia .env.example a .env y revisa el puerto",
  );
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// log: ['query'] imprime el SQL real de cada consulta. Déjalo encendido hasta la semana 8.
export const prisma = new PrismaClient({ adapter, log: ["query"] });

