import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const body = await req.json();

    // Inserción limpia utilizando Prisma Client
    const nuevo = await db.cliente.create({
      data: {
        razonSocial: body.razonSocial,
        cuit: body.cuit,
        contactoNombre: body.contactoNombre || null,
        telefono: body.telefono || null,
        email: body.email || null,
        direccion: body.direccion || null,
        localidad: body.localidad || null,
        provincia: body.provincia || null,
        notas: body.notas || null,
        activo: 1,
      },
    });

    return NextResponse.json({ id: nuevo.id });
  } catch (e: any) {
    // Manejo de restricciones únicas específico y seguro con Prisma
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un cliente con ese CUIT." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al crear el cliente." }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Consulta general ordenada alfabéticamente con Prisma
  const lista = await db.cliente.findMany({
    orderBy: {
      razonSocial: "asc",
    },
  });

  return NextResponse.json(lista);
}
