"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ESTADOS_LABELS, ESTADOS_COLORS, ESTADOS_ICONS } from "@/lib/utils";

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
  
  // Guardamos las coordenadas para posicionar el menú fijo
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const siguientes = TRANSICIONES[estadoActual] ?? [];

  // Calcular la posición del botón al abrir el menú
  const actualizarPosicion = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // Lo posicionamos justo debajo del botón, alineado a la derecha del mismo
      setCoords({
        top: rect.bottom + window.scrollY + 8, // 8px de margen (mt-2)
        left: rect.right - 288 + window.scrollX, // 288px es el ancho del modal (w-72)
      });
    }
  };

  useEffect(() => {
    if (!abierto) return;
    
    actualizarPosicion();

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false);
        setNota("");
      }
    }
    
    // Si el usuario hace scroll, recalculamos o cerramos el menú para que no se desfase
    function handleScroll() {
      actualizarPosicion();
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("scroll", handleScroll, true); // Escucha scrolls en contenedores internos también
    
    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [abierto]);

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
  const icon = ESTADOS_ICONS[estadoActual] ?? "";

  return (
    <div className="relative inline-flex justify-end" ref={ref}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          if (puedeTransicionar) setAbierto(!abierto);
        }}
        className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${ESTADOS_COLORS[estadoActual ?? "ingresado"]} ${puedeTransicionar ? "cursor-pointer hover:brightness-125 transition-all" : "cursor-default"}`}
      >
        {icon && <span className="text-[10px]">{icon}</span>}
        {ESTADOS_LABELS[estadoActual ?? "ingresado"]}
        {puedeTransicionar && (
          <svg className="w-3 h-3 opacity-40 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {abierto && (
        // MODIFICADO: Cambiamos de 'absolute' a 'fixed' y le inyectamos las coordenadas top/left calculadas en tiempo real
        <div 
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed z-[9999] w-72 bg-slate-800 rounded-xl border border-slate-700 shadow-xl shadow-black/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Cambiar estado</p>
            <p className="text-xs text-slate-500 font-mono">{envioNumero}</p>
          </div>

          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Nota opcional (ej: entregado en portería)"
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />

          <div className="flex gap-2">
            {siguientes.map((s) => (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); cambiar(s); }}
                disabled={loading}
                className={`flex-1 px-3 py-2 text-xs rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  s === "cancelado"
                    ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                    : s === "entregado"
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                    : "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
                }`}
              >
                {loading ? "..." : `${ESTADOS_ICONS[s] ?? ""} ${ESTADOS_LABELS[s]}`}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}