import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategorySpending } from "../types";

interface Props {
  data: CategorySpending[];
}

const COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0d9488",
  "#d97706",
  "#dc2626",
  "#65a30d",
  "#db2777",
  "#4f46e5",
];

function formatCurrency(value: number): string {
  return value.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function SpendingByCategoryChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="chart-card empty-state">
        <p>Add an expense to see your spending breakdown.</p>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2>Spending by category</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="categoryName"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {data.map((entry, index) => (
              <Cell key={entry.categoryId} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
