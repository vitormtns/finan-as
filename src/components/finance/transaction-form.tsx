"use client";

import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import { useFormStatus } from "react-dom";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarDays,
  Check,
  CreditCard,
  Landmark,
  ReceiptText,
  Sparkles,
  WalletCards,
} from "lucide-react";
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
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { TransactionActionState } from "@/server/transactions/actions";
import {
  createTransactionAction,
  updateTransactionAction,
} from "@/server/transactions/actions";
import { getInvoiceCycleForTransaction } from "@/server/cards/invoice";

type TransactionFormProps = {
  options: TransactionFormOptions;
  initialTransaction?: EditableTransaction | null;
  initialType?: TransactionType;
  returnTo?: string | null;
  initialCardId?: string | null;
};

const initialState: TransactionActionState = {
  status: "idle",
  message: "",
};

const steps = [
  { title: "Valor", caption: "O movimento" },
  { title: "Contexto", caption: "Como aconteceu" },
  { title: "Revisão", caption: "Últimos detalhes" },
] as const;

function parseAmount(value: string) {
  const normalized = value
    .trim()
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.-]/g, "");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

function SubmitButton({
  isEditing,
  type,
}: {
  isEditing: boolean;
  type: TransactionType;
}) {
  const { pending } = useFormStatus();
  const transactionLabel =
    type === TRANSACTION_TYPE.INCOME ? "receita" : "despesa";

  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-primary min-h-13 flex-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
          Salvando...
        </>
      ) : (
        <>
          <Check size={17} aria-hidden="true" />
          {isEditing ? "Salvar alterações" : `Confirmar ${transactionLabel}`}
        </>
      )}
    </button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="mt-2 text-sm font-semibold text-[var(--app-danger)]">{errors[0]}</p>;
}

function PaymentIcon({ method }: { method: PaymentMethod }) {
  if (method === PAYMENT_METHOD.CREDIT) {
    return <CreditCard size={18} aria-hidden="true" />;
  }

  if (method === PAYMENT_METHOD.CASH) {
    return <Banknote size={18} aria-hidden="true" />;
  }

  if (method === PAYMENT_METHOD.BANK_SLIP) {
    return <ReceiptText size={18} aria-hidden="true" />;
  }

  if (method === PAYMENT_METHOD.DEBIT) {
    return <WalletCards size={18} aria-hidden="true" />;
  }

  return <Landmark size={18} aria-hidden="true" />;
}

