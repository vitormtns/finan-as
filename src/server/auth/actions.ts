"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncProfileForUser } from "./current-user";

export type AuthActionState = {
  status: "idle" | "error";
  message: string;
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return {
      status: "error",
      message: "Informe e-mail e senha.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return {
      status: "error",
      message: "E-mail ou senha inválidos.",
    };
  }

  try {
    await syncProfileForUser(data.user);
  } catch (error) {
    console.error("Erro ao sincronizar perfil após login:", error);
    await supabase.auth.signOut();

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2021" || error.code === "P2022") {
        return {
          status: "error",
          message:
            "Login realizado, mas o banco ainda não está com as tabelas do app. Rode a migration do Prisma no Supabase.",
        };
      }

      if (error.code === "P2003") {
        return {
          status: "error",
          message:
            "Login realizado, mas houve conflito ao sincronizar seu perfil. Verifique se as migrations estão atualizadas.",
        };
      }

      return {
        status: "error",
        message: `Login realizado, mas o banco retornou erro Prisma ${error.code}.`,
      };
    }

    return {
      status: "error",
      message:
        "Login realizado, mas não foi possível sincronizar seu perfil no banco.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
