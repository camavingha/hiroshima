import { Workout } from '@/types/habits';

interface WorkoutStatsProps {
  workouts: Workout[];
}

export default function WorkoutStats({ workouts }: WorkoutStatsProps) {
  const totalMinutes = workouts.reduce((acc, w) => acc + w.duration_minutes, 0);
  const totalDistance = workouts.reduce((acc, w) => acc + (w.distance_km || 0), 0);
  const totalWorkouts = workouts.length;

  // Calculate by activity type
  const byActivity = workouts.reduce((acc, w) => {
    acc[w.activity_type] = (acc[w.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most frequent activity
  const mostFrequent = Object.entries(byActivity).sort((a, b) => b[1] - a[1])[0];
  const mostFrequentActivity = mostFrequent ? mostFrequent[0].charAt(0).toUpperCase() + mostFrequent[0].slice(1) : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Total Workouts</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-900">{totalWorkouts}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
        <p className="text-xs font-semibold text-green-600 uppercase mb-2">Total Minutes</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-green-900">{totalMinutes}</span>
          <span className="ml-1 text-sm text-green-700">mins</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
        <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Total Distance</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-purple-900">{totalDistance.toFixed(1)}</span>
          <span className="ml-1 text-sm text-purple-700">km</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
        <p className="text-xs font-semibold text-orange-600 uppercase mb-2">Most Frequent</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-orange-900">{mostFrequentActivity}</span>
        </div>
      </div>
    </div>
  );
}
