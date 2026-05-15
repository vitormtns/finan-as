import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

const paymentMethods = [
  PaymentMethod.PIX,
  PaymentMethod.DEBIT,
  PaymentMethod.CREDIT,
  PaymentMethod.CASH,
  PaymentMethod.BANK_SLIP,
  PaymentMethod.OTHER,
] as const;

function parseCurrencyValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  if (!normalized) {
    return Number.NaN;
  }

  return Number(normalized);
}

function emptyStringToUndefined(value: unknown) {
  return value === "" ? undefined : value;
}

export const fixedExpenseFormSchema = z.object({
  id: z.string().optional(),
  description: z
    .string()
    .trim()
    .min(1, "Descrição é obrigatória.")
    .max(120, "Use até 120 caracteres."),
  amount: z.preprocess(
    parseCurrencyValue,
    z
      .number({ error: "Informe um valor válido." })
      .positive("O valor deve ser maior que zero."),
  ),
  dueDay: z.coerce
    .number()
    .int("Dia de vencimento deve ser um número inteiro.")
    .min(1, "Dia de vencimento deve ser entre 1 e 31.")
    .max(31, "Dia de vencimento deve ser entre 1 e 31."),
  categoryId: z.preprocess(emptyStringToUndefined, z.string().optional()),
  paymentMethod: z.enum(paymentMethods, {
    error: "Forma de pagamento é obrigatória.",
  }),
  cardId: z.preprocess(emptyStringToUndefined, z.string().optional()),
  active: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type FixedExpenseFormInput = z.infer<typeof fixedExpenseFormSchema>;
