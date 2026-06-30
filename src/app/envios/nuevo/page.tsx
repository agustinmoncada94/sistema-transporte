import { db } from "@/lib/db";
import NuevoEnvioForm from "./form";

export const dynamic = "force-dynamic";

export default async function NuevoEnvioPage() {
  // Consultas con Prisma ordenadas por razón social y origen respectivamente
  const listaClientes = await db.cliente.findMany({
    where: { activo: 1 },
    orderBy: { razonSocial: "asc" },
  });

  const listaRutas = await db.ruta.findMany({
    where: { activa: 1 },
    orderBy: { origen: "asc" },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Nuevo envío</h1>
        <p className="text-sm text-gray-500 mt-0.5">Registrá el ingreso de un nuevo paquete al sistema</p>
      </div>
      <NuevoEnvioForm clientes={listaClientes} rutas={listaRutas} />
    </div>
  );
}
