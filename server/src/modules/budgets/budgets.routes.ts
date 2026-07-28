import { Router } from "express";
import { getBudgetHandler, upsertBudgetHandler } from "./budgets.controller";

export const budgetsRouter = Router();

budgetsRouter.get("/:month", getBudgetHandler);
budgetsRouter.put("/:month", upsertBudgetHandler);
