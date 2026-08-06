import assert from "node:assert/strict";
import test from "node:test";
import { PaymentMethod } from "@prisma/client";
import { toDateKey } from "@/server/cards/invoice";
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

  assert.equal(toDateKey(accountingDate), "2026-06-04");
});

test("contabiliza a compra no crédito na data de vencimento", () => {
  const accountingDate = getTransactionAccountingDate({
    date: new Date(2026, 5, 4),
    paymentMethod: PaymentMethod.CREDIT,
    card,
  });

  assert.equal(toDateKey(accountingDate), "2026-06-20");
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

test("leva para o mês seguinte um vencimento posterior ao fechamento", () => {
  const accountingDate = getTransactionAccountingDate({
    date: new Date(2026, 6, 25),
    paymentMethod: PaymentMethod.CREDIT,
    card: { closingDay: 25, dueDay: 5 },
  });

  assert.equal(toDateKey(accountingDate), "2026-08-05");
});

test("aplica o vencimento correto antes e depois do fechamento", () => {
  const beforeClosing = getTransactionAccountingDate({
    date: new Date(2026, 7, 10),
    paymentMethod: PaymentMethod.CREDIT,
    card: { closingDay: 12, dueDay: 20 },
  });
  const afterClosing = getTransactionAccountingDate({
    date: new Date(2026, 7, 14),
    paymentMethod: PaymentMethod.CREDIT,
    card: { closingDay: 12, dueDay: 20 },
  });

  assert.equal(toDateKey(beforeClosing), "2026-08-20");
  assert.equal(toDateKey(afterClosing), "2026-09-20");
});
