"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/server/auth/current-user";
import {
  editFixedExpense,
  launchFixedExpensePayment,
  removeFixedExpense,
  saveFixedExpense,
  setFixedExpenseActive,
} from "./service";
import {
  fixedExpenseFormSchema,
  fixedExpensePaymentSchema,
} from "./validation";

export type FixedExpenseActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function revalidateFixedExpenseViews() {
  revalidatePath("/");
  revalidatePath("/ajustes");
  revalidatePath("/gastos");
  revalidatePath("/cartoes");
  revalidatePath("/relatorios");
  revalidatePath("/alertas");
}

export async function createFixedExpenseAction(
  _previousState: FixedExpenseActionState,
  formData: FormData,
): Promise<FixedExpenseActionState> {
  const parsed = fixedExpenseFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireCurrentUserId();
    await saveFixedExpense(userId, parsed.data);
    revalidateFixedExpenseViews();

    return {
      status: "success",
      message: "Gasto fixo salvo com sucesso.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o gasto fixo.",
    };
  }
}

export async function updateFixedExpenseAction(
  _previousState: FixedExpenseActionState,
  formData: FormData,
): Promise<FixedExpenseActionState> {
  const parsed = fixedExpenseFormSchema.safeParse(formDataToObject(formData));
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return {
      status: "error",
      message: "Gasto fixo não encontrado para edição.",
    };
  }

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireCurrentUserId();
    await editFixedExpense(userId, id, parsed.data);
    revalidateFixedExpenseViews();

    return {
      status: "success",
      message: "Gasto fixo atualizado com sucesso.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o gasto fixo.",
    };
  }
}

export async function deleteFixedExpenseAction(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  const userId = await requireCurrentUserId();
  await removeFixedExpense(userId, id);
  revalidateFixedExpenseViews();
}

export async function toggleFixedExpenseAction(formData: FormData) {
  const id = formData.get("id");
  const active = formData.get("active") === "true";

  if (typeof id !== "string" || !id) {
    return;
  }

  const userId = await requireCurrentUserId();
  await setFixedExpenseActive(userId, id, active);
  revalidateFixedExpenseViews();
}

export async function launchFixedExpensePaymentAction(formData: FormData) {
  const parsed = fixedExpensePaymentSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return;
  }

  const userId = await requireCurrentUserId();
  try {
    await launchFixedExpensePayment(userId, parsed.data.id);
  } catch {
    // A tela será revalidada; se já estava pago, o status aparece atualizado.
  } finally {
    revalidateFixedExpenseViews();
  }
}
