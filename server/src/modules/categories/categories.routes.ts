import { Router } from "express";
import {
  listCategoriesHandler,
  createCategoryHandler,
  deleteCategoryHandler,
} from "./categories.controller";

export const categoriesRouter = Router();

categoriesRouter.get("/", listCategoriesHandler);
categoriesRouter.post("/", createCategoryHandler);
categoriesRouter.delete("/:id", deleteCategoryHandler);
