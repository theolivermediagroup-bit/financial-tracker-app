import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { categoriesRouter } from "./modules/categories/categories.routes";
import { entriesRouter } from "./modules/entries/entries.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { budgetsRouter } from "./modules/budgets/budgets.routes";

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.use("/api/categories", categoriesRouter);
app.use("/api/entries", entriesRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/budgets", budgetsRouter);

app.use(errorHandler);
