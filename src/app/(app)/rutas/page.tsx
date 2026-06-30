import { db } from "@/lib/db";
import { Map } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RutasPage() {
  const lista = await db.ruta.findMany({
    where: { activa: 1 },
    orderBy: { origen: "asc" },
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Rutas</h1>
      </div>

      {lista.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <Map className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay rutas registradas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Origen</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Destino</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Kilómetros</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Precio base</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lista.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.origen}</td>
                    <td className="px-4 py-3 text-gray-700">{r.destino}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.km.toLocaleString("es-AR")} km</td>
                    <td className="px-4 py-3 text-right text-gray-700 font-medium">
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
