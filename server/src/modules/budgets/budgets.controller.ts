import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { getBudgetForMonth, upsertBudgetForMonth, getMonthlySpend } from "./budgets.repository";

const MONTH_RE = /^\d{4}-\d{2}$/;

function parseMonthParam(value: string): { monthParam: string; monthDate: string } {
  if (!MONTH_RE.test(value)) {
    throw new HttpError(400, "Month must be in YYYY-MM format");
  }
  return { monthParam: value, monthDate: `${value}-01` };
}

async function buildBudgetSummary(monthParam: string, monthDate: string) {
  const budget = await getBudgetForMonth(monthDate);
  const spent = Number(await getMonthlySpend(monthDate));
  const amount = budget ? Number(budget.amount) : null;

  return {
    month: monthParam,
    amount,
    spent,
    remaining: amount === null ? null : amount - spent,
  };
}

export async function getBudgetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { monthParam, monthDate } = parseMonthParam(req.params.month);
    res.status(200).json(await buildBudgetSummary(monthParam, monthDate));
  } catch (err) {
    next(err);
  }
}

export async function upsertBudgetHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { monthParam, monthDate } = parseMonthParam(req.params.month);
    const { amount } = req.body ?? {};

    const parsedAmount = Number(amount);
    if (typeof amount !== "number" && typeof amount !== "string") {
      throw new HttpError(400, "A valid non-negative amount is required");
    }
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      throw new HttpError(400, "A valid non-negative amount is required");
    }

    await upsertBudgetForMonth(monthDate, parsedAmount);
    res.status(200).json(await buildBudgetSummary(monthParam, monthDate));
  } catch (err) {
    next(err);
  }
}
