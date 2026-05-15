"use client";

import { Home, ListChecks, Plus, Settings, Target } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationItems = [
  { label: "Início", icon: Home, href: "/" },
  { label: "Gastos", icon: ListChecks, href: "/gastos" },
  { label: "Novo", icon: Plus, href: "/novo", featured: true },
  { label: "Metas", icon: Target, href: "/metas" },
  { label: "Ajustes", icon: Settings, href: "/ajustes" },
];

export function MobileNavigation() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-2 pb-[max(env(safe-area-inset-bottom),0.6rem)] pt-2 shadow-2xl shadow-slate-950/10 backdrop-blur md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const featuredClasses = item.featured
            ? "relative -mt-5 min-h-16 rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/25 hover:bg-slate-800"
            : isActive
              ? "min-h-14 bg-blue-50 text-blue-700"
              : "min-h-14 text-slate-500 hover:bg-slate-50 hover:text-slate-800";

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex w-full flex-col items-center justify-center gap-1 text-[0.72rem] font-medium transition ${featuredClasses}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  size={item.featured ? 24 : 20}
                  strokeWidth={2.3}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
