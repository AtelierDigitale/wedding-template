"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Home", icon: "◉", roles: ["sposi", "planner"] },
  { href: "/admin/preventivi", label: "Preventivi", icon: "📋", roles: ["sposi", "planner"] },
  { href: "/admin/spese", label: "Spese", icon: "💰", roles: ["sposi", "planner"] },
  { href: "/admin/inviti", label: "Inviti", icon: "💌", roles: ["sposi"] },
  { href: "/admin/invitati", label: "Invitati", icon: "👥", roles: ["sposi"] },
  { href: "/admin/note", label: "Note", icon: "💬", roles: ["sposi", "planner"] },
];

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ruolo = (session?.user as any)?.ruolo as string | undefined;
  const nome = session?.user?.name || "Utente";

  const filteredItems = navItems.filter(
    (item) => !ruolo || item.roles.includes(ruolo)
  );

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* ===== MOBILE: Bottom Navigation Bar ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-beige bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        {filteredItems.slice(0, 4).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-center ${
              isActive(item.href) ? "text-marrone" : "text-grigio"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        {/* More menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex flex-1 flex-col items-center gap-0.5 py-2 ${
            menuOpen ? "text-marrone" : "text-grigio"
          }`}
        >
          <span className="text-xl">⋯</span>
          <span className="text-[10px] font-medium">Altro</span>
        </button>
      </nav>

      {/* Mobile: "More" dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed bottom-16 left-0 right-0 z-50 mx-4 mb-[env(safe-area-inset-bottom)] rounded-2xl bg-white p-4 shadow-lg md:hidden">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-testo">{nome}</p>
                <span
                  className={`text-xs ${
                    ruolo === "planner" ? "text-bosco" : "text-verde"
                  }`}
                >
                  {ruolo === "planner" ? "Wedding Planner" : "Sposi"}
                </span>
              </div>
            </div>

            {/* Remaining nav items not shown in bottom bar */}
            {filteredItems.slice(4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                  isActive(item.href)
                    ? "bg-marrone/10 font-semibold text-marrone"
                    : "text-testo"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <Link
              href="/admin/profilo"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                isActive("/admin/profilo") ? "bg-marrone/10 font-semibold text-marrone" : "text-testo"
              }`}
            >
              <span className="text-lg">⚙</span>
              Cambia password
            </Link>

            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-grigio"
            >
              <span className="text-lg">🌐</span>
              Vai al sito
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rosa"
            >
              <span className="text-lg">↪</span>
              Esci
            </button>
          </div>
        </>
      )}

      {/* ===== DESKTOP: Sidebar ===== */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col bg-white shadow-lg md:flex">
        {/* Header */}
        <div className="border-b border-beige px-6 py-5">
          <Link href="/" className="font-heading text-2xl text-marrone">
            M &amp; F
          </Link>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                ruolo === "planner"
                  ? "bg-bosco/10 text-bosco"
                  : "bg-verde/10 text-verde"
              }`}
            >
              {ruolo === "planner" ? "Wedding Planner" : "Sposi"}
            </span>
          </div>
          <p className="mt-1 text-sm text-grigio">{nome}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {filteredItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-marrone/10 font-semibold text-marrone"
                  : "text-testo hover:bg-beige"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-beige px-3 py-4">
          <Link
            href="/admin/profilo"
            className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
              isActive("/admin/profilo")
                ? "bg-marrone/10 font-semibold text-marrone"
                : "text-grigio hover:bg-beige"
            }`}
          >
            <span className="text-lg">⚙</span>
            Cambia password
          </Link>
          <Link
            href="/"
            className="mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-grigio hover:bg-beige"
          >
            <span className="text-lg">🌐</span>
            Vai al sito
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-rosa hover:bg-rosa/10"
          >
            <span className="text-lg">↪</span>
            Esci
          </button>
        </div>
      </aside>
    </>
  );
}
