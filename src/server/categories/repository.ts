import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: { userId },
    orderBy: [{ type: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          transactions: true,
        },
      },
    },
  });
}

export async function findCategoryForEdit(userId: string, id: string) {
  return prisma.category.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function createCategory(data: Prisma.CategoryCreateInput) {
  return prisma.category.create({ data });
}

export async function updateCategory(
  userId: string,
  id: string,
  data: Prisma.CategoryUpdateInput,
) {
  return prisma.category.update({
    where: {
      id,
      userId,
    },
    data,
  });
}

export async function countCategoryTransactions(userId: string, id: string) {
  return prisma.transaction.count({
    where: {
      userId,
      categoryId: id,
    },
  });
}

export async function deleteCategory(userId: string, id: string) {
  return prisma.category.delete({
    where: {
      id,
      userId,
    },
  });
}
