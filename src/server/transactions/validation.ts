import { PaymentMethod, TransactionType } from "@prisma/client";
import { z } from "zod";

const transactionTypes = [TransactionType.EXPENSE, TransactionType.INCOME] as const;
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

export const transactionFormSchema = z
  .object({
    id: z.string().optional(),
    amount: z.preprocess(
      parseCurrencyValue,
      z
        .number({
          error: "Informe um valor válido.",
        })
        .positive("O valor deve ser maior que zero."),
    ),
    description: z.string().trim().max(120, "Use até 120 caracteres.").optional(),
    categoryId: z.string().trim().min(1, "Categoria é obrigatória."),
    paymentMethod: z.enum(paymentMethods, {
      error: "Forma de pagamento é obrigatória.",
    }),
    cardId: z.string().trim().optional(),
    date: z
      .string()
      .trim()
      .min(1, "Data é obrigatória.")
      .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
        message: "Informe uma data válida.",
      }),
    type: z.enum(transactionTypes).default(TransactionType.EXPENSE),
    isInstallment: z.preprocess((value) => value === "on" || value === true, z.boolean()),
    totalInstallments: z.preprocess(
      (value) => {
        if (value === "" || value === null || value === undefined) {
          return undefined;
        }

        return Number(value);
      },
      z.number().int().min(2, "Use pelo menos 2 parcelas.").max(48, "Use até 48 parcelas.").optional(),
    ),
  })
  .superRefine((data, context) => {
    if (data.paymentMethod === PaymentMethod.CREDIT && !data.cardId) {
      context.addIssue({
        code: "custom",
        path: ["cardId"],
        message: "Cartão é obrigatório para pagamento no crédito.",
      });
    }

    if (data.paymentMethod !== PaymentMethod.CREDIT && data.isInstallment) {
      context.addIssue({
        code: "custom",
        path: ["isInstallment"],
        message: "Parcelamento só está disponível para crédito.",
      });
    }

    if (data.isInstallment && !data.totalInstallments) {
      context.addIssue({
        code: "custom",
        path: ["totalInstallments"],
        message: "Informe a quantidade de parcelas.",
      });
    }
  });

export type TransactionFormInput = z.infer<typeof transactionFormSchema>;
