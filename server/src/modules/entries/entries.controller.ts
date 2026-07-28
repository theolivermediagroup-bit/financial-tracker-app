import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { getCategoryById } from "../categories/categories.repository";
import {
  listEntries,
  createEntry,
  updateEntry,
  getEntryById,
  deleteEntry,
  EntryRow,
} from "./entries.repository";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toEntryDto(row: EntryRow) {
  return {
    id: row.id,
    categoryId: row.category_id,
    amount: Number(row.amount),
    description: row.description,
    occurredOn: row.occurred_on.toISOString().slice(0, 10),
    createdAt: row.created_at.toISOString(),
    category: {
      id: row.category_id,
      name: row.category_name,
      type: row.category_type,
    },
  };
}

function parseType(value: unknown): "income" | "expense" | undefined {
  if (value === "income" || value === "expense") return value;
  return undefined;
}

async function parseEntryBody(body: unknown) {
  const { categoryId, amount, description } = (body ?? {}) as Record<string, unknown>;

  const parsedCategoryId = Number(categoryId);
  if (!categoryId || Number.isNaN(parsedCategoryId)) {
    throw new HttpError(400, "A valid categoryId is required");
  }

  const category = await getCategoryById(parsedCategoryId);
  if (!category) {
    throw new HttpError(404, "Category not found");
  }

  const parsedAmount = Number(amount);
  if (typeof amount !== "number" && typeof amount !== "string") {
    throw new HttpError(400, "A valid positive amount is required");
  }
  if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new HttpError(400, "A valid positive amount is required");
  }

  const parsedDescription =
    typeof description === "string" && description.trim().length > 0
      ? description.trim()
      : null;

  return { categoryId: parsedCategoryId, amount: parsedAmount, description: parsedDescription };
}

export async function listEntriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const type = parseType(req.query.type);
    const categoryId =
      typeof req.query.categoryId === "string" ? Number(req.query.categoryId) : undefined;
    const from = typeof req.query.from === "string" ? req.query.from : undefined;
    const to = typeof req.query.to === "string" ? req.query.to : undefined;

    const entries = await listEntries({ type, categoryId, from, to });
    res.status(200).json({ entries: entries.map(toEntryDto) });
  } catch (err) {
    next(err);
  }
}

export async function createEntryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { categoryId, amount, description } = await parseEntryBody(req.body);
    const { occurredOn } = req.body ?? {};

    const parsedOccurredOn =
      typeof occurredOn === "string" && DATE_RE.test(occurredOn)
        ? occurredOn
        : new Date().toISOString().slice(0, 10);

    const id = await createEntry({ categoryId, amount, description, occurredOn: parsedOccurredOn });

    const entry = await getEntryById(id);
    res.status(201).json({ entry: toEntryDto(entry!) });
  } catch (err) {
    next(err);
  }
}

export async function updateEntryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { categoryId, amount, description } = await parseEntryBody(req.body);
    const { occurredOn } = req.body ?? {};

    if (typeof occurredOn !== "string" || !DATE_RE.test(occurredOn)) {
      throw new HttpError(400, "A valid date (YYYY-MM-DD) is required");
    }

    const updated = await updateEntry(id, { categoryId, amount, description, occurredOn });
    if (!updated) {
      throw new HttpError(404, "Entry not found");
    }

    const entry = await getEntryById(id);
    res.status(200).json({ entry: toEntryDto(entry!) });
  } catch (err) {
    next(err);
  }
}

export async function deleteEntryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const deleted = await deleteEntry(id);
    if (!deleted) {
      throw new HttpError(404, "Entry not found");
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
