interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
}

export default function StatCard({ title, value, unit }: StatCardProps) {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="ml-1 text-gray-500">{unit}</span>}
      </div>
    </div>
  );
}