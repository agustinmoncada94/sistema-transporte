import { db } from "@/lib/db";
import NuevoEnvioForm from "./form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NuevoEnvioPage() {
  const listaClientes = await db.cliente.findMany({
    where: { activo: 1 },
    orderBy: { razonSocial: "asc" },
  });

  const listaRutas = await db.ruta.findMany({
    where: { activa: 1 },
    orderBy: { origen: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/envios" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-white">Nuevo envío</h1>
          <p className="text-sm text-slate-400 mt-0.5">Registrá el ingreso de un nuevo paquete al sistema</p>
        </div>
      </div>
      <NuevoEnvioForm clientes={listaClientes} rutas={listaRutas} />
    </div>
  );
}
