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

export const goalsFormSchema = z.object({
  month: z.coerce
    .number()
    .int("Mês deve ser um número inteiro.")
    .min(1, "Mês deve ser entre 1 e 12.")
    .max(12, "Mês deve ser entre 1 e 12."),
  year: z.coerce
    .number()
    .int("Ano deve ser um número inteiro.")
    .min(2020, "Ano deve ser válido.")
    .max(2100, "Ano deve ser válido."),
  totalLimit: z.preprocess(
    parseCurrencyValue,
    z
      .number({ error: "Informe uma meta mensal válida." })
      .nonnegative("A meta mensal não pode ser negativa."),
  ),
  categoryBudgets: z.array(
    z.object({
      categoryId: z.string().min(1, "Categoria inválida."),
      limitAmount: z.preprocess(
        parseCurrencyValue,
        z
          .number({ error: "Informe um valor válido." })
          .nonnegative("O limite da categoria não pode ser negativo.")
          .nullable(),
      ),
    }),
  ),
});

export type GoalsFormInput = z.infer<typeof goalsFormSchema>;
