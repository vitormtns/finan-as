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
        className="nav-shell fixed inset-x-5 top-4 z-30 hidden items-center justify-between rounded-[1.45rem] px-3 py-2.5 md:flex lg:inset-x-6 xl:inset-x-8"
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
        className="fixed inset-x-0 bottom-0 z-30 px-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] md:hidden"
        aria-label="Navegação principal"
      >
        <ul className="mobile-nav-shell mx-auto grid max-w-lg grid-cols-5 items-end rounded-[2rem] px-1.5 pb-1.5 pt-2">
          {mobileItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`mobile-nav-item ${
                    isActive
                      ? "mobile-nav-item-active text-[var(--app-ink)]"
                      : "text-[var(--app-ink-muted)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="mobile-nav-icon">
                    <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex justify-center">
            <Link
              href="/novo?tipo=despesa"
              className="mobile-nav-create"
              aria-label="Registrar movimentação"
            >
              <span className="mobile-nav-create-icon">
                <Plus size={25} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <span className="text-[0.62rem] font-extrabold tracking-[-0.01em]">Registrar</span>
            </Link>
          </li>

          {mobileItems.slice(2).map((item) => {
            const Icon = item.icon;
            const isActive = isCurrentRoute(pathname, item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`mobile-nav-item ${
                    isActive
                      ? "mobile-nav-item-active text-[var(--app-ink)]"
                      : "text-[var(--app-ink-muted)]"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="mobile-nav-icon">
                    <Icon size={19} strokeWidth={2.2} aria-hidden="true" />
                  </span>
                  <span>{item.shortLabel}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
