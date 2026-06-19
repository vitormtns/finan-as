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
      className="btn-primary min-h-12 w-full disabled:cursor-not-allowed disabled:opacity-60"
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
      className="premium-panel p-5 sm:p-6"
    >
      {initialCard ? <input type="hidden" name="id" value={initialCard.id} /> : null}

      <div className="grid gap-4">
        <div>
          <label className="form-label" htmlFor="name">
            Nome do cartão
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ex.: Cartão principal"
            defaultValue={initialCard?.name ?? ""}
            className="form-control mt-2"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="form-label"
              htmlFor="color"
            >
              Cor
            </label>
            <input
              id="color"
              name="color"
              type="color"
              defaultValue={initialCard?.color ?? "#2563eb"}
              className="form-control mt-2 h-12 p-1"
            />
            <FieldError errors={state.fieldErrors?.color} />
          </div>

          <div>
            <label
              className="form-label"
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
              className="form-control mt-2"
            />
            <FieldError errors={state.fieldErrors?.limitAmount} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="form-label"
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
              className="form-control mt-2"
            />
            <FieldError errors={state.fieldErrors?.closingDay} />
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
              placeholder="5"
              defaultValue={initialCard?.dueDay ?? ""}
              className="form-control mt-2"
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

