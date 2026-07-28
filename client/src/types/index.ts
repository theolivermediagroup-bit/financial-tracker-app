export type EntryType = "income" | "expense";

export interface Category {
  id: number;
  name: string;
  type: EntryType;
  createdAt: string;
}

export interface Entry {
  id: number;
  categoryId: number;
  amount: number;
  description: string | null;
  occurredOn: string;
  createdAt: string;
  category: {
    id: number;
    name: string;
    type: EntryType;
  };
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  total: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalSavings: number;
  spendingByCategory: CategorySpending[];
}

export interface MonthlyBudget {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
}
