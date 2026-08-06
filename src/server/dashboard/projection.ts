export type ProjectionConfidence = "learning" | "medium" | "high";

export type MonthlyProjection = {
  dailyAverage: number;
  currentPaceProjection: number;
  historicalAverage: number | null;
  historicalMonthsUsed: number;
  projectedMonthTotal: number;
  confidence: ProjectionConfidence;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getMedian(values: number[]) {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[middleIndex - 1] + sortedValues[middleIndex]) / 2;
  }

  return sortedValues[middleIndex];
}

function getHistoricalBaseline(values: number[]) {
  const median = getMedian(values);
  const minimumExpected = median * 0.65;
  const maximumExpected = median * 1.35;
  const stabilizedValues = values.map((value) =>
    Math.min(Math.max(value, minimumExpected), maximumExpected),
  );
  const totalWeight = stabilizedValues.reduce(
    (sum, _value, index) => sum + index + 1,
    0,
  );
  const weightedAverage = stabilizedValues.reduce(
    (sum, value, index) => sum + value * (index + 1),
    0,
  ) / totalWeight;

  return weightedAverage * 0.65 + median * 0.35;
}

export function calculateMonthlyProjection(params: {
  currentExpenses: number;
  currentDay: number;
  daysInMonth: number;
  historicalMonthlyExpenses: number[];
  knownRemainingExpenses?: number;
}): MonthlyProjection {
  const daysInMonth = Math.max(params.daysInMonth, 1);
  const currentDay = Math.min(Math.max(params.currentDay, 1), daysInMonth);
  const currentExpenses = Math.max(params.currentExpenses, 0);
  const knownRemainingExpenses = Math.max(
    params.knownRemainingExpenses ?? 0,
    0,
  );
  const historicalValues = params.historicalMonthlyExpenses.filter(
    (value) => Number.isFinite(value) && value > 0,
  );
  const dailyAverage = currentExpenses / currentDay;
  const historicalAverage = historicalValues.length
    ? getHistoricalBaseline(historicalValues)
    : null;

  let currentPaceProjection: number;
  let estimatedTotal: number;

  if (historicalAverage === null) {
    const minimumObservationWindow = Math.min(10, daysInMonth);
    const observedDays = Math.max(currentDay, minimumObservationWindow);

    currentPaceProjection = (currentExpenses / observedDays) * daysInMonth;
    estimatedTotal = currentPaceProjection;
  } else {
    currentPaceProjection = dailyAverage * daysInMonth;

    const elapsedRatio = currentDay / daysInMonth;
    const currentMonthWeight = Math.min(
      Math.max(Math.pow(elapsedRatio, 1.5) * 1.15, 0.02),
      0.88,
    );

    estimatedTotal =
      historicalAverage * (1 - currentMonthWeight) +
      currentPaceProjection * currentMonthWeight;
  }

  const committedFloor = currentExpenses + knownRemainingExpenses;
  const projectedMonthTotal = Math.max(estimatedTotal, committedFloor);
  const confidence: ProjectionConfidence =
    historicalValues.length >= 3 && currentDay >= 15
      ? "high"
      : historicalValues.length >= 2 || currentDay >= 10
        ? "medium"
        : "learning";

  return {
    dailyAverage: roundMoney(dailyAverage),
    currentPaceProjection: roundMoney(currentPaceProjection),
    historicalAverage:
      historicalAverage === null ? null : roundMoney(historicalAverage),
    historicalMonthsUsed: historicalValues.length,
    projectedMonthTotal: roundMoney(projectedMonthTotal),
    confidence,
  };
}
