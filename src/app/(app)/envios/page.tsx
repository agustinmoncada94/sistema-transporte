import { db } from "@/lib/db";
import { formatPeso, formatFecha, ESTADOS_LABELS, ESTADOS_COLORS, ESTADOS_ICONS } from "@/lib/utils";
import Link from "next/link";
import { Package, ArrowLeft } from "lucide-react";
import CambiarEstadoModal from "./cambiar-estado-modal";

export const dynamic = "force-dynamic";

type EstadoEnvio = "INGRESADO" | "EN_TRANSITO" | "ENTREGADO" | "CANCELADO";

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-yellow-500",
  "bg-rose-500",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-white">Envíos</h1>
        </div>
        <Link
          href="/envios/nuevo"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-orange-500/20"
        >
          + Nuevo envío
        </Link>
      </div>

      {/* Barra de búsqueda */}
      <form method="GET" className="flex items-center gap-3">
        <input
          name="q"
          defaultValue={queryText}
          placeholder="Buscar por número, etiqueta, destinatario..."
          className="flex-1 px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
        />
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Estados</span>
        <select
          name="estado"
          defaultValue={estadoParam}
          className="px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        >
          <option value="todos">Todos los estados</option>
          <option value="ingresado">Pendiente</option>
          <option value="en_transito">En tránsito</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="submit" className="px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors">
          Buscar
        </button>
      </form>

      {/* Tabla */}
      <div className="bg-slate-800/60 rounded-xl border border-slate-700/80 overflow-hidden">
        {lista.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-400">No hay envíos que coincidan.</p>
            <Link href="/envios/nuevo" className="text-sm text-orange-400 hover:underline mt-2 inline-block">
              Registrar nuevo envío
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-t-2 border-t-orange-500 border-b border-b-slate-700/80 bg-slate-800/90">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Número</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Etiqueta</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Cliente</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Ruta</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Destinatario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Tipo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Precio</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Fecha</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-orange-400/80 uppercase tracking-wider">Estado</th>
                  </tr>
                </thead>
                <tbody>
  {lista.map((e, idx) => (
    <tr
      key={e.id}
      className={`border-b border-slate-700/40 hover:bg-slate-700/20 transition-colors ${
        idx % 2 === 0 ? "bg-slate-800/30" : "bg-slate-800/10"
      }`}
    >
      <td className="px-4 py-3">
        <Link href={`/envios/${e.id}`} className="font-mono text-slate-200 hover:text-orange-400 text-xs transition-colors">
          {e.numero}
        </Link>
      </td>
      <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.etiqueta}</td>
      <td className="px-4 py-3">
        {e.cliente ? (
          <Link href={`/clientes/${e.cliente.id}`} className="flex items-center gap-2 group">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getAvatarColor(e.cliente.razonSocial)}`}></span>
            <span className="text-slate-200 group-hover:text-orange-400 transition-colors truncate max-w-36">
              {e.cliente.razonSocial}
            </span>
          </Link>
        ) : (
          <span className="text-slate-600">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-slate-300">{e.origen} → {e.destino}</td>
      <td className="px-4 py-3 text-slate-300 max-w-32 truncate">{e.destinatarioNombre}</td>
      <td className="px-4 py-3 text-slate-400 text-xs capitalize">{e.tipoMercaderia?.toLowerCase().replace("_", " ")}</td>
      <td className="px-4 py-3 text-right text-slate-200 font-medium">{e.precioCliente ? formatPeso(Number(e.precioCliente)) : "-"}</td>
      <td className="px-4 py-3 text-slate-400 text-xs">{formatFecha(e.fechaIngreso)}</td>
      
      {/* MODIFICADO: Agregamos clases para permitir que el modal/dropdown flote por encima sin cortarse */}
      <td className="px-4 py-3 text-right relative overflow-visible">
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
            <div className="py-3 text-center border-t border-slate-700/40">
              <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">
                Cargar más...
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
