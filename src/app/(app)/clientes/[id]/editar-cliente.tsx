"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";

interface ClienteData {
  id: number;
  razonSocial: string;
  cuit: string;
  contactoNombre: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  localidad: string | null;
  provincia: string | null;
  notas: string | null;
}

export default function EditarCliente({ cliente }: { cliente: ClienteData }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    const res = await fetch(`/api/clientes/${cliente.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Error al guardar.");
      return;
    }

    setEditando(false);
    router.refresh();
  }

  if (!editando) {
    return (
      <button
        onClick={() => setEditando(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-slate-600 rounded-lg hover:bg-slate-700 transition-colors text-slate-300"
      >
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </button>
    );
  }

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500";

  const field = (
    name: string,
    label: string,
    defaultValue: string | null | undefined,
    opts?: { required?: boolean; placeholder?: string; type?: string }
  ) => (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">
        {label}
        {opts?.required ? " *" : ""}
      </label>
      <input
        name={name}
        type={opts?.type ?? "text"}
        required={opts?.required}
        placeholder={opts?.placeholder}
        defaultValue={defaultValue ?? ""}
        className={inputClass}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-white">Editar cliente</h2>
        <button
          type="button"
          onClick={() => { setEditando(false); setError(""); }}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Datos fiscales</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("razonSocial", "Razón social", cliente.razonSocial, { required: true, placeholder: "Nombre o empresa" })}
          {field("cuit", "CUIT", cliente.cuit, { required: true, placeholder: "30-12345678-9" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("contactoNombre", "Nombre de contacto", cliente.contactoNombre, { placeholder: "Juan Pérez" })}
          {field("telefono", "Teléfono", cliente.telefono, { placeholder: "0351-422-1100" })}
          {field("email", "Email", cliente.email, { type: "email", placeholder: "logistica@empresa.com" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Ubicación</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("direccion", "Dirección", cliente.direccion, { placeholder: "Av. Colón 1240" })}
          {field("localidad", "Localidad", cliente.localidad, { placeholder: "Córdoba" })}
          {field("provincia", "Provincia", cliente.provincia, { placeholder: "Córdoba" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Notas</h2>
        <textarea
          name="notas"
          rows={2}
          defaultValue={cliente.notas ?? ""}
          placeholder="Instrucciones especiales, horarios, etc."
          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </section>

      {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => { setEditando(false); setError(""); }}
          className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
