import { apiFetch } from "./client";
import type { DashboardSummary } from "../types";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return apiFetch("/api/dashboard");
}
