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
import Link, { useLinkStatus } from "next/link";
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

function NavigationPendingIndicator() {
  const { pending } = useLinkStatus();

  return (
    <span
      className={`navigation-pending-indicator ${pending ? "is-pending" : ""}`}
      aria-hidden="true"
    />
  );
}

export function MobileNavigation() {
  const pathname = usePathname();
  const mobileItems = primaryNavigationItems.filter(
    (item) => !item.desktopOnly,
  );

  return (
    <>
      <nav
        className="desktop-sidebar fixed bottom-4 left-4 top-4 z-30 hidden w-60 flex-col overflow-hidden rounded-[2rem] p-3 lg:flex xl:w-64"
        aria-label="Navegação principal"
      >
        <Link
          href="/"
          className="flex items-center gap-3 rounded-[1.35rem] px-3 py-3"
          aria-label="Meu Mês — página inicial"
        >
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <span className="block text-sm font-extrabold tracking-[-0.03em] text-[var(--app-ink)]">
              Meu Mês
            </span>
            <span className="mt-0.5 block text-[0.62rem] font-bold uppercase tracking-[0.12em] text-[var(--app-ink-faint)]">
              Finanças vivas
            </span>
          </span>
          <NavigationPendingIndicator />
        </Link>

        <div className="my-2 h-px bg-[var(--app-border)]" />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-1 py-3">
          <p className="px-3 text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--app-ink-faint)]">
            Navegação
          </p>
          <ul className="mt-3 flex flex-col gap-1">
            {primaryNavigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = isCurrentRoute(pathname, item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`desktop-nav-item group flex min-h-12 items-center gap-3 rounded-[1.1rem] px-3 text-sm font-bold ${
                      isActive
                        ? "desktop-nav-item-active bg-[var(--app-primary)] text-white"
                        : "text-[var(--app-ink-muted)] hover:bg-black/[0.04] hover:text-[var(--app-ink)]"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span className="desktop-nav-icon">
                      <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
                    </span>
                    <span>{item.label}</span>
                    <NavigationPendingIndicator />
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="desktop-sidebar-action mt-2 rounded-[1.5rem] p-3">
          <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.12em] text-white/45">
            Movimento rápido
          </p>
          <p className="mt-1 text-xs leading-5 text-white/62">
            Registre uma nova saída em poucos segundos.
          </p>
          <Link
            href="/novo?tipo=despesa"
            className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-[1rem] bg-white text-sm font-extrabold text-[var(--app-primary)] transition hover:-translate-y-0.5 hover:bg-[#f4fff8]"
          >
            <Plus size={17} strokeWidth={2.5} aria-hidden="true" />
            Registrar
            <NavigationPendingIndicator />
          </Link>
        </div>
      </nav>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 px-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] lg:hidden"
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
                  <NavigationPendingIndicator />
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
              <NavigationPendingIndicator />
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
                  <NavigationPendingIndicator />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
