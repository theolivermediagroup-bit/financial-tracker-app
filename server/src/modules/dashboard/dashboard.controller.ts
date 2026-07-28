import { NextFunction, Request, Response } from "express";
import { getTotals, getSpendingByCategory, getSavingsTotal } from "./dashboard.repository";

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const totals = await getTotals();
    const spendingByCategory = await getSpendingByCategory();
    const savingsTotal = await getSavingsTotal();

    const totalIncome = Number(totals.total_income);
    const totalExpenses = Number(totals.total_expenses);

    res.status(200).json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      totalSavings: Number(savingsTotal),
      spendingByCategory: spendingByCategory.map((row) => ({
        categoryId: row.category_id,
        categoryName: row.category_name,
        total: Number(row.total),
      })),
    });
  } catch (err) {
    next(err);
  }
}
