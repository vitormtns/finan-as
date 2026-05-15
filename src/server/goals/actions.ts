"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { saveGoals } from "./service";
import { goalsFormSchema } from "./validation";

export type GoalsActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToGoalsInput(formData: FormData) {
  const categoryBudgets = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("categoryLimit:"))
    .map(([key, value]) => ({
      categoryId: key.replace("categoryLimit:", ""),
      limitAmount: value,
    }));

  return {
    month: formData.get("month"),
    year: formData.get("year"),
    totalLimit: formData.get("totalLimit"),
    categoryBudgets,
  };
}

export async function saveGoalsAction(
  _previousState: GoalsActionState,
  formData: FormData,
): Promise<GoalsActionState> {
  const parsed = goalsFormSchema.safeParse(formDataToGoalsInput(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireCurrentUserId();
    await saveGoals(userId, parsed.data);

    revalidatePath("/");
    revalidatePath("/metas");
    revalidatePath("/alertas");

    return {
      status: "success",
      message: "Metas salvas com sucesso.",
    };
  } catch (error) {
    return {
      status: "error",
      message:
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as metas. Tente novamente.",
    };
  }
}
