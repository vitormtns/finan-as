import { PrismaPg } from "@prisma/adapter-pg";
import {
  AlertSeverity,
  PaymentMethod,
  PrismaClient,
  TransactionType,
} from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const seedUserId = process.env.SEED_USER_ID ?? "local-seed-user";
const currentDate = new Date();
const currentMonth = currentDate.getMonth() + 1;
const currentYear = currentDate.getFullYear();

const categories = [
  {
    name: "Alimentação",
    icon: "utensils",
    color: "#10b981",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Mercado",
    icon: "shopping-basket",
    color: "#22c55e",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Transporte",
    icon: "car",
    color: "#3b82f6",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Moradia",
    icon: "home",
    color: "#8b5cf6",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Lazer",
    icon: "ticket",
    color: "#f59e0b",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Saúde",
    icon: "heart-pulse",
    color: "#ef4444",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Estudos",
    icon: "graduation-cap",
    color: "#6366f1",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Assinaturas",
    icon: "repeat",
    color: "#0ea5e9",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Contas fixas",
    icon: "receipt",
    color: "#64748b",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Roupas",
    icon: "shirt",
    color: "#ec4899",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Outros",
    icon: "more-horizontal",
    color: "#71717a",
    type: TransactionType.EXPENSE,
  },
  {
    name: "Salário",
    icon: "briefcase",
    color: "#14b8a6",
    type: TransactionType.INCOME,
  },
];

async function main() {
  await prisma.profile.upsert({
    where: { userId: seedUserId },
    update: { name: "Usuário de exemplo" },
    create: {
      userId: seedUserId,
      name: "Usuário de exemplo",
    },
  });

  await prisma.transaction.deleteMany({ where: { userId: seedUserId } });
  await prisma.fixedExpense.deleteMany({ where: { userId: seedUserId } });
  await prisma.alert.deleteMany({ where: { userId: seedUserId } });

  const createdCategories = await Promise.all(
    categories.map((category) =>
      prisma.category.upsert({
        where: {
          userId_name_type: {
            userId: seedUserId,
            name: category.name,
            type: category.type,
          },
        },
        update: {
          icon: category.icon,
          color: category.color,
        },
        create: {
          userId: seedUserId,
          ...category,
        },
      }),
    ),
  );

  const categoryByName = new Map(
    createdCategories.map((category) => [category.name, category]),
  );

  const card = await prisma.card.upsert({
    where: {
      userId_name: {
        userId: seedUserId,
        name: "Cartão principal",
      },
    },
    update: {
      color: "#2563eb",
      limitAmount: 3500,
      closingDay: 25,
      dueDay: 5,
    },
    create: {
      userId: seedUserId,
      name: "Cartão principal",
      color: "#2563eb",
      limitAmount: 3500,
      closingDay: 25,
      dueDay: 5,
    },
  });

  await prisma.budget.upsert({
    where: {
      userId_month_year: {
        userId: seedUserId,
        month: currentMonth,
        year: currentYear,
      },
    },
    update: {
      totalLimit: 4200,
    },
    create: {
      userId: seedUserId,
      month: currentMonth,
      year: currentYear,
      totalLimit: 4200,
    },
  });

  const foodCategory = categoryByName.get("Alimentação");
  const transportCategory = categoryByName.get("Transporte");
  const housingCategory = categoryByName.get("Moradia");
  const leisureCategory = categoryByName.get("Lazer");
  const salaryCategory = categoryByName.get("Salário");

  const categoryBudgets = [
    { category: foodCategory, limitAmount: 1200 },
    { category: transportCategory, limitAmount: 600 },
    { category: leisureCategory, limitAmount: 500 },
  ];

  await Promise.all(
    categoryBudgets.map(({ category, limitAmount }) => {
      if (!category) {
        return Promise.resolve();
      }

      return prisma.categoryBudget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId: seedUserId,
            categoryId: category.id,
            month: currentMonth,
            year: currentYear,
          },
        },
        update: { limitAmount },
        create: {
          userId: seedUserId,
          categoryId: category.id,
          month: currentMonth,
          year: currentYear,
          limitAmount,
        },
      });
    }),
  );

  await prisma.transaction.createMany({
    data: [
      {
        userId: seedUserId,
        categoryId: salaryCategory?.id,
        amount: 6800,
        description: "Salário mensal",
        type: TransactionType.INCOME,
        paymentMethod: PaymentMethod.OTHER,
        date: new Date(currentYear, currentMonth - 1, 1),
      },
      {
        userId: seedUserId,
        categoryId: foodCategory?.id,
        amount: 186.42,
        description: "Mercado",
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.DEBIT,
        date: new Date(currentYear, currentMonth - 1, 8),
      },
      {
        userId: seedUserId,
        categoryId: transportCategory?.id,
        amount: 31.8,
        description: "Corrida por app",
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: card.id,
        date: new Date(currentYear, currentMonth - 1, 10),
      },
      {
        userId: seedUserId,
        categoryId: leisureCategory?.id,
        amount: 39.9,
        description: "Streaming",
        type: TransactionType.EXPENSE,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: card.id,
        date: new Date(currentYear, currentMonth - 1, 12),
      },
    ],
  });

  await prisma.fixedExpense.createMany({
    data: [
      {
        userId: seedUserId,
        categoryId: housingCategory?.id,
        description: "Aluguel",
        amount: 1650,
        dueDay: 5,
        paymentMethod: PaymentMethod.PIX,
        active: true,
      },
      {
        userId: seedUserId,
        categoryId: leisureCategory?.id,
        description: "Streaming",
        amount: 39.9,
        dueDay: 12,
        paymentMethod: PaymentMethod.CREDIT,
        cardId: card.id,
        active: true,
      },
      {
        userId: seedUserId,
        categoryId: housingCategory?.id,
        description: "Internet",
        amount: 119.9,
        dueDay: 20,
        paymentMethod: PaymentMethod.BANK_SLIP,
        active: true,
      },
    ],
  });

  await prisma.alert.create({
    data: {
      userId: seedUserId,
      type: "spending_pace",
      title: "Ritmo de gastos acima do ideal",
      message:
        "Você já usou boa parte da meta mensal. Vale revisar gastos variáveis nos próximos dias.",
      severity: AlertSeverity.WARNING,
      month: currentMonth,
      year: currentYear,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
