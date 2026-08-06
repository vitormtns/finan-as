import { MobileNavigation } from "@/components/finance/mobile-navigation";

export default function Loading() {
  return (
    <div className="app-shell">
      <main
        className="flex w-full max-w-none flex-col gap-6 px-3 py-5 sm:px-5 md:py-8 lg:px-6 xl:px-8"
        aria-busy="true"
        aria-live="polite"
      >
        <p className="sr-only">Carregando sua visão financeira...</p>

        <div className="flex items-center justify-between md:hidden">
          <div className="space-y-2">
            <span className="app-skeleton block h-3 w-16 rounded-full" />
            <span className="app-skeleton block h-7 w-36 rounded-xl" />
          </div>
          <span className="app-skeleton block size-11 rounded-2xl" />
        </div>

        <section className="loading-hero -mx-3 overflow-hidden rounded-none p-6 sm:mx-0 sm:rounded-[2.4rem] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <span className="loading-skeleton-dark h-4 w-32 rounded-full" />
            <span className="loading-skeleton-dark h-7 w-28 rounded-full" />
          </div>
          <div className="mt-20 space-y-4">
            <span className="loading-skeleton-dark block h-3 w-40 rounded-full" />
            <span className="loading-skeleton-dark block h-16 w-64 max-w-[78%] rounded-2xl" />
            <span className="loading-skeleton-dark block h-4 w-72 max-w-[88%] rounded-full" />
          </div>
          <div className="mt-24 space-y-3">
            <span className="loading-skeleton-dark block h-3 w-36 rounded-full" />
            <span className="loading-skeleton-dark block h-24 w-full rounded-[1.4rem]" />
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <span className="app-skeleton block h-28 rounded-[1.35rem]" />
          <span className="app-skeleton block h-28 rounded-[1.35rem]" />
          <span className="app-skeleton block h-28 rounded-[1.35rem]" />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <span className="app-skeleton block h-64 rounded-[1.75rem]" />
          <span className="app-skeleton block h-64 rounded-[1.75rem]" />
        </section>
      </main>
      <MobileNavigation />
    </div>
  );
}
