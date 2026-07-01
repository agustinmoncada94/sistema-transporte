"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex items-center gap-2 text-white/70 hover:text-white text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Cerrar Sesión
    </button>
  );
}
