import assert from "node:assert/strict";
import test from "node:test";
import { calculateMonthlyProjection } from "./projection";

test("evita projeção absurda por gasto concentrado no primeiro dia", () => {
  const projection = calculateMonthlyProjection({
    currentExpenses: 1_000,
    currentDay: 1,
    daysInMonth: 30,
    historicalMonthlyExpenses: [3_000, 3_100, 3_200],
  });

  assert.equal(projection.currentPaceProjection, 30_000);
  assert.ok(projection.projectedMonthTotal >= 3_200);
  assert.ok(projection.projectedMonthTotal < 4_000);
});

test("aumenta o peso do ritmo atual conforme o mês avança", () => {
  const projection = calculateMonthlyProjection({
    currentExpenses: 3_000,
    currentDay: 25,
    daysInMonth: 30,
    historicalMonthlyExpenses: [3_000, 3_100, 3_200],
  });

  assert.ok(projection.projectedMonthTotal > 3_400);
  assert.ok(projection.projectedMonthTotal <= 3_600);
  assert.equal(projection.confidence, "high");
});

test("amortece mês histórico fora do padrão", () => {
  const projection = calculateMonthlyProjection({
    currentExpenses: 1_500,
    currentDay: 15,
    daysInMonth: 30,
    historicalMonthlyExpenses: [3_000, 12_000, 3_200],
  });

  assert.ok((projection.historicalAverage ?? 0) < 4_000);
});

test("nunca projeta abaixo do que já foi gasto e comprometido", () => {
  const projection = calculateMonthlyProjection({
    currentExpenses: 4_000,
    currentDay: 5,
    daysInMonth: 30,
    historicalMonthlyExpenses: [3_000, 3_100, 3_200],
    knownRemainingExpenses: 1_200,
  });

  assert.equal(projection.projectedMonthTotal >= 5_200, true);
});

test("usa uma janela mínima enquanto ainda não há histórico", () => {
  const projection = calculateMonthlyProjection({
    currentExpenses: 1_000,
    currentDay: 1,
    daysInMonth: 30,
    historicalMonthlyExpenses: [],
  });

  assert.equal(projection.projectedMonthTotal, 3_000);
  assert.equal(projection.confidence, "learning");
});
