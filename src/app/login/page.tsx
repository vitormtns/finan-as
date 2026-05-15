import { WalletCards } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dbeafe_0,#f8fafc_34rem)] px-4 py-8">
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
            <WalletCards size={24} aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold text-slate-950">
            Entrar no Meu Mês
          </h1>
          <p className="mt-2 text-base leading-7 text-slate-600">
            Acesse sua conta para acompanhar seus gastos, metas e cartões com
            segurança.
          </p>
        </div>

        <LoginForm />
      </main>
    </div>
  );
}
