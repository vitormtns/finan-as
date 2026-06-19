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
      className="min-h-12 w-full rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
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
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5"
    >
      {initialTransaction?.id ? (
        <input type="hidden" name="id" value={initialTransaction.id} />
      ) : null}

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="amount">
            Valor
          </label>
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            placeholder="0,00"
            defaultValue={initialTransaction?.amount ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <FieldError errors={state.fieldErrors?.amount} />
        </div>

        <div>
          <label
            className="text-sm font-semibold text-slate-700"
            htmlFor="description"
          >
            Descrição
          </label>
          <input
            id="description"
            name="description"
            placeholder="Ex.: mercado, almoço, salário"
            defaultValue={initialTransaction?.description ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <FieldError errors={state.fieldErrors?.description} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {TRANSACTION_TYPE_OPTIONS.map((item) => (
            <label
              className={`flex min-h-10 items-center justify-center rounded-md text-sm font-semibold transition ${
                type === item.value
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-500"
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
            className="text-sm font-semibold text-slate-700"
            htmlFor="categoryId"
          >
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={initialTransaction?.categoryId ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
            className="text-sm font-semibold text-slate-700"
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
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
            <label className="text-sm font-semibold text-slate-700" htmlFor="cardId">
              Cartão
            </label>
            <select
              id="cardId"
              name="cardId"
              defaultValue={initialTransaction?.cardId ?? ""}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
          <label className="text-sm font-semibold text-slate-700" htmlFor="date">
            Data
          </label>
          <input
            id="date"
            name="date"
            type="date"
            defaultValue={
              initialTransaction?.date ?? new Date().toISOString().slice(0, 10)
            }
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <FieldError errors={state.fieldErrors?.date} />
        </div>

        {showCardField ? (
          <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <span>
              <span className="block text-sm font-semibold text-slate-800">
                Compra parcelada
              </span>
              <span className="mt-1 block text-xs text-slate-500">
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
              className="text-sm font-semibold text-slate-700"
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
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
