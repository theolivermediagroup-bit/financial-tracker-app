import { useCallback, useEffect, useState } from "react";
import { getDashboardSummary } from "../api/dashboard";
import { listEntries } from "../api/entries";
import type { DashboardSummary, Entry } from "../types";
import { StatTile } from "../components/StatTile";
import { SpendingByCategoryChart } from "../components/SpendingByCategoryChart";
import { AddEntryForm } from "../components/AddEntryForm";
import { EntryList } from "../components/EntryList";

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setError(null);
    return Promise.all([getDashboardSummary(), listEntries()])
      .then(([summary, { entries }]) => {
        setSummary(summary);
        setEntries(entries);
      })
      .catch(() => setError("Could not load your dashboard data."));
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error">{error}</p>}

      {!loading && !error && summary && (
        <>
          <div className="stat-row">
            <StatTile label="Total income" value={formatCurrency(summary.totalIncome)} tone="positive" />
            <StatTile label="Total expenses" value={formatCurrency(summary.totalExpenses)} tone="negative" />
            <StatTile
              label="Balance"
              value={formatCurrency(summary.balance)}
              tone={summary.balance >= 0 ? "positive" : "negative"}
            />
            <StatTile label="Total savings" value={formatCurrency(summary.totalSavings)} tone="positive" />
          </div>

          <div className="dashboard-grid">
            <SpendingByCategoryChart data={summary.spendingByCategory} />
            <AddEntryForm onAdded={refresh} />
          </div>

          <div className="card">
            <h2>Recent entries</h2>
            <EntryList entries={entries} onChange={refresh} />
          </div>
        </>
      )}
    </div>
  );
}
