import { Router } from "express";
import {
  listEntriesHandler,
  createEntryHandler,
  updateEntryHandler,
  deleteEntryHandler,
} from "./entries.controller";

export const entriesRouter = Router();

entriesRouter.get("/", listEntriesHandler);
entriesRouter.post("/", createEntryHandler);
entriesRouter.patch("/:id", updateEntryHandler);
entriesRouter.delete("/:id", deleteEntryHandler);
