"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { listTransactionsByMonth as listTransactionsByMonthRepository } from "./repository";
import {
  createTransaction,
  editTransaction,
  removeTransaction,
} from "./service";
import { transactionFormSchema } from "./validation";

export type TransactionActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const defaultErrorMessage =
  "Não foi possível salvar a movimentação. Tente novamente.";

function revalidateTransactionViews() {
  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/novo");
  revalidatePath("/metas");
  revalidatePath("/cartoes");
  revalidatePath("/cartoes/[id]", "page");
  revalidatePath("/relatorios");
  revalidatePath("/alertas");
}

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function getSafeReturnPath(formData: FormData) {
  const value = formData.get("returnTo");

  return typeof value === "string" && /^\/cartoes\/[0-9a-f-]+$/i.test(value)
    ? value
    : null;
}

export async function createTransactionAction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = transactionFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  let totalCreated = 0;

  try {
    const userId = await requireCurrentUserId();
    const result = await createTransaction(userId, parsed.data);
    totalCreated = result.totalCreated;

    revalidateTransactionViews();
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : defaultErrorMessage,
    };
  }

  const returnPath = getSafeReturnPath(formData);

  if (returnPath) {
    redirect(returnPath);
  }

  return {
    status: "success",
    message:
      totalCreated > 1
        ? "Compra parcelada salva com sucesso."
        : parsed.data.type === "INCOME"
          ? "Receita salva com sucesso."
          : "Despesa salva com sucesso.",
  };
}

export async function updateTransactionAction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const parsed = transactionFormSchema.safeParse(formDataToObject(formData));
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return {
      status: "error",
      message: "Transação não encontrada para edição.",
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
    await editTransaction(userId, id, parsed.data);

    revalidateTransactionViews();
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : defaultErrorMessage,
    };
  }

  const returnPath = getSafeReturnPath(formData);

  if (returnPath) {
    redirect(returnPath);
  }

  return {
    status: "success",
    message: "Movimentação atualizada com sucesso.",
  };
}

export async function deleteTransactionAction(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  const userId = await requireCurrentUserId();
  await removeTransaction(userId, id);
  revalidateTransactionViews();
}

export async function listTransactionsByMonth(month: number, year: number) {
  const userId = await requireCurrentUserId();

  return listTransactionsByMonthRepository(userId, month, year);
}
