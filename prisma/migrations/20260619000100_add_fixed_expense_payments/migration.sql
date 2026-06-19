CREATE TYPE "fixed_expense_payment_status" AS ENUM ('paid');

CREATE TABLE "fixed_expense_payments" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "fixedExpenseId" UUID NOT NULL,
  "transactionId" UUID,
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL,
  "paidAt" DATE NOT NULL,
  "status" "fixed_expense_payment_status" NOT NULL DEFAULT 'paid',
  "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "fixed_expense_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fixed_expense_payments_transactionId_key"
  ON "fixed_expense_payments"("transactionId");

CREATE UNIQUE INDEX "fixed_expense_payments_userId_fixedExpenseId_month_year_key"
  ON "fixed_expense_payments"("userId", "fixedExpenseId", "month", "year");

CREATE INDEX "fixed_expense_payments_userId_year_month_idx"
  ON "fixed_expense_payments"("userId", "year", "month");

CREATE INDEX "fixed_expense_payments_fixedExpenseId_year_month_idx"
  ON "fixed_expense_payments"("fixedExpenseId", "year", "month");

ALTER TABLE "fixed_expense_payments"
  ADD CONSTRAINT "fixed_expense_payments_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "profiles"("userId")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fixed_expense_payments"
  ADD CONSTRAINT "fixed_expense_payments_fixedExpenseId_fkey"
  FOREIGN KEY ("fixedExpenseId") REFERENCES "fixed_expenses"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fixed_expense_payments"
  ADD CONSTRAINT "fixed_expense_payments_transactionId_fkey"
  FOREIGN KEY ("transactionId") REFERENCES "transactions"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
