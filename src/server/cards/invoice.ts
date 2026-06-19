export type CardInvoiceInputTransaction = {
  id: string;
  amount: number;
  description: string;
  date: Date;
  categoryName: string;
  installmentNumber: number | null;
  totalInstallments: number | null;
};

export type InvoiceCycle = {
  periodStart: Date;
  periodEnd: Date;
  closingDate: Date;
  dueDate: Date;
};

export type CardInvoicePurchase = {
  id: string;
  amount: number;
  description: string;
  date: string;
  categoryName: string;
  installmentLabel: string | null;
};

export type CardInvoiceSummary = InvoiceCycle & {
  total: number;
  purchaseCount: number;
  installmentCount: number;
  purchases: CardInvoicePurchase[];
};

export type FutureInstallmentMonth = {
  month: number;
  year: number;
  total: number;
};

const ONE_DAY_IN_MS = 86_400_000;

export function createDateOnly(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day);
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getLastDayOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function clampDayToMonth(year: number, monthIndex: number, day: number) {
  return Math.min(day, getLastDayOfMonth(year, monthIndex));
}

function addDays(date: Date, days: number) {
  return createDateOnly(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getClosingDate(year: number, monthIndex: number, closingDay: number) {
  return createDateOnly(
    year,
    monthIndex,
    clampDayToMonth(year, monthIndex, closingDay),
  );
}

function getDueDateForClosing(
  closingDate: Date,
  closingDay: number,
  dueDay: number,
) {
  const dueMonthOffset = dueDay <= closingDay ? 1 : 0;
  const dueYear = closingDate.getFullYear();
  const dueMonthIndex = closingDate.getMonth() + dueMonthOffset;

  return createDateOnly(
    dueYear,
    dueMonthIndex,
    clampDayToMonth(dueYear, dueMonthIndex, dueDay),
  );
}

export function getInvoiceCycleByClosingMonth(params: {
  year: number;
  month: number;
  closingDay: number;
  dueDay: number;
}): InvoiceCycle {
  const monthIndex = params.month - 1;
  const closingDate = getClosingDate(
    params.year,
    monthIndex,
    params.closingDay,
  );
  const previousClosingDate = getClosingDate(
    params.year,
    monthIndex - 1,
    params.closingDay,
  );

  return {
    periodStart: addDays(previousClosingDate, 1),
    periodEnd: closingDate,
    closingDate,
    dueDate: getDueDateForClosing(
      closingDate,
      params.closingDay,
      params.dueDay,
    ),
  };
}

export function getInvoiceCycleForReferenceDate(params: {
  referenceDate: Date;
  closingDay: number;
  dueDay: number;
}): InvoiceCycle {
  const referenceDate = createDateOnly(
    params.referenceDate.getFullYear(),
    params.referenceDate.getMonth(),
    params.referenceDate.getDate(),
  );
  const currentMonthClosing = getClosingDate(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    params.closingDay,
  );
  const closingMonthOffset = referenceDate <= currentMonthClosing ? 0 : 1;

  return getInvoiceCycleByClosingMonth({
    year: referenceDate.getFullYear(),
    month: referenceDate.getMonth() + 1 + closingMonthOffset,
    closingDay: params.closingDay,
    dueDay: params.dueDay,
  });
}

export function getNextInvoiceCycle(params: {
  cycle: InvoiceCycle;
  closingDay: number;
  dueDay: number;
}): InvoiceCycle {
  return getInvoiceCycleByClosingMonth({
    year: params.cycle.closingDate.getFullYear(),
    month: params.cycle.closingDate.getMonth() + 2,
    closingDay: params.closingDay,
    dueDay: params.dueDay,
  });
}

export function getInvoiceCycleForTransaction(params: {
  transactionDate: Date;
  closingDay: number;
  dueDay: number;
}): InvoiceCycle {
  const transactionDate = createDateOnly(
    params.transactionDate.getFullYear(),
    params.transactionDate.getMonth(),
    params.transactionDate.getDate(),
  );
  const transactionMonthClosing = getClosingDate(
    transactionDate.getFullYear(),
    transactionDate.getMonth(),
    params.closingDay,
  );
  const closingMonthOffset = transactionDate <= transactionMonthClosing ? 0 : 1;

  return getInvoiceCycleByClosingMonth({
    year: transactionDate.getFullYear(),
    month: transactionDate.getMonth() + 1 + closingMonthOffset,
    closingDay: params.closingDay,
    dueDay: params.dueDay,
  });
}

export function isTransactionInCycle(
  transactionDate: Date,
  cycle: InvoiceCycle,
) {
  const transactionKey = toDateKey(transactionDate);

  return (
    transactionKey >= toDateKey(cycle.periodStart) &&
    transactionKey <= toDateKey(cycle.periodEnd)
  );
}

export function sumInvoice(
  transactions: CardInvoiceInputTransaction[],
  cycle: InvoiceCycle,
): CardInvoiceSummary {
  const purchases = transactions
    .filter((transaction) => isTransactionInCycle(transaction.date, cycle))
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map((transaction) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: toDateKey(transaction.date),
      categoryName: transaction.categoryName,
      installmentLabel:
        transaction.installmentNumber && transaction.totalInstallments
          ? `${transaction.installmentNumber}/${transaction.totalInstallments}`
          : null,
    }));

  return {
    ...cycle,
    total: roundMoney(
      purchases.reduce((sum, transaction) => sum + transaction.amount, 0),
    ),
    purchaseCount: purchases.length,
    installmentCount: purchases.filter((purchase) => purchase.installmentLabel)
      .length,
    purchases,
  };
}

export function groupFutureInstallmentsByMonth(params: {
  transactions: CardInvoiceInputTransaction[];
  afterCycle: InvoiceCycle;
}): FutureInstallmentMonth[] {
  const monthTotals = new Map<string, FutureInstallmentMonth>();
  const firstFutureDate = addDays(params.afterCycle.periodEnd, 1);

  for (const transaction of params.transactions) {
    if (
      !transaction.installmentNumber ||
      !transaction.totalInstallments ||
      transaction.date < firstFutureDate
    ) {
      continue;
    }

    const year = transaction.date.getFullYear();
    const month = transaction.date.getMonth() + 1;
    const key = `${year}-${String(month).padStart(2, "0")}`;
    const current = monthTotals.get(key) ?? { month, year, total: 0 };

    current.total += transaction.amount;
    monthTotals.set(key, current);
  }

  return Array.from(monthTotals.values())
    .map((item) => ({ ...item, total: roundMoney(item.total) }))
    .sort((a, b) => {
      const firstDate = createDateOnly(a.year, a.month - 1, 1);
      const secondDate = createDateOnly(b.year, b.month - 1, 1);

      return firstDate.getTime() - secondDate.getTime();
    });
}

export function getDaysBetween(startDate: Date, endDate: Date) {
  return Math.round((endDate.getTime() - startDate.getTime()) / ONE_DAY_IN_MS);
}
