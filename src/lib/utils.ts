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

export const ESTADOS_LABELS: Record<string, string> = {
  ingresado: "Pendiente",
  en_transito: "En tránsito",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const ESTADOS_COLORS: Record<string, string> = {
  ingresado: "bg-slate-600/40 text-slate-300 border border-slate-500/50",
  en_transito: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  entregado: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  cancelado: "bg-red-500/20 text-red-400 border border-red-500/30",
};

export const ESTADOS_ICONS: Record<string, string> = {
  ingresado: "",
  en_transito: "\uD83D\uDE9A",
  entregado: "\u2713",
  cancelado: "\u2715",
};

export const TIPO_MERCADERIA_LABELS: Record<string, string> = {
  repuestos: "Repuestos Honda",
  muestras_medicas: "Muestras médicas",
  calzado: "Calzado",
  cadena_frio: "Cadena de frío",
  general: "Carga general",
  otro: "Otro",
};
