export type GoalCategory = {
  id: string;
  name: string;
  color: string | null;
  limitAmount: number | null;
  spentAmount: number;
  percentageUsed: number | null;
};

export type GoalsPageData = {
  month: number;
  year: number;
  totalLimit: number | null;
  totalCategoryLimits: number;
  difference: number | null;
  categories: GoalCategory[];
};
