"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { editCard, removeCard, saveCard } from "./service";
import { cardFormSchema } from "./validation";

export type CardActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function revalidateCardViews() {
  revalidatePath("/");
  revalidatePath("/cartoes");
  revalidatePath("/novo");
  revalidatePath("/ajustes");
  revalidatePath("/alertas");
}

export async function createCardAction(
  _previousState: CardActionState,
  formData: FormData,
): Promise<CardActionState> {
  const parsed = cardFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireCurrentUserId();
    await saveCard(userId, parsed.data);
    revalidateCardViews();

    return {
      status: "success",
      message: "Cartão salvo com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Não foi possível salvar o cartão. Verifique se já existe um cartão com esse nome.",
    };
  }
}

export async function updateCardAction(
  _previousState: CardActionState,
  formData: FormData,
): Promise<CardActionState> {
  const parsed = cardFormSchema.safeParse(formDataToObject(formData));
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return {
      status: "error",
      message: "Cartão não encontrado para edição.",
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
    await editCard(userId, id, parsed.data);
    revalidateCardViews();

    return {
      status: "success",
      message: "Cartão atualizado com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message:
        "Não foi possível atualizar o cartão. Verifique se já existe um cartão com esse nome.",
    };
  }
}

export async function deleteCardAction(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  try {
    const userId = await requireCurrentUserId();
    await removeCard(userId, id);
    revalidateCardViews();
  } catch {
    revalidatePath("/cartoes");
  }
}
