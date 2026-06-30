import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Prisma } from "@/generated/prisma/client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();

    const actualizado = await db.cliente.update({
      where: { id: clienteId },
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
      },
    });

    return NextResponse.json({ id: actualizado.id });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un cliente con ese CUIT." }, { status: 400 });
    }
    return NextResponse.json({ error: "Error al actualizar el cliente." }, { status: 500 });
  }
}
