import { ensureProfile } from "@/server/transactions/repository";
import {
  countCategoryTransactions,
  createCategory,
  deleteCategory,
  findCategoryForEdit,
  listCategories,
  updateCategory,
} from "./repository";
import type {
  CategoriesPageData,
  CategoryListItem,
  EditableCategory,
} from "./types";
import type { CategoryFormInput } from "./validation";

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

function toListItem(
  category: Awaited<ReturnType<typeof listCategories>>[number],
): CategoryListItem {
  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    transactionsCount: category._count.transactions,
  };
}

export async function getCategoriesPageData(
  userId: string,
): Promise<CategoriesPageData> {
  const categories = await listCategories(userId);

  return {
    categories: categories.map(toListItem),
  };
}

export async function getEditableCategory(
  userId: string,
  id: string,
): Promise<EditableCategory | null> {
  const category = await findCategoryForEdit(userId, id);

  if (!category) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    type: category.type,
    icon: category.icon ?? "",
    color: category.color ?? "#2563eb",
  };
}

export async function saveCategory(userId: string, data: CategoryFormInput) {
  await ensureProfile(userId);

  await createCategory({
    profile: { connect: { userId } },
    name: normalizeCategoryName(data.name),
    type: data.type,
    icon: data.icon,
    color: data.color,
  });
}

export async function editCategory(
  userId: string,
  id: string,
  data: CategoryFormInput,
) {
  await updateCategory(userId, id, {
    name: normalizeCategoryName(data.name),
    type: data.type,
    icon: data.icon,
    color: data.color,
  });
}

export async function removeCategory(userId: string, id: string) {
  const transactionsCount = await countCategoryTransactions(userId, id);

  if (transactionsCount > 0) {
    throw new Error(
      "Não é possível excluir uma categoria que já possui transações vinculadas.",
    );
  }

  await deleteCategory(userId, id);
}
