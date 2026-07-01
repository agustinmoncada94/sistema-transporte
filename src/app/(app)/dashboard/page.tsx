import { db } from "@/lib/db";
import {
  LayoutDashboard,
  Package,
  Users,
  TrendingUp,
  Map,
  Truck,
  Plus,
  Globe,
  BarChart3,
  MapPin,
  Calculator,
  DollarSign,
  Settings,
} from "lucide-react";
import { formatPeso } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/auth";
import { SignOutButton } from "./sign-out-button";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name ?? "Admin";

  const [totalEnviosCount, enTransitoCount, totalClientesCount, facturadoSum, totalContableCount, totalRutasCount] =
    await Promise.all([
      db.envio.count(),
      db.envio.count({ where: { estado: "INGRESADO" } }),
      db.cliente.count({ where: { activo: 1 } }),
      db.envio.aggregate({ _sum: { precioCliente: true } }),
      db.envio.count(),
      db.ruta.count(),
    ]);

  const facturadoTotal = formatPeso(Number(facturadoSum._sum.precioCliente ?? 0));

  const cards = [
    {
      href: "/dashboard",
      title: "DASHBOARD",
      gradient: "from-purple-600 to-purple-700",
      hoverGradient: "hover:from-purple-500 hover:to-purple-600",
      shadowColor: "shadow-purple-900/30",
      icons: [BarChart3, TrendingUp],
      counters: [
        { label: "Total envíos", value: totalEnviosCount, icon: Package },
        { label: "En tránsito", value: enTransitoCount, icon: Truck },
      ],
    },
    {
      href: "/envios",
      title: "ENVÍOS",
      gradient: "from-amber-400 to-orange-500",
      hoverGradient: "hover:from-amber-300 hover:to-orange-400",
      shadowColor: "shadow-orange-900/30",
      icons: [Globe, Truck],
      counters: [
        { label: "Total envíos", value: totalEnviosCount, icon: Package },
        { label: "En tránsito", value: enTransitoCount, icon: Truck },
      ],
    },
    {
      href: "/clientes",
      title: "CLIENTES",
      gradient: "from-green-500 to-emerald-600",
      hoverGradient: "hover:from-green-400 hover:to-emerald-500",
      shadowColor: "shadow-green-900/30",
      icons: [Globe, Truck],
      counters: [
        { label: "Total clientes", value: totalClientesCount, icon: Users },
        { label: "En tránsito", value: enTransitoCount, icon: Truck },
      ],
    },
    {
      href: "/contable",
      title: "CONTABLE",
      gradient: "from-sky-400 to-cyan-500",
      hoverGradient: "hover:from-sky-300 hover:to-cyan-400",
      shadowColor: "shadow-cyan-900/30",
      icons: [Calculator, DollarSign],
      counters: [
        { label: "Contables", value: totalContableCount, icon: Calculator },
      ],
    },
    {
      href: "/rutas",
      title: "RUTAS",
      gradient: "from-cyan-500 to-teal-500",
      hoverGradient: "hover:from-cyan-400 hover:to-teal-400",
      shadowColor: "shadow-teal-900/30",
      icons: [MapPin, Map],
      counters: [
        { label: "Total envíos", value: totalEnviosCount, icon: Package },
        { label: "En tránsito", value: enTransitoCount, icon: Truck },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Imagen de fondo decorativa con overlay */}
      <div className="absolute inset-0 opacity-20 bg-[url('/bg-transport.png')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-blue-950/70 to-slate-900/80" />

      {/* Contenido */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Encabezado */}
        <header className="flex items-center justify-between px-8 pt-8 pb-2 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400/50 flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-300" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
              Transporte<br />
              <span className="text-blue-300">Sancrica</span>
            </h1>
          </div>
          <Link
            href="/envios/nuevo"
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-900/30"
          >
            <Plus className="w-4 h-4" />
            Nuevo envío
          </Link>
        </header>

        {/* Grilla de tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto px-6 mt-8 pb-8 flex-1">
          {cards.map((card) => (
            <Link
              key={card.href + card.title}
              href={card.href}
              className={`group relative bg-gradient-to-br ${card.gradient} ${card.hoverGradient} rounded-2xl shadow-lg ${card.shadowColor} hover:shadow-xl hover:scale-[1.03] transition-all duration-300 p-6 flex flex-col justify-between min-h-[200px] overflow-hidden`}
            >
              {/* Decoración circular de fondo */}
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full" />
              <div className="absolute -right-2 -bottom-8 w-24 h-24 bg-white/5 rounded-full" />

              {/* Iconos grandes centrales */}
              <div className="relative flex items-center justify-center gap-3 mt-2">
                {card.icons.map((Icon, i) => (
                  <Icon key={i} className="w-12 h-12 text-white/80 drop-shadow-md" />
                ))}
              </div>

              {/* Mini-contadores */}
              <div className="relative flex justify-center gap-5 mt-3">
                {card.counters.map((c) => {
                  const CIcon = c.icon;
                  return (
                    <div key={c.label} className="text-center bg-white/15 backdrop-blur-sm rounded-lg px-3 py-1.5">
                      <div className="flex items-center justify-center gap-1 text-white">
                        <CIcon className="w-3.5 h-3.5 opacity-80" />
                        <span className="text-lg font-bold">{c.value}</span>
                      </div>
                      <p className="text-[10px] text-white/70 whitespace-nowrap">{c.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Título */}
              <h2 className="relative text-white font-extrabold text-2xl tracking-wider text-center mt-3 drop-shadow-lg">
                {card.title}
              </h2>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer className="relative z-10 flex items-center justify-center gap-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Users className="w-4 h-4" />
            Hola, {userName}
          </div>
          <SignOutButton />
        </footer>
      </div>
    </div>
  );
}
