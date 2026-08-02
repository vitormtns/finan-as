import assert from "node:assert/strict";
import test from "node:test";
import { PaymentMethod } from "@prisma/client";
import {
  getTransactionAccountingDate,
  isTransactionInAccountingPeriod,
} from "./accounting-date";

const card = { closingDay: 10, dueDay: 20 };

test("mantém a data original para pagamentos imediatos", () => {
  const accountingDate = getTransactionAccountingDate({
    date: new Date(2026, 5, 4),
    paymentMethod: PaymentMethod.PIX,
    card: null,
  });

  assert.equal(accountingDate.toISOString().slice(0, 10), "2026-06-04");
});

test("contabiliza a compra no crédito na data de fechamento", () => {
  const accountingDate = getTransactionAccountingDate({
    date: new Date(2026, 5, 4),
    paymentMethod: PaymentMethod.CREDIT,
    card,
  });

  assert.equal(accountingDate.toISOString().slice(0, 10), "2026-06-10");
});

test("leva a compra após o fechamento para o mês seguinte", () => {
  const transaction = {
    date: new Date(2026, 5, 11),
    paymentMethod: PaymentMethod.CREDIT,
    card,
  };

  assert.equal(
    isTransactionInAccountingPeriod(
      transaction,
      new Date(2026, 5, 1),
      new Date(2026, 6, 1),
    ),
    false,
  );
  assert.equal(
    isTransactionInAccountingPeriod(
      transaction,
      new Date(2026, 6, 1),
      new Date(2026, 7, 1),
    ),
    true,
  );
});
