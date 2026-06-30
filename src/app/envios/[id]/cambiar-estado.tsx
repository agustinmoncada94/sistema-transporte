"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_LABELS } from "@/lib/utils";

const TRANSICIONES: Record<string, string[]> = {
  ingresado: ["en_transito", "cancelado"],
  en_transito: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

export default function CambiarEstado({ envioId, estadoActual }: { envioId: number; estadoActual: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState("");

  const siguientes = TRANSICIONES[estadoActual] ?? [];
  if (siguientes.length === 0) return null;

  async function cambiar(nuevoEstado: string) {
    setLoading(true);
    await fetch(`/api/envios/${envioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, nota: nota || null }),
    });
    setLoading(false);
    setNota("");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cambiar estado</h2>
      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota opcional (ej: entregado en portería)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex gap-2">
        {siguientes.map((s) => (
          <button
            key={s}
            onClick={() => cambiar(s)}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
              s === "cancelado"
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : s === "entregado"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "..." : `Marcar como ${ESTADOS_LABELS[s]}`}
          </button>
        ))}
      </div>
    </div>
  );
}
