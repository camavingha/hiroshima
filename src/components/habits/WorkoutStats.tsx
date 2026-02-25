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
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2d47] p-6 rounded-xl border border-[#264f78]">
        <p className="text-xs font-semibold text-blue-400 uppercase mb-2">Total Workouts</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-300">{totalWorkouts}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1a3a2a] to-[#152e22] p-6 rounded-xl border border-[#2d5a3f]">
        <p className="text-xs font-semibold text-green-400 uppercase mb-2">Total Minutes</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-green-300">{totalMinutes}</span>
          <span className="ml-1 text-sm text-green-500">mins</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#2d1f3d] to-[#231735] p-6 rounded-xl border border-[#4a2d6b]">
        <p className="text-xs font-semibold text-purple-400 uppercase mb-2">Total Distance</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-purple-300">{totalDistance.toFixed(1)}</span>
          <span className="ml-1 text-sm text-purple-500">km</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#3d2a1a] to-[#352315] p-6 rounded-xl border border-[#5a3d20]">
        <p className="text-xs font-semibold text-orange-400 uppercase mb-2">Most Frequent</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-orange-300">{mostFrequentActivity}</span>
        </div>
      </div>
    </div>
  );
}
