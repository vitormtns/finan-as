import assert from "node:assert/strict";
import test from "node:test";
import {
  assertCanCreateMonthlyPayment,
  calculateMonthlyFixedExpenseStatus,
  getOutstandingFixedExpensesForDashboard,
} from "./rules";

test("calcula gasto fixo pendente quando o vencimento ainda não passou", () => {
  const status = calculateMonthlyFixedExpenseStatus({
    expense: { id: "internet", active: true, dueDay: 20 },
    payments: [],
    month: 6,
    year: 2026,
    currentDay: 10,
  });

  assert.equal(status, "pending");
});

test("calcula gasto fixo vencido quando não foi pago e o vencimento passou", () => {
  const status = calculateMonthlyFixedExpenseStatus({
    expense: { id: "internet", active: true, dueDay: 5 },
    payments: [],
    month: 6,
    year: 2026,
    currentDay: 10,
  });

  assert.equal(status, "overdue");
});

test("calcula gasto fixo pago quando há pagamento no mesmo mês", () => {
  const status = calculateMonthlyFixedExpenseStatus({
    expense: { id: "internet", active: true, dueDay: 5 },
    payments: [{ fixedExpenseId: "internet", month: 6, year: 2026 }],
    month: 6,
    year: 2026,
    currentDay: 10,
  });

  assert.equal(status, "paid");
});

test("impede pagamento duplicado no mesmo mês", () => {
  assert.throws(
    () =>
      assertCanCreateMonthlyPayment({
        fixedExpenseId: "internet",
        month: 6,
        year: 2026,
        payments: [{ fixedExpenseId: "internet", month: 6, year: 2026 }],
      }),
    /já foi pago/,
  );
});

test("filtra para dashboard apenas gastos fixos ativos ainda não pagos", () => {
  const outstanding = getOutstandingFixedExpensesForDashboard({
    expenses: [
      { id: "internet", active: true, dueDay: 20, amount: 120 },
      { id: "academia", active: true, dueDay: 5, amount: 90 },
      { id: "streaming", active: true, dueDay: 15, amount: 50 },
      { id: "inativo", active: false, dueDay: 15, amount: 40 },
    ],
    payments: [{ fixedExpenseId: "streaming", month: 6, year: 2026 }],
    month: 6,
    year: 2026,
    currentDay: 10,
  });

  assert.deepEqual(
    outstanding.map((expense) => expense.id),
    ["internet", "academia"],
  );
});
