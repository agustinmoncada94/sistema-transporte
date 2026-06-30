import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-setup-key");
  const secret = (process.env["AUTH_SECRET"] || "").trim();
  if (!authHeader || !secret || authHeader.trim() !== secret) {
    return NextResponse.json({ error: "Forbidden", hint: `key_len=${authHeader?.length}, secret_len=${secret.length}` }, { status: 403 });
  }

  const connectionString =
    process.env["DATABASE_URL_UNPOOLED"] ??
    process.env["POSTGRES_URL_NON_POOLING"] ??
    process.env["DATABASE_URL"] ??
    process.env["POSTGRES_URL"];

  if (!connectionString) {
    return NextResponse.json({ error: "No database URL found" }, { status: 500 });
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    await client.query(`
      DO $$ BEGIN CREATE TYPE "EstadoEnvio" AS ENUM ('INGRESADO','EN_TRANSITO','ENTREGADO','CANCELADO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await client.query(`
      DO $$ BEGIN CREATE TYPE "TipoMercaderia" AS ENUM ('REPUESTOS','MUESTRAS_MEDICAS','CALZADO','CADENA_FRIO','GENERAL','OTRO');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "usuarios" (
        "id" SERIAL PRIMARY KEY,
        "nombre" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "rol" TEXT NOT NULL DEFAULT 'operador',
        "activo" INTEGER NOT NULL DEFAULT 1,
        "creado_en" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "clientes" (
        "id" SERIAL PRIMARY KEY,
        "razon_social" TEXT NOT NULL,
        "cuit" TEXT NOT NULL UNIQUE,
        "contacto_nombre" TEXT,
        "telefono" TEXT,
        "email" TEXT,
        "direccion" TEXT,
        "localidad" TEXT,
        "provincia" TEXT,
        "notas" TEXT,
        "activo" INTEGER NOT NULL DEFAULT 1,
        "creado_en" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "rutas" (
        "id" SERIAL PRIMARY KEY,
        "origen" TEXT NOT NULL,
        "destino" TEXT NOT NULL,
        "km" INTEGER NOT NULL,
        "precio_base" DOUBLE PRECISION NOT NULL,
        "activa" INTEGER NOT NULL DEFAULT 1
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "envios" (
        "id" SERIAL PRIMARY KEY,
        "numero" TEXT NOT NULL UNIQUE,
        "etiqueta" TEXT NOT NULL,
        "cliente_id" INTEGER REFERENCES "clientes"("id") ON DELETE SET NULL,
        "destinatario_nombre" TEXT NOT NULL,
        "destinatario_direccion" TEXT,
        "destinatario_telefono" TEXT,
        "ruta_id" INTEGER REFERENCES "rutas"("id") ON DELETE SET NULL,
        "origen" TEXT NOT NULL,
        "destino" TEXT NOT NULL,
        "tipo_mercaderia" "TipoMercaderia" NOT NULL DEFAULT 'GENERAL',
        "peso_kg" DOUBLE PRECISION,
        "bultos" INTEGER NOT NULL DEFAULT 1,
        "precio_cliente" DOUBLE PRECISION,
        "costo_estimado" DOUBLE PRECISION,
        "km_ruta" INTEGER,
        "estado" "EstadoEnvio" NOT NULL DEFAULT 'INGRESADO',
        "observaciones" TEXT,
        "fecha_ingreso" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "fecha_entrega" TIMESTAMPTZ,
        "creado_en" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "actualizado_en" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS "historial_estados" (
        "id" SERIAL PRIMARY KEY,
        "envio_id" INTEGER REFERENCES "envios"("id") ON DELETE CASCADE,
        "estado_anterior" TEXT,
        "estado_nuevo" TEXT NOT NULL,
        "nota" TEXT,
        "creado_en" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Seed: usuario admin
    await client.query(`
      INSERT INTO "usuarios" ("nombre","email","password","rol","activo")
      VALUES ('Administrador','admin@translog.com','admin123','admin',1)
      ON CONFLICT ("email") DO NOTHING;
    `);

    // Seed: rutas
    const rutas = [
      ['Rosario','Río Cuarto',385,8500],
      ['Río Cuarto','Santa Rosa',220,5200],
      ['Río Cuarto','Embalse',80,2800],
      ['Río Cuarto','Villa María',130,3400],
      ['Rosario','Santa Rosa',580,11000],
    ];
    for (const [origen, destino, km, precio] of rutas) {
      await client.query(
        `INSERT INTO "rutas" ("origen","destino","km","precio_base") VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [origen, destino, km, precio]
      );
    }

    // Seed: clientes
    const clientes = [
      ['Honda Córdoba S.A.','30-71234567-8','Juan Pérez','0351-422-1100','logistica@hondacba.com','Córdoba','Córdoba'],
      ['Laboratorio Biolab','30-68901234-5','María García','0341-555-0088','envios@biolab.com.ar','Rosario','Santa Fe'],
      ['Sport Zone S.R.L.','30-55678901-2','Carlos López','0341-444-2211','deposito@sportzone.com','Rosario','Santa Fe'],
    ];
    for (const [razon, cuit, contacto, tel, email, loc, prov] of clientes) {
      await client.query(
        `INSERT INTO "clientes" ("razon_social","cuit","contacto_nombre","telefono","email","localidad","provincia") VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT ("cuit") DO NOTHING`,
        [razon, cuit, contacto, tel, email, loc, prov]
      );
    }

    client.release();
    await pool.end();
    return NextResponse.json({ ok: true, message: "Database setup + seed complete" });
  } catch (e: any) {
    try { await pool.end(); } catch {}
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
