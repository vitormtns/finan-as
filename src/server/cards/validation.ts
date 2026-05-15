import { z } from "zod";

function parseCurrencyValue(value: unknown) {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  return Number(normalized);
}

function emptyStringToNull(value: unknown) {
  if (value === "") {
    return null;
  }

  return value;
}

export const cardFormSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .trim()
    .min(1, "Nome é obrigatório.")
    .max(80, "Use até 80 caracteres."),
  color: z.preprocess(
    emptyStringToNull,
    z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "Informe uma cor válida.")
      .nullable(),
  ),
  limitAmount: z.preprocess(
    parseCurrencyValue,
    z
      .number({ error: "Informe um limite válido." })
      .positive("O limite deve ser maior que zero.")
      .nullable(),
  ),
  closingDay: z.coerce
    .number()
    .int("Dia de fechamento deve ser um número inteiro.")
    .min(1, "Dia de fechamento deve ser entre 1 e 31.")
    .max(31, "Dia de fechamento deve ser entre 1 e 31."),
  dueDay: z.coerce
    .number()
    .int("Dia de vencimento deve ser um número inteiro.")
    .min(1, "Dia de vencimento deve ser entre 1 e 31.")
    .max(31, "Dia de vencimento deve ser entre 1 e 31."),
});

export type CardFormInput = z.infer<typeof cardFormSchema>;