export function TransactionForm({
  options,
  initialTransaction,
  initialType = TRANSACTION_TYPE.EXPENSE,
  returnTo,
  initialCardId,
}: TransactionFormProps) {
  const isEditing = Boolean(initialTransaction?.id);
  const action = isEditing ? updateTransactionAction : createTransactionAction;
  const [state, formAction] = useActionState(action, initialState);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<TransactionType>(
    initialTransaction?.type ?? initialType,
  );
  const [amount, setAmount] = useState(initialTransaction?.amount ?? "");
  const [description, setDescription] = useState(
    initialTransaction?.description ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    initialTransaction?.categoryId ?? "",
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialTransaction?.paymentMethod ??
      (initialCardId ? PAYMENT_METHOD.CREDIT : PAYMENT_METHOD.PIX),
  );
  const [cardId, setCardId] = useState(
    initialTransaction?.cardId ?? initialCardId ?? "",
  );
  const [date, setDate] = useState(
    initialTransaction?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [isInstallment, setIsInstallment] = useState(
    initialTransaction?.isInstallment ?? false,
  );
  const [totalInstallments, setTotalInstallments] = useState(
    String(initialTransaction?.totalInstallments ?? 2),
  );

  const categories = useMemo(
    () => options.categories.filter((category) => category.type === type),
    [options.categories, type],
  );
  const selectedCategory = categories.find(
    (category) => category.id === categoryId,
  );
  const selectedCard = options.cards.find((card) => card.id === cardId);
  const numericAmount = parseAmount(amount);
  const showCardField = paymentMethod === PAYMENT_METHOD.CREDIT;
  const showInstallmentFields = showCardField && isInstallment;
  const installmentAmount =
    showInstallmentFields && Number(totalInstallments) > 0
      ? numericAmount / Number(totalInstallments)
      : null;
  const invoiceDueDate = useMemo(() => {
    if (!showCardField || !selectedCard || !date) {
      return null;
    }

    const transactionDate = new Date(`${date}T00:00:00`);

    if (Number.isNaN(transactionDate.getTime())) {
      return null;
    }

    return getInvoiceCycleForTransaction({
      transactionDate,
      closingDay: selectedCard.closingDay ?? 1,
      dueDay: selectedCard.dueDay ?? 10,
    }).dueDate;
  }, [date, selectedCard, showCardField]);

  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) {
      return;
    }

    const fields = Object.keys(state.fieldErrors);

    let errorStep = 2;

    if (fields.some((field) => ["amount", "type"].includes(field))) {
      errorStep = 0;
    } else if (
      fields.some((field) =>
        [
          "categoryId",
          "paymentMethod",
          "cardId",
          "isInstallment",
          "totalInstallments",
        ].includes(field),
      )
    ) {
      errorStep = 1;
    }

    const errorStepTimer = window.setTimeout(() => setStep(errorStep), 0);

    return () => window.clearTimeout(errorStepTimer);
  }, [state]);

  const canAdvance =
    step === 0
      ? numericAmount > 0
      : Boolean(categoryId && (!showCardField || cardId));

  function goToNextStep() {
    if (step < steps.length - 1 && canAdvance) {
      setStep((currentStep) => currentStep + 1);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (
      event.key === "Enter" &&
      step < steps.length - 1 &&
      event.target instanceof HTMLInputElement &&
      event.target.type !== "radio" &&
      event.target.type !== "checkbox"
    ) {
      event.preventDefault();
      goToNextStep();
    }
  }

  return (
    <form
      action={formAction}
      onKeyDown={handleKeyDown}
      className="grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-start"
    >
      {initialTransaction?.id ? (
        <input type="hidden" name="id" value={initialTransaction.id} />
      ) : null}
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}

      <section className="premium-panel overflow-hidden">
        <div className="border-b border-[var(--app-border)] p-4 sm:p-5">
          <ol className="grid grid-cols-3 gap-2" aria-label="Etapas do cadastro">
            {steps.map((item, index) => {
              const isActive = index === step;
              const isComplete = index < step;

              return (
                <li key={item.title}>
                  <button
                    type="button"
                    onClick={() => index <= step && setStep(index)}
                    disabled={index > step}
                    className={`flex w-full items-center gap-2 rounded-2xl p-2.5 text-left transition sm:p-3 ${
                      isActive
                        ? "bg-[var(--app-primary)] text-white shadow-[0_12px_28px_rgb(17_25_20_/_0.18)]"
                        : isComplete
                          ? "bg-[var(--app-accent-soft)] text-[var(--app-accent)]"
                          : "text-[var(--app-ink-faint)]"
                    }`}
                  >
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${
                        isActive
                          ? "bg-white/12"
                          : isComplete
                            ? "bg-white/70"
                            : "bg-black/[0.045]"
                      }`}
                    >
                      {isComplete ? <Check size={14} aria-hidden="true" /> : index + 1}
                    </span>
                    <span className="hidden min-w-0 sm:block">
                      <strong className="block truncate text-xs">{item.title}</strong>
                      <small className={`mt-0.5 block truncate text-[0.62rem] ${isActive ? "text-white/48" : "opacity-60"}`}>
                        {item.caption}
                      </small>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="p-5 sm:p-7">
          {initialTransaction?.isInstallment ? (
            <div className="alert-warning mb-5 p-4 text-sm leading-6">
              Você está editando somente a parcela {initialTransaction.installmentNumber}/
              {initialTransaction.totalInstallments}. As demais serão mantidas.
            </div>
          ) : null}

          <div hidden={step !== 0} className="soft-pop">
            <p className="section-eyebrow">Comece pelo essencial</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-ink)] sm:text-3xl">
              Quanto movimentou?
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-[1.25rem] bg-[var(--app-surface-muted)] p-1.5">
              {TRANSACTION_TYPE_OPTIONS.map((item) => (
                <label
                  className={`flex min-h-12 items-center justify-center rounded-[1rem] text-sm font-extrabold transition ${
                    type === item.value
                      ? item.value === TRANSACTION_TYPE.EXPENSE
                        ? "bg-[var(--app-primary)] text-white shadow-lg"
                        : "bg-[var(--app-accent)] text-white shadow-lg"
                      : "text-[var(--app-ink-muted)]"
                  }`}
                  key={item.value}
                >
                  <input
                    type="radio"
                    name="type"
                    value={item.value}
                    checked={type === item.value}
                    onChange={() => {
                      setType(item.value);
                      setCategoryId("");
                    }}
                    className="sr-only"
                  />
                  {item.label}
                </label>
              ))}
            </div>

            <div className="mt-8">
              <label className="sr-only" htmlFor="amount">
                Valor
              </label>
              <div className="flex items-baseline border-b border-[var(--app-border-strong)] pb-3 focus-within:border-[var(--app-accent)]">
                <span className="mr-3 text-lg font-bold text-[var(--app-ink-faint)]">R$</span>
                <input
                  id="amount"
                  name="amount"
                  inputMode="decimal"
                  autoFocus={!isEditing}
                  placeholder="0,00"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-[clamp(3.2rem,11vw,6rem)] font-semibold leading-none tracking-[-0.075em] text-[var(--app-ink)] outline-none placeholder:text-[var(--app-ink)]/12"
                />
              </div>
              <p className="mt-3 text-sm text-[var(--app-ink-muted)]">
                Use vírgula para informar os centavos.
              </p>
              <FieldError errors={state.fieldErrors?.amount} />
            </div>
          </div>

          <div hidden={step !== 1} className="soft-pop">
            <p className="section-eyebrow">Dê contexto ao valor</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-ink)] sm:text-3xl">
              Como aconteceu?
            </h2>

            <fieldset className="mt-7">
              <legend className="form-label">Categoria</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className={`flex min-h-14 items-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                      categoryId === category.id
                        ? "border-[var(--app-accent)] bg-[var(--app-accent-soft)] text-[var(--app-ink)] shadow-sm"
                        : "border-[var(--app-border)] bg-black/[0.018] text-[var(--app-ink-muted)] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="categoryId"
                      value={category.id}
                      checked={categoryId === category.id}
                      onChange={() => setCategoryId(category.id)}
                      className="sr-only"
                    />
                    <span
                      className="size-2.5 shrink-0 rounded-full shadow-sm"
                      style={{ backgroundColor: category.color ?? "#64748b" }}
                    />
                    <span className="truncate">{category.name}</span>
                  </label>
                ))}
              </div>
              <FieldError errors={state.fieldErrors?.categoryId} />
            </fieldset>

            <fieldset className="mt-7">
              <legend className="form-label">Forma de pagamento</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <label
                    key={method.value}
                    className={`flex min-h-16 items-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${
                      paymentMethod === method.value
                        ? "border-[var(--app-primary)] bg-[var(--app-primary)] text-white shadow-lg"
                        : "border-[var(--app-border)] bg-black/[0.018] text-[var(--app-ink-muted)] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={paymentMethod === method.value}
                      onChange={() => {
                        setPaymentMethod(method.value);

                        if (method.value !== PAYMENT_METHOD.CREDIT) {
                          setIsInstallment(false);
                        }
                      }}
                      className="sr-only"
                    />
                    <PaymentIcon method={method.value} />
                    {paymentMethodLabels[method.value]}
                  </label>
                ))}
              </div>
              <FieldError errors={state.fieldErrors?.paymentMethod} />
            </fieldset>

            {showCardField ? (
              <fieldset className="mt-7 soft-pop">
                <legend className="form-label">Cartão</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {options.cards.map((card) => (
                    <label
                      key={card.id}
                      className={`relative min-h-24 overflow-hidden rounded-[1.25rem] border p-4 text-white transition ${
                        cardId === card.id
                          ? "scale-[1.015] border-white/60 shadow-[0_16px_32px_rgb(17_25_20_/_0.2)]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${card.color ?? "#315f52"}, #111914)`,
                      }}
                    >
                      <input
                        type="radio"
                        name="cardId"
                        value={card.id}
                        checked={cardId === card.id}
                        onChange={() => setCardId(card.id)}
                        className="sr-only"
                      />
                      <CreditCard className="absolute right-4 top-4 text-white/42" size={20} aria-hidden="true" />
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-white/42">Meu Mês</span>
                      <strong className="mt-5 block text-base">{card.name}</strong>
                    </label>
                  ))}
                </div>
                <FieldError errors={state.fieldErrors?.cardId} />
              </fieldset>
            ) : null}

            {showCardField ? (
              <div className="mt-4 rounded-[1.25rem] border border-[var(--app-border)] bg-black/[0.018] p-4 soft-pop">
                <label className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block text-sm font-extrabold text-[var(--app-ink)]">Compra parcelada</span>
                    <span className="mt-1 block text-xs text-[var(--app-ink-muted)]">Distribui o valor entre os próximos meses.</span>
                  </span>
                  <input
                    type="checkbox"
                    name="isInstallment"
                    checked={isInstallment}
                    onChange={(event) => setIsInstallment(event.target.checked)}
                    className="size-5 accent-[var(--app-accent)]"
                  />
                </label>

                {showInstallmentFields ? (
                  <div className="mt-4 border-t border-[var(--app-border)] pt-4">
                    <label className="form-label" htmlFor="totalInstallments">Quantidade de parcelas</label>
                    <input
                      id="totalInstallments"
                      name="totalInstallments"
                      type="number"
                      min={2}
                      max={48}
                      value={totalInstallments}
                      onChange={(event) => setTotalInstallments(event.target.value)}
                      className="form-control mt-2"
                    />
                    <FieldError errors={state.fieldErrors?.totalInstallments} />
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div hidden={step !== 2} className="soft-pop">
            <p className="section-eyebrow">Quase pronto</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--app-ink)] sm:text-3xl">
              Revise e confirme
            </h2>

            <div className="mt-7 grid gap-5">
              <div>
                <label className="form-label" htmlFor="description">Nome ou descrição</label>
                <input
                  id="description"
                  name="description"
                  placeholder="Ex.: mercado, almoço, salário"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="form-control mt-2"
                />
                <FieldError errors={state.fieldErrors?.description} />
              </div>

              <div>
                <label className="form-label" htmlFor="date">Data</label>
                <div className="relative mt-2">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--app-ink-faint)]" size={17} aria-hidden="true" />
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="form-control pl-11"
                  />
                </div>
                <FieldError errors={state.fieldErrors?.date} />
              </div>
            </div>
          </div>

          {state.message ? (
            <div
              className={`mt-5 rounded-2xl border p-4 text-sm font-semibold ${
                state.status === "success"
                  ? "alert-success soft-pop"
                  : "alert-danger"
              }`}
            >
              {state.message}
            </div>
          ) : null}

          <div className="mt-8 flex gap-2 border-t border-[var(--app-border)] pt-5">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((currentStep) => currentStep - 1)}
                className="btn-secondary min-h-13"
              >
                <ArrowLeft size={17} aria-hidden="true" />
                Voltar
              </button>
            ) : null}

            {step < steps.length - 1 ? (
              <button
                type="button"
                onClick={goToNextStep}
                disabled={!canAdvance}
                className="btn-primary min-h-13 flex-1 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Continuar
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            ) : (
              <SubmitButton isEditing={isEditing} type={type} />
            )}
          </div>
        </div>
      </section>

      <aside className="lg:sticky lg:top-28">
        <div
          className={`relative min-h-[31rem] overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_30px_80px_rgb(17_25_20_/_0.24)] transition-colors duration-500 sm:p-7 ${
            type === TRANSACTION_TYPE.INCOME ? "bg-[#176a4a]" : "bg-[var(--app-primary)]"
          }`}
        >
          <div
            className="ambient-orb pointer-events-none absolute -right-28 -top-24 size-72 rounded-full blur-[70px]"
            style={{ backgroundColor: selectedCard?.color ?? "#35b779" }}
          />
          <div className="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-white/[0.08] blur-3xl" />

          <div className="relative flex h-full min-h-[27rem] flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-xs font-extrabold text-white/68">
                <Sparkles size={14} aria-hidden="true" />
                Prévia em tempo real
              </span>
              <span className="text-xs font-bold text-white/38">Etapa {step + 1}/3</span>
            </div>

            <div className="my-12">
              <p className="text-sm font-semibold text-white/48">
                {type === TRANSACTION_TYPE.INCOME ? "Você vai registrar" : "Você está registrando"}
              </p>
              <strong className="mt-3 block text-[clamp(3.2rem,9vw,5.5rem)] font-semibold leading-[0.86] tracking-[-0.075em] tabular-nums">
                {formatCurrency(numericAmount)}
              </strong>
              <p className="mt-5 text-base font-bold text-white/82">
                {description || selectedCategory?.name || (type === TRANSACTION_TYPE.INCOME ? "Nova receita" : "Nova despesa")}
              </p>
              <p className="mt-1 text-sm text-white/42">
                {selectedCategory?.name ?? "Escolha uma categoria"} · {paymentMethodLabels[paymentMethod]}
              </p>
            </div>

            <div className="space-y-2">
              {showCardField && selectedCard ? (
                <div className="soft-pop rounded-[1.25rem] border border-white/10 bg-white/[0.075] p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-white/48">
                      <CreditCard size={15} aria-hidden="true" />
                      {selectedCard.name}
                    </span>
                    <span className="size-2 rounded-full bg-[var(--app-accent-bright)] shadow-[0_0_14px_rgb(68_212_140_/_0.8)]" />
                  </div>
                  <strong className="mt-3 block text-lg font-extrabold">
                    {invoiceDueDate
                      ? `Entra na fatura de ${formatDate(invoiceDueDate)}`
                      : "Informe a data para calcular a fatura"}
                  </strong>
                  {installmentAmount !== null ? (
                    <p className="mt-2 text-xs text-white/48">
                      {totalInstallments} parcelas de aproximadamente {formatCurrency(installmentAmount)}
                    </p>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-white/36">Impacto</p>
                  <p className="mt-2 text-sm leading-6 text-white/64">
                    {type === TRANSACTION_TYPE.INCOME
                      ? "Essa entrada aumenta o saldo disponível do mês."
                      : "O valor será considerado no mês da data informada."}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-white/8 bg-black/10 p-4">
                <span className="inline-flex items-center gap-2 text-sm text-white/46">
                  <CalendarDays size={15} aria-hidden="true" />
                  Data do movimento
                </span>
                <strong className="text-sm">{date ? formatDate(new Date(`${date}T00:00:00`)) : "—"}</strong>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </form>
  );
}
