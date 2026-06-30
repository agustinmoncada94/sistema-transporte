import { db } from "@/lib/db";
import { formatPeso } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContablePage() {
  // 1. Totales generales calculados de forma óptima con agregaciones en Prisma
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

  // 2. Agrupamiento financiero nativo por cliente id
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

  // Traemos la lista completa de clientes activos para mapear los nombres e iniciales de forma segura en memoria
  const todosLosClientes = await db.cliente.findMany({
    select: { id: true, razonSocial: true }
  });

  const mapeoClientes = new Map(todosLosClientes.map(c => [c.id, c.razonSocial]));

  // Estructuramos la data para que coincida exactamente con la UI original
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
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Contable</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Ingresos totales</p>
          <p className="text-2xl font-semibold text-green-600">{formatPeso(ingresos)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Costos totales</p>
          <p className="text-2xl font-semibold text-red-600">{formatPeso(costos)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Margen neto</p>
          <p className={`text-2xl font-semibold ${margen >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatPeso(margen)}</p>
          {ingresos > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">{Math.round((margen / ingresos) * 100)}% de margen</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Total envíos</p>
          <p className="text-2xl font-semibold text-gray-900">{totales._count._all}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-1">Kilómetros totales</p>
          <p className="text-2xl font-semibold text-gray-900">{Number(totales._sum.kmRuta ?? 0).toLocaleString("es-AR")} km</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-900">Liquidación por cliente</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Cliente</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Envíos</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Km</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Facturado</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Costo</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Margen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {porCliente.map((c, i) => {
                const fact = Number(c.totalFacturado ?? 0);
                const costo = Number(c.totalCosto ?? 0);
                return (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.razonSocial ?? "Sin cliente"}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.totalEnvios}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{Number(c.kmTotales ?? 0).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-right text-green-700 font-medium">{formatPeso(fact)}</td>
                    <td className="px-4 py-3 text-right text-red-600">{formatPeso(costo)}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPeso(fact - costo)}</td>
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
