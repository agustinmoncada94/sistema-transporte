import { db } from "@/lib/db";
import { formatPeso } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContablePage() {
  const totales = await db.envio.aggregate({
    _sum: {
      precioCliente: true,
      costoEstimado: true,
      kmRuta: true,
    },
    _count: {
      _all: true,
    },
  });

  const agrupadoPorCliente = await db.envio.groupBy({
    by: ["clienteId"],
    _count: {
      _all: true,
    },
    _sum: {
      precioCliente: true,
      costoEstimado: true,
      kmRuta: true,
    },
  });

  const todosLosClientes = await db.cliente.findMany({
    select: { id: true, razonSocial: true }
  });

  const mapeoClientes = new Map(todosLosClientes.map(c => [c.id, c.razonSocial]));

  const porCliente = agrupadoPorCliente.map(item => ({
    clienteId: item.clienteId,
    razonSocial: item.clienteId ? mapeoClientes.get(item.clienteId) : "Sin cliente",
    totalEnvios: item._count._all,
    totalFacturado: item._sum.precioCliente ?? 0,
    totalCosto: item._sum.costoEstimado ?? 0,
    kmTotales: item._sum.kmRuta ?? 0,
  })).sort((a, b) => b.totalFacturado - a.totalFacturado);

  const ingresos = Number(totales._sum.precioCliente ?? 0);
  const costos = Number(totales._sum.costoEstimado ?? 0);
  const margen = ingresos - costos;

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-white">Contable</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Ingresos totales</p>
          <p className="text-2xl font-semibold text-emerald-400">{formatPeso(ingresos)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Costos totales</p>
          <p className="text-2xl font-semibold text-red-400">{formatPeso(costos)}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Margen neto</p>
          <p className={`text-2xl font-semibold ${margen >= 0 ? "text-sky-400" : "text-red-400"}`}>{formatPeso(margen)}</p>
          {ingresos > 0 && (
            <p className="text-xs text-slate-500 mt-0.5">{Math.round((margen / ingresos) * 100)}% de margen</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Total envíos</p>
          <p className="text-2xl font-semibold text-white">{totales._count._all}</p>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
          <p className="text-xs text-slate-400 mb-1">Kilómetros totales</p>
          <p className="text-2xl font-semibold text-white">{Number(totales._sum.kmRuta ?? 0).toLocaleString("es-AR")} km</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-700">
          <h2 className="text-sm font-medium text-white">Liquidación por cliente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Cliente</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Envíos</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Km</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Facturado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Costo</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {porCliente.map((c, i) => {
                const fact = Number(c.totalFacturado ?? 0);
                const costo = Number(c.totalCosto ?? 0);
                return (
                  <tr key={i} className="hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-white">{c.razonSocial ?? "Sin cliente"}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{c.totalEnvios}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{Number(c.kmTotales ?? 0).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-medium">{formatPeso(fact)}</td>
                    <td className="px-4 py-3 text-right text-red-400">{formatPeso(costo)}</td>
                    <td className="px-4 py-3 text-right font-medium text-white">{formatPeso(fact - costo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
