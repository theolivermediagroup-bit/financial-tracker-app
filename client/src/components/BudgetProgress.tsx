import { useState } from "react";
import type { FormEvent } from "react";
import { formatMonthLabel } from "../api/client";
import { setBudget } from "../api/budgets";
import type { MonthlyBudget } from "../types";

interface Props {
  budget: MonthlyBudget;
  onUpdated: () => void;
}

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function BudgetProgress({ budget, onUpdated }: Props) {
  const [editing, setEditing] = useState(budget.amount === null);
  const [amount, setAmount] = useState(budget.amount !== null ? String(budget.amount) : "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsedAmount = Number(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount < 0) return;

    setPending(true);
    setError(null);
    try {
      await setBudget(budget.month, parsedAmount);
      setEditing(false);
      onUpdated();
    } catch {
      setError("Could not save budget. Please try again.");
    } finally {
      setPending(false);
    }
  }

  const monthLabel = formatMonthLabel(budget.month);

  if (editing) {
    return (
      <div className="card budget-card">
        <h2>Budget for {monthLabel}</h2>
        <form className="budget-form" onSubmit={handleSubmit}>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onFocus={(e) => e.target.select()}
            disabled={pending}
            autoFocus
          />
          <button type="submit" disabled={pending || !amount}>
            Save budget
          </button>
          {budget.amount !== null && (
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setAmount(String(budget.amount));
                setEditing(false);
                setError(null);
              }}
              disabled={pending}
            >
              Cancel
            </button>
          )}
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>
    );
  }

  const amount$ = budget.amount ?? 0;
  const percent = amount$ > 0 ? (budget.spent / amount$) * 100 : 0;
  const cappedPercent = Math.min(percent, 100);
  const overBudget = budget.remaining !== null && budget.remaining < 0;

  let tone: "positive" | "warning" | "negative" = "positive";
  if (overBudget) tone = "negative";
  else if (percent >= 80) tone = "warning";

  return (
    <div className="card budget-card">
      <div className="budget-header">
        <h2>Budget for {monthLabel}</h2>
        <button type="button" className="secondary-btn" onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>
      <p className="budget-summary">
        {formatCurrency(budget.spent)} of {formatCurrency(amount$)} spent ({Math.round(percent)}%)
      </p>
      <div className="progress-track">
        <div className={`progress-fill progress-${tone}`} style={{ width: `${cappedPercent}%` }} />
      </div>
      {overBudget && (
        <p className="form-error">
          {formatCurrency(Math.abs(budget.remaining!))} over budget
        </p>
      )}
    </div>
  );
}
