// src/server.js — solo arranca
import app from "./app.js";

const PUERTO = process.env.PORT ?? 4000;
app.listen(PUERTO, () => {
  console.log(`Biblioteca API en http://localhost:${PUERTO}`);
});

