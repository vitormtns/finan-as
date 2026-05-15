import { TransactionType } from "@prisma/client";
import { z } from "zod";

const transactionTypes = [TransactionType.EXPENSE, TransactionType.INCOME] as const;

function emptyStringToNull(value: unknown) {
  return value === "" ? null : value;
}

export const categoryFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(60, "Use até 60 caracteres."),
  type: z.enum(transactionTypes, {
    error: "Tipo é obrigatório.",
  }),
  icon: z.preprocess(
    emptyStringToNull,
    z.string().trim().max(40, "Use até 40 caracteres.").nullable(),
  ),
  color: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor válida.")
      .nullable(),
  ),
});

export type CategoryFormInput = z.infer<typeof categoryFormSchema>;
