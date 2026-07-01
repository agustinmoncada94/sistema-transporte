import { db } from "@/lib/db";
import Link from "next/link";
import { Users, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
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
    <div className="min-h-screen bg-slate-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-semibold text-white">Clientes</h1>
        </div>
        <Link href="/clientes/nuevo"
          className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          + Nuevo cliente
        </Link>
      </div>

      {lista.length === 0 ? (
        <div className="bg-slate-800 rounded-xl border border-slate-700 py-12 text-center">
          <Users className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No hay clientes registrados.</p>
          <Link href="/clientes/nuevo" className="text-sm text-emerald-400 hover:underline mt-1 inline-block">
            Agregar el primero
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {lista.map((c) => (
            <Link key={c.id} href={`/clientes/${c.id}`} className="bg-slate-800 rounded-xl border border-slate-700 p-4 flex items-center gap-4 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-medium text-sm flex-shrink-0">
                {c.razonSocial.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{c.razonSocial}</p>
                <p className="text-xs text-slate-400">CUIT: {c.cuit} · {c.localidad}, {c.provincia}</p>
              </div>
              <div className="text-right text-xs text-slate-500 hidden sm:block">
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
