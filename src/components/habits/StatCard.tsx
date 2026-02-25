interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

export default function StatCard({ title, value, unit }: StatCardProps) {
  return (
    <div className="p-6 bg-surface border border-dark-border rounded-xl shadow-sm">
      <p className="text-sm font-medium text-muted uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {unit && <span className="ml-1 text-muted">{unit}</span>}
      </div>
    </div>
  );
}