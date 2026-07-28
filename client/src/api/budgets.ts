import { apiFetch } from "./client";
import type { MonthlyBudget } from "../types";

export function getBudget(month: string): Promise<MonthlyBudget> {
  return apiFetch(`/api/budgets/${month}`);
}

export function setBudget(month: string, amount: number): Promise<MonthlyBudget> {
  return apiFetch(`/api/budgets/${month}`, {
    method: "PUT",
    body: JSON.stringify({ amount }),
  });
}
