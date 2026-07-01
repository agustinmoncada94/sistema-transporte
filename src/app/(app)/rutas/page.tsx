import { db } from "@/lib/db";
import { Map, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function RutasPage() {
  const lista = await db.ruta.findMany({
    where: { activa: 1 },
    orderBy: { origen: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-white">Rutas</h1>
      </div>

      {lista.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 py-12 text-center">
          <Map className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay rutas registradas.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/80">
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Origen</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-slate-400">Destino</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Kilómetros</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-slate-400">Precio base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {lista.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{r.origen}</td>
                    <td className="px-4 py-3 text-slate-300">{r.destino}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{r.km.toLocaleString("es-AR")} km</td>
                    <td className="px-4 py-3 text-right text-cyan-400 font-medium">
                      {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0 }).format(r.precioBase)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
