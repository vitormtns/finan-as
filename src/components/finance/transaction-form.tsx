"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  PAYMENT_METHOD,
  PAYMENT_METHOD_OPTIONS,
  TRANSACTION_TYPE,
  TRANSACTION_TYPE_OPTIONS,
  type EditableTransaction,
  type PaymentMethod,
  type TransactionFormOptions,
  type TransactionType,
  paymentMethodLabels,
} from "@/lib/finance/types";
import type { TransactionActionState } from "@/server/transactions/actions";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/server/transactions/actions";

type TransactionFormProps = {
  options: TransactionFormOptions;
  initialTransaction?: EditableTransaction | null;
};

const initialState: TransactionActionState = {
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
      {pending ? "Salvando..." : isEditing ? "Salvar alterações" : "Salvar gasto"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{errors[0]}</p>;
}

export function TransactionForm({
  options,
  initialTransaction,
}: TransactionFormProps) {
  const isEditing = Boolean(initialTransaction?.id);
  const action = isEditing ? updateTransactionAction : createTransactionAction;
  const [state, formAction] = useActionState(action, initialState);
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? TRANSACTION_TYPE.EXPENSE,
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialTransaction?.paymentMethod ?? PAYMENT_METHOD.PIX,
  );
  const [isInstallment, setIsInstallment] = useState(
    initialTransaction?.isInstallment ?? false,
  );

  const categories = useMemo(
    () => options.categories.filter((category) => category.type === type),
    [options.categories, type],
  );
  const showCardField = paymentMethod === PAYMENT_METHOD.CREDIT;
  const showInstallmentFields = showCardField && isInstallment;

  return (
    <form
      action={formAction}
      className="premium-panel p-5 sm:p-6"
    >
      {initialTransaction?.id ? (
        <input type="hidden" name="id" value={initialTransaction.id} />
      ) : null}

      <div className="grid gap-4">
        <div>
          <label className="form-label" htmlFor="amount">
            Valor
          </label>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={initialTransaction?.amount ?? ""}
            className="form-control mt-2 text-base font-bold"
          />
          <FieldError errors={state.fieldErrors?.amount} />
        </div>

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
            placeholder="Ex.: mercado, almoço, salário"
            defaultValue={initialTransaction?.description ?? ""}
            className="form-control mt-2"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[var(--app-surface-muted)] p-1.5">
          {TRANSACTION_TYPE_OPTIONS.map((item) => (
            <label
              className={`flex min-h-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                type === item.value
                  ? "bg-white text-[var(--app-ink)] shadow-[0_8px_18px_rgb(16_25_35_/_0.08)]"
                  : "text-[var(--app-ink-muted)]"
              }`}
              key={item.value}
            >
              <input
                type="radio"
                name="type"
                value={item.value}
                checked={type === item.value}
                onChange={() => setType(item.value)}
                className="sr-only"
              />
              {item.label}
            </label>
          ))}
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
            defaultValue={initialTransaction?.categoryId ?? ""}
            className="form-control mt-2"
          >
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
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
            onChange={(event) => {
              const nextPaymentMethod = event.target.value as PaymentMethod;
              setPaymentMethod(nextPaymentMethod);

              if (nextPaymentMethod !== PAYMENT_METHOD.CREDIT) {
                setIsInstallment(false);
              }
            }}
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
            <label className="form-label" htmlFor="cardId">
              Cartão
            </label>
            <select
              id="cardId"
              name="cardId"
              defaultValue={initialTransaction?.cardId ?? ""}
              className="form-control mt-2"
            >
              <option value="">Selecione um cartão</option>
              {options.cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
            <FieldError errors={state.fieldErrors?.cardId} />
          </div>
        ) : null}

        <div>
          <label className="form-label" htmlFor="date">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={
              initialTransaction?.date ?? new Date().toISOString().slice(0, 10)
            }
            className="form-control mt-2"
          />
          <FieldError errors={state.fieldErrors?.date} />
        </div>

        {showCardField ? (
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/64 p-4 shadow-sm">
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Compra parcelada
              </span>
              <span className="mt-1 block text-xs text-[var(--app-ink-muted)]">
                Cria uma parcela por mês automaticamente.
              </span>
            </span>
            <input
              type="checkbox"
              name="isInstallment"
              checked={isInstallment}
              onChange={(event) => setIsInstallment(event.target.checked)}
              className="size-5 rounded border-slate-300 text-blue-600"
            />
          </label>
        ) : null}

        {showInstallmentFields ? (
          <div>
            <label
              className="form-label"
              htmlFor="totalInstallments"
            >
              Quantidade de parcelas
            </label>
            <input
              id="totalInstallments"
              name="totalInstallments"
              type="number"
              min={2}
              max={48}
              defaultValue={initialTransaction?.totalInstallments ?? 2}
              className="form-control mt-2"
            />
            <FieldError errors={state.fieldErrors?.totalInstallments} />
          </div>
        ) : null}

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

