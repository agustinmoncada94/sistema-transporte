"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_LABELS, ESTADOS_COLORS } from "@/lib/utils";

const TRANSICIONES: Record<string, string[]> = {
  ingresado: ["en_transito", "cancelado"],
  en_transito: ["entregado", "cancelado"],
  entregado: [],
  cancelado: [],
};

interface Props {
  envioId: number;
  envioNumero: string;
  estadoActual: string;
}

export default function CambiarEstadoModal({ envioId, envioNumero, estadoActual }: Props) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [nota, setNota] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const siguientes = TRANSICIONES[estadoActual] ?? [];

  // Cerrar al hacer clic afuera
  useEffect(() => {
    if (!abierto) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setNota("");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [abierto]);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setAbierto(false); setNota(""); }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [abierto]);

  async function cambiar(nuevoEstado: string) {
    setLoading(true);
    await fetch(`/api/envios/${envioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado, nota: nota || null }),
    });
    setLoading(false);
    setNota("");
    setAbierto(false);
    router.refresh();
  }

  const puedeTransicionar = siguientes.length > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (puedeTransicionar) setAbierto(!abierto);
        }}
        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${ESTADOS_COLORS[estadoActual ?? "ingresado"]} ${puedeTransicionar ? "cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all" : "cursor-default"}`}
      >
        {ESTADOS_LABELS[estadoActual ?? "ingresado"]}
        {puedeTransicionar && (
          <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-xl border border-gray-200 shadow-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cambiar estado</p>
            <p className="text-xs text-gray-400 font-mono">{envioNumero}</p>
          </div>

          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Nota opcional (ej: entregado en portería)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            {siguientes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); cambiar(s); }}
                disabled={loading}
                className={`flex-1 px-3 py-2 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  s === "cancelado"
                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                    : s === "entregado"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "..." : ESTADOS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
