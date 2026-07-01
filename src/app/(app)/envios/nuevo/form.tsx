"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Cliente, Ruta } from "@/generated/prisma/client";

interface Props {
  clientes: Cliente[];
  rutas: Ruta[];
}

export default function NuevoEnvioForm({ clientes, rutas }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rutaSeleccionada, setRutaSeleccionada] = useState<Ruta | null>(null);

  function handleRutaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const ruta = rutas.find((r) => String(r.id) === e.target.value);
    setRutaSeleccionada(ruta ?? null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries());

    const res = await fetch("/api/envios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Error al guardar el envío.");
      return;
    }

    const { id } = await res.json();
    router.push(`/envios/${id}`);
  }

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500";
  const labelClass = "block text-xs font-medium text-slate-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 rounded-xl border border-slate-700 p-6">
      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Identificación</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Número de etiqueta *</label>
            <input name="etiqueta" required placeholder="Ej: ETQ-2024-001" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Fecha de ingreso</label>
            <input name="fechaIngreso" type="date" defaultValue={new Date().toISOString().split("T")[0]} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Cliente y destinatario</h2>
        <div>
          <label className={labelClass}>Cliente remitente</label>
          <select name="clienteId" className={inputClass}>
            <option value="">— Sin cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.razonSocial}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Nombre destinatario *</label>
            <input name="destinatarioNombre" required placeholder="Nombre o razón social" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Teléfono destinatario</label>
            <input name="destinatarioTelefono" placeholder="Ej: 358-4123456" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Dirección destinatario</label>
          <input name="destinatarioDireccion" placeholder="Calle, número, localidad" className={inputClass} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Ruta</h2>
        <div>
          <label className={labelClass}>Ruta predefinida</label>
          <select name="rutaId" onChange={handleRutaChange} className={inputClass}>
            <option value="">— Seleccionar ruta —</option>
            {rutas.map((r) => (
              <option key={r.id} value={r.id}>{r.origen} → {r.destino} ({r.km} km)</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Origen *</label>
            <input name="origen" required defaultValue={rutaSeleccionada?.origen ?? ""}
              key={`origen-${rutaSeleccionada?.id}`}
              placeholder="Ciudad de origen" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Destino *</label>
            <input name="destino" required defaultValue={rutaSeleccionada?.destino ?? ""}
              key={`destino-${rutaSeleccionada?.id}`}
              placeholder="Ciudad de destino" className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Mercadería</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Tipo</label>
            <select name="tipoMercaderia" className={inputClass}>
              <option value="general">Carga general</option>
              <option value="repuestos">Repuestos Honda</option>
              <option value="muestras_medicas">Muestras médicas</option>
              <option value="calzado">Calzado</option>
              <option value="cadena_frio">Cadena de frío</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Peso (kg)</label>
            <input name="pesoKg" type="number" step="0.1" min="0" placeholder="0.0" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Bultos</label>
            <input name="bultos" type="number" min="1" defaultValue="1" className={inputClass} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Valores</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Precio cobrado al cliente ($)</label>
            <input name="precioCliente" type="number" step="0.01" min="0"
              defaultValue={rutaSeleccionada ? String(rutaSeleccionada.precioBase) : ""}
              key={`precio-${rutaSeleccionada?.id}`}
              placeholder="0.00" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Costo estimado ($)</label>
            <input name="costoEstimado" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Observaciones</label>
          <textarea name="observaciones" rows={2} placeholder="Frágil, urgente, instrucciones especiales..."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none" />
        </div>
      </section>

      {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={loading}
          className="px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
          {loading ? "Guardando..." : "Registrar envío"}
        </button>
      </div>
    </form>
  );
}
