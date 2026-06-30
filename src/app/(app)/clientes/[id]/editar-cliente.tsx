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
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
      >
        <Pencil className="w-3.5 h-3.5" />
        Editar
      </button>
    );
  }

  const field = (
    name: string,
    label: string,
    defaultValue: string | null | undefined,
    opts?: { required?: boolean; placeholder?: string; type?: string }
  ) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">
        {label}
        {opts?.required ? " *" : ""}
      </label>
      <input
        name={name}
        type={opts?.type ?? "text"}
        required={opts?.required}
        placeholder={opts?.placeholder}
        defaultValue={defaultValue ?? ""}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-900">Editar cliente</h2>
        <button
          type="button"
          onClick={() => { setEditando(false); setError(""); }}
          className="text-gray-400 hover:text-gray-700"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Datos fiscales</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("razonSocial", "Razón social", cliente.razonSocial, { required: true, placeholder: "Nombre o empresa" })}
          {field("cuit", "CUIT", cliente.cuit, { required: true, placeholder: "30-12345678-9" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Contacto</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("contactoNombre", "Nombre de contacto", cliente.contactoNombre, { placeholder: "Juan Pérez" })}
          {field("telefono", "Teléfono", cliente.telefono, { placeholder: "0351-422-1100" })}
          {field("email", "Email", cliente.email, { type: "email", placeholder: "logistica@empresa.com" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Ubicación</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("direccion", "Dirección", cliente.direccion, { placeholder: "Av. Colón 1240" })}
          {field("localidad", "Localidad", cliente.localidad, { placeholder: "Córdoba" })}
          {field("provincia", "Provincia", cliente.provincia, { placeholder: "Córdoba" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-gray-700 border-b border-gray-100 pb-2">Notas</h2>
        <textarea
          name="notas"
          rows={2}
          defaultValue={cliente.notas ?? ""}
          placeholder="Instrucciones especiales, horarios, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </section>

      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={() => { setEditando(false); setError(""); }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
