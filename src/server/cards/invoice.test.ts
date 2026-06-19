import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getInvoiceCycleForReferenceDate,
  getInvoiceCycleForTransaction,
  groupFutureInstallmentsByMonth,
  sumInvoice,
  toDateKey,
} from "./invoice";

describe("ciclo de fatura do cartão", () => {
  it("mantém compra feita no dia do fechamento na fatura atual", () => {
    const cycle = getInvoiceCycleForTransaction({
      transactionDate: new Date(2026, 5, 10),
      closingDay: 10,
      dueDay: 20,
    });

    assert.equal(toDateKey(cycle.closingDate), "2026-06-10");
    assert.equal(toDateKey(cycle.dueDate), "2026-06-20");
    assert.equal(toDateKey(cycle.periodStart), "2026-05-11");
    assert.equal(toDateKey(cycle.periodEnd), "2026-06-10");
  });

  it("joga compra após o fechamento para a próxima fatura", () => {
    const cycle = getInvoiceCycleForTransaction({
      transactionDate: new Date(2026, 5, 11),
      closingDay: 10,
      dueDay: 20,
    });

    assert.equal(toDateKey(cycle.closingDate), "2026-07-10");
    assert.equal(toDateKey(cycle.dueDate), "2026-07-20");
    assert.equal(toDateKey(cycle.periodStart), "2026-06-11");
  });

  it("calcula fatura aberta após o fechamento do mês", () => {
    const cycle = getInvoiceCycleForReferenceDate({
      referenceDate: new Date(2026, 5, 19),
      closingDay: 10,
      dueDay: 20,
    });

    assert.equal(toDateKey(cycle.closingDate), "2026-07-10");
    assert.equal(toDateKey(cycle.periodStart), "2026-06-11");
  });

  it("ajusta fechamento e vencimento em meses curtos", () => {
    const cycle = getInvoiceCycleForTransaction({
      transactionDate: new Date(2026, 1, 28),
      closingDay: 31,
      dueDay: 5,
    });

    assert.equal(toDateKey(cycle.closingDate), "2026-02-28");
    assert.equal(toDateKey(cycle.dueDate), "2026-03-05");
  });

  it("soma fatura atual e próxima fatura pelo ciclo", () => {
    const currentCycle = getInvoiceCycleForReferenceDate({
      referenceDate: new Date(2026, 5, 5),
      closingDay: 10,
      dueDay: 20,
    });
    const nextCycle = getInvoiceCycleForTransaction({
      transactionDate: new Date(2026, 5, 11),
      closingDay: 10,
      dueDay: 20,
    });
    const transactions = [
      {
        id: "antes",
        amount: 100,
        description: "Antes do fechamento",
        date: new Date(2026, 5, 9),
        categoryName: "Mercado",
        installmentNumber: null,
        totalInstallments: null,
      },
      {
        id: "depois",
        amount: 200,
        description: "Depois do fechamento",
        date: new Date(2026, 5, 11),
        categoryName: "Casa",
        installmentNumber: 2,
        totalInstallments: 5,
      },
    ];

    assert.equal(sumInvoice(transactions, currentCycle).total, 100);
    assert.equal(sumInvoice(transactions, nextCycle).total, 200);
    assert.equal(sumInvoice(transactions, nextCycle).installmentCount, 1);
  });

  it("agrupa parcelas futuras por mês", () => {
    const currentCycle = getInvoiceCycleForReferenceDate({
      referenceDate: new Date(2026, 5, 5),
      closingDay: 10,
      dueDay: 20,
    });
    const installments = groupFutureInstallmentsByMonth({
      afterCycle: currentCycle,
      transactions: [
        {
          id: "julho",
          amount: 120,
          description: "Parcela",
          date: new Date(2026, 6, 3),
          categoryName: "Casa",
          installmentNumber: 2,
          totalInstallments: 5,
        },
        {
          id: "agosto",
          amount: 90,
          description: "Parcela",
          date: new Date(2026, 7, 3),
          categoryName: "Casa",
          installmentNumber: 3,
          totalInstallments: 5,
        },
      ],
    });

    assert.deepEqual(installments, [
      { month: 7, year: 2026, total: 120 },
      { month: 8, year: 2026, total: 90 },
    ]);
  });
});
