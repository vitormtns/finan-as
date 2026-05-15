"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUserId } from "@/server/auth/current-user";
import { editCategory, removeCategory, saveCategory } from "./service";
import { categoryFormSchema } from "./validation";

export type CategoryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

function revalidateCategoryViews() {
  revalidatePath("/");
  revalidatePath("/gastos");
  revalidatePath("/categorias");
  revalidatePath("/novo");
  revalidatePath("/metas");
  revalidatePath("/ajustes");
  revalidatePath("/relatorios");
  revalidatePath("/alertas");
}

function duplicateMessage() {
  return "Já existe uma categoria com esse nome e tipo.";
}

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categoryFormSchema.safeParse(formDataToObject(formData));

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const userId = await requireCurrentUserId();
    await saveCategory(userId, parsed.data);
    revalidateCategoryViews();

    return {
      status: "success",
      message: "Categoria salva com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: duplicateMessage(),
    };
  }
}

export async function updateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categoryFormSchema.safeParse(formDataToObject(formData));
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return {
      status: "error",
      message: "Categoria não encontrada para edição.",
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
    await editCategory(userId, id, parsed.data);
    revalidateCategoryViews();

    return {
      status: "success",
      message: "Categoria atualizada com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: duplicateMessage(),
    };
  }
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  try {
    const userId = await requireCurrentUserId();
    await removeCategory(userId, id);
    revalidateCategoryViews();
  } catch {
    revalidatePath("/categorias");
  }
}
