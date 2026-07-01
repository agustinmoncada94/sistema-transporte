"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NuevoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget).entries());

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.json();
      setError(err.error ?? "Error al guardar.");
      return;
    }

    router.push("/clientes");
  }

  const field = (name: string, label: string, opts?: { required?: boolean; placeholder?: string; type?: string }) => (
    <div>
      <label className="block text-xs font-medium text-slate-300 mb-1">{label}{opts?.required ? " *" : ""}</label>
      <input
        name={name}
        type={opts?.type ?? "text"}
        required={opts?.required}
        placeholder={opts?.placeholder}
        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-xl font-semibold text-white">Nuevo cliente</h1>
          <p className="text-sm text-slate-400 mt-0.5">Completá los datos del cliente remitente</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl border border-slate-700 p-6 space-y-6">
        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Datos fiscales</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("razonSocial", "Razón social", { required: true, placeholder: "Nombre o empresa" })}
            {field("cuit", "CUIT", { required: true, placeholder: "30-12345678-9" })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Contacto</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("contactoNombre", "Nombre de contacto", { placeholder: "Juan Pérez" })}
            {field("telefono", "Teléfono", { placeholder: "0351-422-1100" })}
            {field("email", "Email", { type: "email", placeholder: "logistica@empresa.com" })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Ubicación</h2>
          <div className="grid grid-cols-2 gap-4">
            {field("direccion", "Dirección", { placeholder: "Av. Colón 1240" })}
            {field("localidad", "Localidad", { placeholder: "Córdoba" })}
            {field("provincia", "Provincia", { placeholder: "Córdoba" })}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium text-slate-300 border-b border-slate-700 pb-2">Notas</h2>
          <textarea name="notas" rows={2} placeholder="Instrucciones especiales, horarios, etc."
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
        </section>

        {error && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 justify-end">
          <Link href="/clientes" className="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors">
            Cancelar
          </Link>
          <button type="submit" disabled={loading}
            className="px-4 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {loading ? "Guardando..." : "Guardar cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
