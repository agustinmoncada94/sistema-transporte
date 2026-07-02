import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPeso(num: number | string | null) {
  if (!num) return "-";
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(Number(num));
}

export function formatFecha(date: Date | string | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function generarNumeroEnvio() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `ENV-${yyyy}${mm}${dd}-${rand}`;
}

// Mapeo unificado de etiquetas
export const ESTADOS_LABELS: Record<string, string> = {
  ingresado: "Pendiente",
  en_transito: "En tránsito",
  deposito: "En Depósito",
  retirado_deposito: "Retirado de Depósito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

// Mapeo unificado de iconos (Corregido: ahora es único y tiene todos los estados)
export const ESTADOS_ICONS: Record<string, string> = {
  ingresado: "⏳",
  en_transito: "🚚",
  deposito: "🏬",
  retirado_deposito: "📦",
  entregado: "✅",
  cancelado: "❌",
};

// Agregamos los estilos de colores para que no rompa la tabla al renderizar los nuevos estados
export const ESTADOS_COLORS: Record<string, string> = {
  ingresado: "bg-slate-500/20 text-slate-400 border border-slate-500/20",
  en_transito: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  deposito: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  retirado_deposito: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  entregado: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  cancelado: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export const TIPO_MERCADERIA_LABELS: Record<string, string> = {
  repuestos: "Repuestos Honda",
  muestras_medicas: "Muestras médicas",
  calzado: "Calzado",
  cadena_frio: "Cadena de frío",
  general: "Carga general",
  otro: "Otro",
};