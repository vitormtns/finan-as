"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { CardActionState } from "@/server/cards/actions";
import { createCardAction, updateCardAction } from "@/server/cards/actions";
import type { EditableCard } from "@/server/cards/types";

type CardFormProps = {
  initialCard?: EditableCard | null;
};

const initialState: CardActionState = {
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
      {pending
        ? "Salvando..."
        : isEditing
          ? "Salvar alterações"
          : "Salvar cartão"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{errors[0]}</p>;
}

export function CardForm({ initialCard }: CardFormProps) {
  const isEditing = Boolean(initialCard);
  const action = isEditing ? updateCardAction : createCardAction;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5"
    >
      {initialCard ? <input type="hidden" name="id" value={initialCard.id} /> : null}

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="name">
            Nome do cartão
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ex.: Cartão principal"
            defaultValue={initialCard?.name ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="color"
            >
              Cor
            </label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue={initialCard?.color ?? "#2563eb"}
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 p-1 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.color} />
          </div>

          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="limitAmount"
            >
              Limite
            </label>
            <input
              id="limitAmount"
              name="limitAmount"
              inputMode="decimal"
              placeholder="Opcional"
              defaultValue={initialCard?.limitAmount ?? ""}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.limitAmount} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="closingDay"
            >
              Dia de fechamento
            </label>
            <input
              id="closingDay"
              name="closingDay"
              type="number"
              min={1}
              max={31}
              placeholder="25"
              defaultValue={initialCard?.closingDay ?? ""}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.closingDay} />
          </div>

          <div>
            <label
              className="text-sm font-semibold text-slate-700"
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
              placeholder="5"
              defaultValue={initialCard?.dueDay ?? ""}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.dueDay} />
          </div>
        </div>

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
