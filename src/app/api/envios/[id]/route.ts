import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const envioId = Number(id);
  if (isNaN(envioId)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    const body = await req.json();
    const nuevoEstado = (body.estado as string).toUpperCase();
    const nota = body.nota || null;
    const ahora = new Date();

    // Obtenemos el envío actual para el historial
    const envioActual = await db.envio.findUnique({ where: { id: envioId } });
    if (!envioActual) return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 });

    // Preparamos los campos a actualizar
    const updateData: Record<string, unknown> = {
      estado: nuevoEstado,
      actualizadoEn: ahora,
    };

    // Si pasa a ENTREGADO, seteamos la fecha de entrega
    if (nuevoEstado === "ENTREGADO") {
      updateData.fechaEntrega = ahora;
    }

    // Actualizamos el envío y creamos el registro de historial en una transacción
    const [envioActualizado] = await db.$transaction([
      db.envio.update({
        where: { id: envioId },
        data: updateData,
      }),
      db.historialEstado.create({
        data: {
          envioId,
          estadoAnterior: envioActual.estado.toLowerCase(),
          estadoNuevo: nuevoEstado.toLowerCase(),
          nota,
        },
      }),
    ]);

    return NextResponse.json({
      id: envioActualizado.id,
      estado: envioActualizado.estado,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Error al actualizar el estado" }, { status: 500 });
  }
}
