import { randomUUID } from "node:crypto";
import { PaymentMethod } from "@prisma/client";
import type { TransactionFormInput } from "./validation";
import {
  cardBelongsToUser,
  categoryBelongsToUser,
  createTransactions,
  deleteTransaction,
  ensureProfile,
  updateTransaction,
} from "./repository";

function toDateOnly(value: string) {
  return new Date(`${value}T00:00:00`);
}

function addMonthsKeepingDay(date: Date, months: number) {
  const year = date.getFullYear();
  const month = date.getMonth() + months;
  const day = date.getDate();
  const lastDay = new Date(year, month + 1, 0).getDate();

  return new Date(year, month, Math.min(day, lastDay));
}

function splitAmountIntoInstallments(amount: number, totalInstallments: number) {
  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / totalInstallments);
  const remainder = totalCents % totalInstallments;

  return Array.from({ length: totalInstallments }, (_, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);
    return cents / 100;
  });
}

async function validateOwnership(userId: string, data: TransactionFormInput) {
  const categoryExists = await categoryBelongsToUser(
    userId,
    data.categoryId,
    data.type,
  );

  if (!categoryExists) {
    throw new Error("Categoria inválida para o tipo da transação.");
  }

  if (data.paymentMethod === PaymentMethod.CREDIT && data.cardId) {
    const cardExists = await cardBelongsToUser(userId, data.cardId);

    if (!cardExists) {
      throw new Error("Cartão inválido para este usuário.");
    }
  }
}

export async function createTransaction(userId: string, data: TransactionFormInput) {
  await ensureProfile(userId);
  await validateOwnership(userId, data);

  const baseDate = toDateOnly(data.date);
  const shouldCreateInstallments =
    data.paymentMethod === PaymentMethod.CREDIT && data.isInstallment;
  const totalInstallments = shouldCreateInstallments
    ? data.totalInstallments ?? 1
    : 1;
  const installmentGroupId = shouldCreateInstallments ? randomUUID() : null;
  const installmentAmounts = shouldCreateInstallments
    ? splitAmountIntoInstallments(data.amount, totalInstallments)
    : [data.amount];

  await createTransactions(
    Array.from({ length: totalInstallments }, (_, index) => ({
      userId,
      categoryId: data.categoryId,
      cardId: data.paymentMethod === PaymentMethod.CREDIT ? data.cardId : null,
      amount: installmentAmounts[index],
      description: data.description || null,
      type: data.type,
      paymentMethod: data.paymentMethod,
      date: addMonthsKeepingDay(baseDate, index),
      isInstallment: shouldCreateInstallments,
      installmentGroupId,
      installmentNumber: shouldCreateInstallments ? index + 1 : null,
      totalInstallments: shouldCreateInstallments ? totalInstallments : null,
    })),
  );

  return { totalCreated: totalInstallments };
}

export async function editTransaction(
  userId: string,
  id: string,
  data: TransactionFormInput,
) {
  await validateOwnership(userId, data);
  const shouldKeepInstallment =
    data.paymentMethod === PaymentMethod.CREDIT && data.isInstallment;

  await updateTransaction(userId, id, {
    category: { connect: { id: data.categoryId } },
    card:
      data.paymentMethod === PaymentMethod.CREDIT && data.cardId
        ? { connect: { id: data.cardId } }
        : { disconnect: true },
    amount: data.amount,
    description: data.description || null,
    type: data.type,
    paymentMethod: data.paymentMethod,
    date: toDateOnly(data.date),
    isInstallment: shouldKeepInstallment,
    installmentGroupId: shouldKeepInstallment ? undefined : null,
    installmentNumber: shouldKeepInstallment ? undefined : null,
    totalInstallments: shouldKeepInstallment ? data.totalInstallments : null,
  });
}

export async function removeTransaction(userId: string, id: string) {
  await deleteTransaction(userId, id);
}
