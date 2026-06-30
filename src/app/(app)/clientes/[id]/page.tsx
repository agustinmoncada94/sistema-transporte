import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { formatPeso, formatFecha, ESTADOS_LABELS, ESTADOS_COLORS } from "@/lib/utils";
import EditarCliente from "./editar-cliente";

export const dynamic = "force-dynamic";

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clienteId = Number(id);
  if (isNaN(clienteId)) notFound();

  const cliente = await db.cliente.findUnique({
    where: { id: clienteId },
  });

  if (!cliente) notFound();

  const enviosRaw = await db.envio.findMany({
    where: { clienteId: cliente.id },
    orderBy: { creadoEn: "desc" },
  });

  const envios = enviosRaw.map((e) => ({
    ...e,
    estado: e.estado.toLowerCase(),
  }));

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="text-gray-400 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-medium text-sm flex-shrink-0">
              {cliente.razonSocial.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{cliente.razonSocial}</h1>
              <p className="text-sm text-gray-500">CUIT: {cliente.cuit}</p>
            </div>
          </div>
        </div>
        <EditarCliente cliente={cliente} />
      </div>

      {/* Datos del cliente */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-medium text-gray-900 mb-3">Información del cliente</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {cliente.contactoNombre && (
            <div>
              <p className="text-xs text-gray-500">Contacto</p>
              <p className="text-gray-900">{cliente.contactoNombre}</p>
            </div>
          )}
          {cliente.telefono && (
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="text-gray-900">{cliente.telefono}</p>
            </div>
          )}
          {cliente.email && (
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-gray-900">{cliente.email}</p>
            </div>
          )}
          {(cliente.localidad || cliente.provincia) && (
            <div>
              <p className="text-xs text-gray-500">Ubicación</p>
              <p className="text-gray-900">
                {[cliente.direccion, cliente.localidad, cliente.provincia].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Envíos del cliente */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">
            Envíos ({envios.length})
          </h2>
          <Link
            href="/envios/nuevo"
            className="text-xs text-blue-600 hover:underline"
          >
            + Nuevo envío
          </Link>
        </div>
        <div className="divide-y divide-gray-100">
          {envios.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Este cliente no tiene envíos registrados.
              </p>
            </div>
          ) : (
            envios.map((e) => (
              <Link
                key={e.id}
                href={`/envios/${e.id}`}
                className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {e.numero}{" "}
                    <span className="font-normal text-gray-400">· {e.etiqueta}</span>
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {e.origen} → {e.destino} · {e.destinatarioNombre}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ESTADOS_COLORS[e.estado ?? "ingresado"]}`}
                  >
                    {ESTADOS_LABELS[e.estado ?? "ingresado"]}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatFecha(e.fechaIngreso)}
                  </p>
                  {e.precioCliente && (
                    <p className="text-xs text-gray-600 font-medium">
                      {formatPeso(Number(e.precioCliente))}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
