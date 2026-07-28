interface Props {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}

export function StatTile({ label, value, tone = "neutral" }: Props) {
  return (
    <div className="stat-tile">
      <span className={`stat-value stat-${tone}`}>{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
