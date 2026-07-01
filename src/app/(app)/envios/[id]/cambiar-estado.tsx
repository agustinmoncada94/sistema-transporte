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
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-4 space-y-3">
      <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wide">Cambiar estado</h2>
      <input
        value={nota}
        onChange={(e) => setNota(e.target.value)}
        placeholder="Nota opcional (ej: entregado en portería)"
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex gap-2">
        {siguientes.map((s) => (
          <button
            key={s}
            onClick={() => cambiar(s)}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 ${
              s === "cancelado"
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                : s === "entregado"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-orange-500 text-white hover:bg-orange-600"
            }`}
          >
            {loading ? "..." : `Marcar como ${ESTADOS_LABELS[s]}`}
          </button>
        ))}
      </div>
    </div>
  );
}
