import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generarNumeroEnvio } from "@/lib/utils";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();

    let kmRuta: number | null = null;
    if (body.rutaId) {
      const ruta = await db.ruta.findUnique({
        where: { id: Number(body.rutaId) }
      });
      if (ruta) kmRuta = ruta.km;
    }

    // Insertamos el registro nativamente con Prisma
    const nuevo = await db.envio.create({
      data: {
        numero: generarNumeroEnvio(),
        etiqueta: body.etiqueta,
        clienteId: body.clienteId ? Number(body.clienteId) : null,
        destinatarioNombre: body.destinatarioNombre,
        destinatarioDireccion: body.destinatarioDireccion || null,
        destinatarioTelefono: body.destinatarioTelefono || null,
        rutaId: body.rutaId ? Number(body.rutaId) : null,
        origen: body.origen,
        destino: body.destino,
        tipoMercaderia: (body.tipoMercaderia || "general").toUpperCase(),
        pesoKg: body.pesoKg ? Number(body.pesoKg) : null,
        bultos: body.bultos ? Number(body.bultos) : 1,
        precioCliente: body.precioCliente ? Number(body.precioCliente) : null,
        costoEstimado: body.costoEstimado ? Number(body.costoEstimado) : null,
        kmRuta,
        observaciones: body.observaciones || null,
        estado: "INGRESADO",
        fechaIngreso: body.fechaIngreso ? new Date(body.fechaIngreso) : new Date(),
      }
    });

    return NextResponse.json({ id: nuevo.id, numero: nuevo.numero });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al crear el envío" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const lista = await db.envio.findMany({
    orderBy: { creadoEn: "asc" }
  });

  return NextResponse.json(lista);
}
