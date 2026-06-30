import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 51214,
  user: "postgres",
  password: "postgres",
  database: "template1",
  ssl: false,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Crear Usuario Admin inicial
  await prisma.usuario.upsert({
    where: { email: "admin@translog.com" },
    update: {},
    create: {
      nombre: "Administrador",
      email: "admin@translog.com",
      password: "admin123",
      rol: "admin",
      activo: 1,
    },
  });

  // 2. Crear Rutas base
  const rutas = [
    { origen: "Rosario", destino: "Río Cuarto", km: 385, precioBase: 8500 },
    { origen: "Río Cuarto", destino: "Santa Rosa", km: 220, precioBase: 5200 },
    { origen: "Río Cuarto", destino: "Embalse", km: 80, precioBase: 2800 },
    { origen: "Río Cuarto", destino: "Villa María", km: 130, precioBase: 3400 },
    { origen: "Rosario", destino: "Santa Rosa", km: 580, precioBase: 11000 },
  ];

  for (const ruta of rutas) {
    await prisma.ruta.create({ data: ruta });
  }

  // 3. Crear Clientes de ejemplo
  const clientes = [
    {
      razonSocial: "Honda Córdoba S.A.",
      cuit: "30-71234567-8",
      contactoNombre: "Juan Pérez",
      telefono: "0351-422-1100",
      email: "logistica@hondacba.com",
      localidad: "Córdoba",
      provincia: "Córdoba",
    },
    {
      razonSocial: "Laboratorio Biolab",
      cuit: "30-68901234-5",
      contactoNombre: "María García",
      telefono: "0341-555-0088",
      email: "envios@biolab.com.ar",
      localidad: "Rosario",
      provincia: "Santa Fe",
    },
    {
      razonSocial: "Sport Zone S.R.L.",
      cuit: "30-55678901-2",
      contactoNombre: "Carlos López",
      telefono: "0341-444-2211",
      email: "deposito@sportzone.com",
      localidad: "Rosario",
      provincia: "Santa Fe",
    },
  ];

  for (const cliente of clientes) {
    await prisma.cliente.upsert({
      where: { cuit: cliente.cuit },
      update: {},
      create: cliente,
    });
  }

  console.log("Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
