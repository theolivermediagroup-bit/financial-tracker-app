import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import {
  listCategories,
  createCategory,
  getCategoryById,
  deleteCategory,
  CategoryRow,
} from "./categories.repository";
import { countEntriesByCategory } from "../entries/entries.repository";

function toCategoryDto(row: CategoryRow) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    createdAt: row.created_at.toISOString(),
  };
}

function parseType(value: unknown): "income" | "expense" | undefined {
  if (value === "income" || value === "expense") return value;
  return undefined;
}

export async function listCategoriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const type = parseType(req.query.type);
    const categories = await listCategories(type);
    res.status(200).json({ categories: categories.map(toCategoryDto) });
  } catch (err) {
    next(err);
  }
}

export async function createCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, type } = req.body ?? {};
    if (typeof name !== "string" || name.trim().length === 0) {
      throw new HttpError(400, "Category name is required");
    }
    const parsedType = parseType(type);
    if (!parsedType) {
      throw new HttpError(400, "Category type must be 'income' or 'expense'");
    }

    const category = await createCategory(name.trim(), parsedType);
    res.status(201).json({ category: toCategoryDto(category) });
  } catch (err) {
    next(err);
  }
}

export async function deleteCategoryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const category = await getCategoryById(id);
    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    const entryCount = await countEntriesByCategory(id);
    if (entryCount > 0) {
      throw new HttpError(409, "Cannot delete a category with existing entries");
    }

    await deleteCategory(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
