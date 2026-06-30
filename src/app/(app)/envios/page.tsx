import { db } from "@/lib/db";
import { formatPeso, formatFecha, ESTADOS_LABELS, ESTADOS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

// Definimos explícitamente el tipo de la enumeración esperada para mapear con Prisma
type EstadoEnvio = "INGRESADO" | "EN_TRANSITO" | "ENTREGADO" | "CANCELADO";

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const resolvedParams = await searchParams;
  const queryText = resolvedParams.q || "";
  const estadoParam = resolvedParams.estado || "todos";

  // Construimos el objeto de filtros dinámicos para Prisma
  const whereClause: any = {};

  if (estadoParam !== "todos") {
    // Los Enums de Prisma están definidos en MAYÚSCULAS
    whereClause.estado = estadoParam.toUpperCase() as EstadoEnvio;
  }

  if (queryText) {
    whereClause.OR = [
      { numero: { contains: queryText, mode: "insensitive" } },
      { etiqueta: { contains: queryText, mode: "insensitive" } },
      { destinatarioNombre: { contains: queryText, mode: "insensitive" } },
      { destino: { contains: queryText, mode: "insensitive" } },
    ];
  }

  // Ejecutamos la consulta con Prisma aplicando filtros, orden y límite
  const listaRaw = await db.envio.findMany({
    where: whereClause,
    orderBy: { creadoEn: "desc" },
    take: 100,
    include: { cliente: { select: { id: true, razonSocial: true } } },
  });

  // Adaptamos el formato a minúsculas solo para que coincida con las claves del objeto ESTADOS_COLORS de utils.ts
  const lista = listaRaw.map(e => ({
    ...e,
    estado: e.estado.toLowerCase()
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Envíos</h1>
        <Link
          href="/envios/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo envío
        </Link>
      </div>

      <form method="GET" className="flex gap-3">
        <input
          name="q"
          defaultValue={queryText}
          placeholder="Buscar por número, etiqueta, destinatario..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="estado"
          defaultValue={estadoParam}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="ingresado">Ingresado</option>
          <option value="en_transito">En tránsito</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
          Buscar
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {lista.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No hay envíos que coincidan.</p>
            <Link href="/envios/nuevo" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              Registrar nuevo envío
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Número</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Etiqueta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Ruta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Destinatario</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/envios/${e.id}`} className="font-mono text-blue-600 hover:underline text-xs">
                        {e.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{e.etiqueta}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-40 truncate">
                      {e.cliente ? (
                        <Link href={`/clientes/${e.cliente.id}`} className="text-blue-600 hover:underline">
                          {e.cliente.razonSocial}
                        </Link>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{e.origen} → {e.destino}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-32 truncate">{e.destinatarioNombre}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{e.tipoMercaderia?.toLowerCase().replace("_", " ")}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{e.precioCliente ? formatPeso(Number(e.precioCliente)) : "-"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatFecha(e.fechaIngreso)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ESTADOS_COLORS[e.estado ?? "ingresado"]}`}>
                        {ESTADOS_LABELS[e.estado ?? "ingresado"]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
