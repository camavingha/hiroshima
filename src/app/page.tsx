import StatCard from '@/components/habits/StatCard';
import BodyForm from '@/components/habits/BodyForm';
import { MOCK_WORKOUTS } from '@/utils/mockData';

export default function Home() {
  // Logic: Calculate total minutes from mock data
  const totalMinutes = MOCK_WORKOUTS.reduce((acc, curr) => acc + curr.duration_minutes, 0);

  return (
    <main className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Hiroshima Dashboard</h1>
        <p className="text-gray-500">Track your evolution, day by day.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Training" value={totalMinutes} unit="mins" />
        <StatCard title="Avg Mood" value="Great" />
        <StatCard title="Books Read" value={0} />
      <div className='mt-8'> <BodyForm /> 
      </div>
      </div>
    </main>
  );
}