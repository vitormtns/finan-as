export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatMonth(date: Date) {
  const month = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return month.charAt(0).toUpperCase() + month.slice(1);
}

export function formatDate(date: Date | string) {
  const parsedDate = typeof date === "string" ? new Date(`${date}T00:00:00`) : date;

  return new Intl.DateTimeFormat("pt-BR").format(parsedDate);
}

export function parseMonthFilter(value?: string) {
  const now = new Date();
  const fallback = {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    inputValue: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
  };

  if (!value || !/^\d{4}-\d{2}$/.test(value)) {
    return fallback;
  }

  const [year, month] = value.split("-").map(Number);

  if (month < 1 || month > 12 || year < 2020 || year > 2100) {
    return fallback;
  }

  return { month, year, inputValue: value };
}
