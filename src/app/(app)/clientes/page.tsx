import { db } from "@/lib/db";
import Link from "next/link";
import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  // Migración limpia a Prisma seleccionando los mismos campos específicos
  const lista = await db.cliente.findMany({
    where: { activo: 1 },
    orderBy: { razonSocial: "asc" },
    select: {
      id: true,
      razonSocial: true,
      cuit: true,
      contactoNombre: true,
      telefono: true,
      email: true,
      localidad: true,
      provincia: true,
    }
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Clientes</h1>
        <Link href="/clientes/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nuevo cliente
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No hay clientes registrados.</p>
          <Link href="/clientes/nuevo" className="text-sm text-blue-600 hover:underline mt-1 inline-block">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {lista.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 font-medium text-sm flex-shrink-0">
                {c.razonSocial.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{c.razonSocial}</p>
                <p className="text-xs text-gray-500">CUIT: {c.cuit} · {c.localidad}, {c.provincia}</p>
              </div>
              <div className="text-right text-xs text-gray-400 hidden sm:block">
                {c.telefono && <p>{c.telefono}</p>}
                {c.email && <p>{c.email}</p>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
