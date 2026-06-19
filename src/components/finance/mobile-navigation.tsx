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
      className="fixed inset-x-0 bottom-3 z-20 px-3 pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Navegação principal"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 items-center gap-1 rounded-[1.75rem] border border-white/70 bg-white/72 p-2 shadow-[0_24px_60px_rgb(16_25_35_/_0.18)] backdrop-blur-2xl">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

          if (item.featured) {
            return (
              <li key={item.label} className="flex justify-center">
                <Link
                  href={item.href}
                  className="group -mt-8 flex size-16 flex-col items-center justify-center rounded-[1.35rem] bg-[linear-gradient(145deg,#123241,#0f1923)] text-white shadow-[0_18px_35px_rgb(15_38_51_/_0.34)] transition active:scale-95"
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    size={25}
                    strokeWidth={2.35}
                    className="transition group-hover:rotate-90"
                    aria-hidden="true"
                  />
                  <span className="mt-0.5 text-[0.66rem] font-bold">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-[1.15rem] text-[0.68rem] font-bold transition active:scale-95 ${
                  isActive
                    ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)] shadow-[inset_0_1px_0_rgb(255_255_255_/_0.75)]"
                    : "text-[var(--app-ink-muted)] hover:bg-white/70 hover:text-[var(--app-primary)]"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={2.25} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
