import assert from "node:assert/strict";
import test from "node:test";
import { calculateMonthlyCashFlow } from "./cash-flow";

test("calcula o saldo depois dos gastos e das contas pendentes", () => {
  const result = calculateMonthlyCashFlow({
    totalIncome: 5_000,
    totalExpenses: 2_200,
    remainingFixedExpensesTotal: 1_300,
  });

  assert.deepEqual(result, {
    balanceAfterExpenses: 2_800,
    totalCommitted: 3_500,
    balanceAfterCommitments: 1_500,
  });
});

test("indica quanto falta quando as entradas não cobrem os compromissos", () => {
  const result = calculateMonthlyCashFlow({
    totalIncome: 2_500,
    totalExpenses: 2_000,
    remainingFixedExpensesTotal: 900,
  });

  assert.equal(result.balanceAfterCommitments, -400);
});
