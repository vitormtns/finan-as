import type { TransactionType } from "@prisma/client";

export type EditableCategory = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
};

export type CategoryListItem = {
  id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  transactionsCount: number;
};

export type CategoriesPageData = {
  categories: CategoryListItem[];
};
