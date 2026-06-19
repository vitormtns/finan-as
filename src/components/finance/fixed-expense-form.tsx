"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_OPTIONS,
  type EditableFixedExpense,
  type FixedExpenseFormOptions,
  type PaymentMethod,
  paymentMethodLabels,
} from "@/lib/finance/types";
import type { FixedExpenseActionState } from "@/server/fixed-expenses/actions";
import {
  createFixedExpenseAction,
  updateFixedExpenseAction,
} from "@/server/fixed-expenses/actions";

type FixedExpenseFormProps = {
  options: FixedExpenseFormOptions;
  initialExpense?: EditableFixedExpense | null;
};

const initialState: FixedExpenseActionState = {
  status: "idle",
  message: "",
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending
        ? "Salvando..."
        : isEditing
          ? "Salvar alterações"
          : "Salvar gasto fixo"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{errors[0]}</p>;
}

export function FixedExpenseForm({
  options,
  initialExpense,
}: FixedExpenseFormProps) {
  const isEditing = Boolean(initialExpense);
  const action = isEditing ? updateFixedExpenseAction : createFixedExpenseAction;
  const [state, formAction] = useActionState(action, initialState);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialExpense?.paymentMethod ?? PAYMENT_METHOD.PIX,
  );
  const [active, setActive] = useState(initialExpense?.active ?? true);
  const showCardField = paymentMethod === PAYMENT_METHOD.CREDIT;

  return (
    <form
      action={formAction}
      className="premium-panel p-5 sm:p-6"
    >
      {initialExpense ? (
        <input type="hidden" name="id" value={initialExpense.id} />
      ) : null}

      <div className="grid gap-4">
        <div>
          <label
            className="form-label"
            htmlFor="description"
          >
            Descrição
          </label>
          <input
            id="description"
            name="description"
            placeholder="Ex.: internet, academia, celular"
            defaultValue={initialExpense?.description ?? ""}
            className="form-control mt-2"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="form-label"
              htmlFor="amount"
            >
              Valor
            </label>
            <input
              id="amount"
              name="amount"
              inputMode="decimal"
              placeholder="0,00"
              defaultValue={initialExpense?.amount ?? ""}
              className="form-control mt-2 text-base font-bold"
            />
            <FieldError errors={state.fieldErrors?.amount} />
          </div>

          <div>
            <label
              className="form-label"
              htmlFor="dueDay"
            >
              Dia de vencimento
            </label>
            <input
              id="dueDay"
              name="dueDay"
              type="number"
              min={1}
              max={31}
              placeholder="10"
              defaultValue={initialExpense?.dueDay ?? ""}
              className="form-control mt-2"
            />
            <FieldError errors={state.fieldErrors?.dueDay} />
          </div>
        </div>

        <div>
          <label
            className="form-label"
            htmlFor="categoryId"
          >
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialExpense?.categoryId ?? ""}
            className="form-control mt-2"
          >
            <option value="">Sem categoria</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.categoryId} />
        </div>

        <div>
          <label
            className="form-label"
            htmlFor="paymentMethod"
          >
            Forma de pagamento
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(event) =>
              setPaymentMethod(event.target.value as PaymentMethod)
            }
            className="form-control mt-2"
          >
            {PAYMENT_METHOD_OPTIONS.map((method) => (
              <option key={method.value} value={method.value}>
                {paymentMethodLabels[method.value]}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.paymentMethod} />
        </div>

        {showCardField ? (
          <div>
            <label
              className="form-label"
              htmlFor="cardId"
            >
              Cartão
            </label>
            <select
              id="cardId"
              name="cardId"
              defaultValue={initialExpense?.cardId ?? ""}
              className="form-control mt-2"
            >
              <option value="">Sem cartão vinculado</option>
              {options.cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.cardId} />
          </div>
        ) : null}

        <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/64 p-4 shadow-sm">
          <span>
            <span className="block text-sm font-semibold text-slate-800">
              Gasto ativo
            </span>
            <span className="mt-1 block text-xs text-[var(--app-ink-muted)]">
              Gastos inativos ficam salvos, mas não entram na dashboard.
            </span>
          </span>
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-5 rounded border-slate-300 text-blue-600"
          />
        </label>

        {state.message ? (
          <div
            className={`rounded-lg border p-3 text-sm ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <SubmitButton isEditing={isEditing} />
      </div>
    </form>
  );
}

