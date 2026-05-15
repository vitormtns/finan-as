"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  CATEGORY_TYPE_OPTIONS,
  TRANSACTION_TYPE,
  type CategoryFormCategory,
} from "@/lib/finance/types";
import type { CategoryActionState } from "@/server/categories/actions";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/server/categories/actions";

type CategoryFormProps = {
  initialCategory?: CategoryFormCategory | null;
};

const initialState: CategoryActionState = {
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
          : "Salvar categoria"}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-red-600">{errors[0]}</p>;
}

export function CategoryForm({ initialCategory }: CategoryFormProps) {
  const isEditing = Boolean(initialCategory);
  const action = isEditing ? updateCategoryAction : createCategoryAction;
  const [state, formAction] = useActionState(action, initialState);
  const [type, setType] = useState(
    initialCategory?.type ?? TRANSACTION_TYPE.EXPENSE,
  );

  return (
    <form
      action={formAction}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 sm:p-5"
    >
      {initialCategory ? (
        <input type="hidden" name="id" value={initialCategory.id} />
      ) : null}

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-semibold text-slate-700" htmlFor="name">
            Nome
          </label>
          <input
            id="name"
            name="name"
            placeholder="Ex.: Mercado"
            defaultValue={initialCategory?.name ?? ""}
            className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
          <FieldError errors={state.fieldErrors?.name} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
          {CATEGORY_TYPE_OPTIONS.map((item) => (
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
        <FieldError errors={state.fieldErrors?.type} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="text-sm font-semibold text-slate-700"
              htmlFor="icon"
            >
              Ícone
            </label>
            <input
              id="icon"
              name="icon"
              placeholder="Ex.: shopping-basket"
              defaultValue={initialCategory?.icon ?? ""}
              className="mt-2 min-h-12 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.icon} />
          </div>

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
              defaultValue={initialCategory?.color ?? "#2563eb"}
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-slate-50 p-1 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <FieldError errors={state.fieldErrors?.color} />
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
