import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateMonthlyCashFlow,
  sumCurrentCardInvoices,
} from "./cash-flow";

test("calcula o saldo depois dos gastos e das contas pendentes", () => {
  const result = calculateMonthlyCashFlow({
    totalIncome: 5_000,
    paidExpensesTotal: 2_200,
    remainingFixedExpensesTotal: 1_300,
    cardInvoicesTotal: 0,
  });

  assert.deepEqual(result, {
    balanceAfterExpenses: 2_800,
    outstandingBillsTotal: 1_300,
    totalCommitted: 3_500,
    balanceAfterCommitments: 1_500,
  });
});

test("indica quanto falta quando as entradas não cobrem os compromissos", () => {
  const result = calculateMonthlyCashFlow({
    totalIncome: 2_500,
    paidExpensesTotal: 2_000,
    remainingFixedExpensesTotal: 900,
    cardInvoicesTotal: 0,
  });

  assert.equal(result.balanceAfterCommitments, -400);
});

test("inclui faturas de cartão nas contas a pagar sem contar a compra duas vezes", () => {
  const result = calculateMonthlyCashFlow({
    totalIncome: 6_000,
    paidExpensesTotal: 1_200,
    remainingFixedExpensesTotal: 800,
    cardInvoicesTotal: 1_500,
  });

  assert.deepEqual(result, {
    balanceAfterExpenses: 4_800,
    outstandingBillsTotal: 2_300,
    totalCommitted: 3_500,
    balanceAfterCommitments: 2_500,
  });
});

test("soma somente a fatura vigente dos cartões", () => {
  const total = sumCurrentCardInvoices([
    { currentInvoiceTotal: 750, nextInvoiceTotal: 400 },
    { currentInvoiceTotal: 250, nextInvoiceTotal: 900 },
  ]);

  assert.equal(total, 1_000);
});
