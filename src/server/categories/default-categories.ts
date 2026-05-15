import { TransactionType } from "@prisma/client";

export const defaultCategories = [
  {
    name: "Alimentação",
    icon: "utensils",
    color: "#10b981",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Mercado",
    icon: "shopping-basket",
    color: "#22c55e",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Transporte",
    icon: "car",
    color: "#3b82f6",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Lazer",
    icon: "ticket",
    color: "#f59e0b",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Saúde",
    icon: "heart-pulse",
    color: "#ef4444",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Estudos",
    icon: "graduation-cap",
    color: "#6366f1",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Assinaturas",
    icon: "repeat",
    color: "#0ea5e9",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Contas fixas",
    icon: "receipt",
    color: "#64748b",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Roupas",
    icon: "shirt",
    color: "#ec4899",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Outros",
    icon: "more-horizontal",
    color: "#71717a",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Salário",
    icon: "briefcase",
    color: "#14b8a6",
    type: TransactionType.INCOME,
  },
];
