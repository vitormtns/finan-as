"use client";

import {
  BarChart3,
  CreditCard,
  Home,
  ListChecks,
  Plus,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryNavigationItems = [
  { label: "Visão geral", shortLabel: "Início", icon: Home, href: "/" },
  {
    label: "Movimentos",
    shortLabel: "Movimentos",
    icon: ListChecks,
    href: "/gastos",
  },
  {
    label: "Cartões",
    shortLabel: "Cartões",
    icon: CreditCard,
    href: "/cartoes",
  },
  {
    label: "Planejamento",
    shortLabel: "Planejar",
    icon: Target,
    href: "/metas",
    desktopOnly: true,
  },
  {
    label: "Relatórios",
    shortLabel: "Relatórios",
    icon: BarChart3,
    href: "/relatorios",
    desktopOnly: true,
  },
  {
    label: "Ajustes",
    shortLabel: "Mais",
    icon: Settings,
    href: "/ajustes",
  },
];

function isCurrentRoute(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function MobileNavigation() {
  const pathname = usePathname();
  const mobileItems = primaryNavigationItems.filter(
    (item) => !item.desktopOnly,
  );

  return (
    <>
      <nav
        className="nav-shell fixed inset-x-0 top-4 z-30 mx-auto hidden w-[calc(100%-2rem)] max-w-6xl items-center justify-between rounded-[1.45rem] px-3 py-2.5 md:flex"
        aria-label="Navegação principal"
      >
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl px-2 py-1.5"
          aria-label="Meu Mês — página inicial"
        >
          <span className="brand-mark" aria-hidden="true" />
          <span className="hidden lg:block">
            <span className="block text-sm font-extrabold tracking-[-0.03em] text-[var(--app-ink)]">
              Meu Mês
            </span>
            <span className="mt-0.5 block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--app-ink-faint)]">
              Finanças vivas
            </span>
          </span>
        </Link>

        <ul className="flex items-center gap-1">
          {primaryNavigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold ${
                    isActive
                      ? "nav-item-active bg-[var(--app-primary)] text-white shadow-[0_10px_26px_rgb(17_25_20_/_0.2)]"
                      : "text-[var(--app-ink-muted)] hover:bg-black/[0.04] hover:text-[var(--app-ink)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={16} strokeWidth={2.25} aria-hidden="true" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <Link href="/novo?tipo=despesa" className="btn-primary min-h-10 rounded-xl">
          <Plus size={17} strokeWidth={2.4} aria-hidden="true" />
          Registrar
        </Link>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Navegação principal"
      >
        <ul className="nav-shell mx-auto grid max-w-md grid-cols-5 items-end rounded-[1.75rem] p-1.5">
          {mobileItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-[0.66rem] font-bold active:scale-95 ${
                    isActive
                      ? "nav-item-active bg-[var(--app-primary)] text-white shadow-[0_10px_24px_rgb(17_25_20_/_0.2)]"
                      : "text-[var(--app-ink-muted)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={2.15} aria-hidden="true" />
                  {item.shortLabel}
                </Link>
              </li>
            );
          })}

          <li className="flex justify-center">
            <Link
              href="/novo?tipo=despesa"
              className="-mt-7 flex size-16 flex-col items-center justify-center rounded-[1.35rem] bg-[var(--app-primary)] text-white shadow-[0_18px_38px_rgb(17_25_20_/_0.34)] transition hover:-translate-y-1 active:scale-95"
              aria-label="Registrar movimentação"
            >
              <Plus size={26} strokeWidth={2.35} aria-hidden="true" />
              <span className="mt-0.5 text-[0.62rem] font-bold">Registrar</span>
            </Link>
          </li>

          {mobileItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-item flex min-h-14 flex-col items-center justify-center gap-1 rounded-[1.15rem] text-[0.66rem] font-bold active:scale-95 ${
                    isActive
                      ? "nav-item-active bg-[var(--app-primary)] text-white shadow-[0_10px_24px_rgb(17_25_20_/_0.2)]"
                      : "text-[var(--app-ink-muted)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon size={20} strokeWidth={2.15} aria-hidden="true" />
                  {item.shortLabel}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
