import { db } from "@/lib/db";
import { Package, Users, TrendingUp, Truck } from "lucide-react";
import { formatPeso, formatFecha, ESTADOS_LABELS, ESTADOS_COLORS } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Consultas nativas con Prisma en paralelo para mejorar rendimiento
  const [totalEnviosCount, enTransitoCount, totalClientesCount, facturadoSum] = await Promise.all([
    db.envio.count(),
    db.envio.count({ where: { estado: "INGRESADO" } }),
    db.cliente.count({ where: { activo: 1 } }),
    db.envio.aggregate({ _sum: { precioCliente: true } }),
  ]);

  // Traemos los últimos 8 envíos ordenados por fecha de creación
  const ultimosEnviosRaw = await db.envio.findMany({
    orderBy: { creadoEn: "desc" },
    take: 8,
  });

  // Adaptamos el formato a minúsculas solo para que coincida con las claves del objeto ESTADOS_COLORS de utils.ts
  const ultimosEnvios = ultimosEnviosRaw.map(e => ({
    ...e,
    estado: e.estado.toLowerCase()
  }));

  const stats = [
    { label: "Total envíos", value: totalEnviosCount, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "En tránsito", value: enTransitoCount, icon: Truck, color: "bg-amber-50 text-amber-600" },
    { label: "Clientes activos", value: totalClientesCount, icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Facturado total", value: formatPeso(Number(facturadoSum._sum.precioCliente ?? 0)), icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general del sistema</p>
        </div>
        <Link
          href="/envios/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo envío
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Últimos envíos</h2>
          <Link href="/envios" className="text-xs text-blue-600 hover:underline">Ver todos</Link>
        </div>
        <div className="divide-y divide-gray-100">
          {ultimosEnvios.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              No hay envíos registrados aún.
              <Link href="/envios/nuevo" className="block mt-2 text-blue-600 hover:underline">
                Registrar el primero
              </Link>
            </div>
          ) : (
            ultimosEnvios.map((e) => (
              <Link key={e.id} href={`/envios/${e.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{e.numero}</p>
                  <p className="text-xs text-gray-500 truncate">{e.origen} → {e.destino} · {e.destinatarioNombre}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ESTADOS_COLORS[e.estado ?? "ingresado"]}`}>
                    {ESTADOS_LABELS[e.estado ?? "ingresado"]}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">{formatFecha(e.fechaIngreso)}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
