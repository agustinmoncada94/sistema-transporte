import { db } from "@/lib/db";
import { formatPeso, formatFecha, ESTADOS_LABELS, ESTADOS_COLORS } from "@/lib/utils";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import CambiarEstadoModal from "./cambiar-estado-modal";

export const dynamic = "force-dynamic";

type EstadoEnvio = "INGRESADO" | "EN_TRANSITO" | "ENTREGADO" | "CANCELADO";

export default async function EnviosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const resolvedParams = await searchParams;
  const queryText = resolvedParams.q || "";
  const estadoParam = resolvedParams.estado || "todos";

  const whereClause: any = {};

  if (estadoParam !== "todos") {
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

  const listaRaw = await db.envio.findMany({
    where: whereClause,
    orderBy: { creadoEn: "desc" },
    take: 100,
    include: { cliente: { select: { id: true, razonSocial: true } } },
  });

  const lista = listaRaw.map(e => ({
    ...e,
    estado: e.estado.toLowerCase()
  }));

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white">Envíos</h1>
        </div>
        <Link
          href="/envios/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo envío
        </Link>
      </div>

      <form method="GET" className="flex gap-3">
        <input
          name="q"
          defaultValue={queryText}
          placeholder="Buscar por número, etiqueta, destinatario..."
          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select
          name="estado"
          defaultValue={estadoParam}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="ingresado">Ingresado</option>
          <option value="en_transito">En tránsito</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors">
          Buscar
        </button>
      </form>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {lista.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay envíos que coincidan.</p>
            <Link href="/envios/nuevo" className="text-sm text-orange-400 hover:underline mt-1 inline-block">
              Registrar nuevo envío
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Número</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Etiqueta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Ruta</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Destinatario</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Tipo</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Precio</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {lista.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/envios/${e.id}`} className="font-mono text-orange-400 hover:underline text-xs">
                        {e.numero}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">{e.etiqueta}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-40 truncate">
                      {e.cliente ? (
                        <Link href={`/clientes/${e.cliente.id}`} className="text-orange-400 hover:underline">
                          {e.cliente.razonSocial}
                        </Link>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{e.origen} → {e.destino}</td>
                    <td className="px-4 py-3 text-slate-300 max-w-32 truncate">{e.destinatarioNombre}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{e.tipoMercaderia?.toLowerCase().replace("_", " ")}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{e.precioCliente ? formatPeso(Number(e.precioCliente)) : "-"}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{formatFecha(e.fechaIngreso)}</td>
                    <td className="px-4 py-3">
                      <CambiarEstadoModal
                        envioId={e.id}
                        envioNumero={e.numero}
                        estadoActual={e.estado ?? "ingresado"}
                      />
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
