import { Workout } from '@/types/habits';

interface WorkoutListProps {
  workouts: Workout[];
}

const activityColors: Record<Workout['activity_type'], string> = {
  running: 'bg-red-100 text-red-800',
  training: 'bg-blue-100 text-blue-800',
  walking: 'bg-green-100 text-green-800',
  swimming: 'bg-cyan-100 text-cyan-800',
  cycling: 'bg-yellow-100 text-yellow-800',
  yoga: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
};

const activityIcons: Record<Workout['activity_type'], string> = {
  running: '🏃',
  training: '💪',
  walking: '🚶',
  swimming: '🏊',
  cycling: '🚴',
  yoga: '🧘',
  other: '⚡',
};

export default function WorkoutList({ workouts }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500 text-lg">No workouts found. Start by logging your first workout!</p>
      </div>
    );
  }

  // Sort by date descending
  const sorted = [...workouts].sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());

  return (
    <div className="space-y-3">
      {sorted.map(workout => (
        <div key={workout.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <span className="text-3xl">{activityIcons[workout.activity_type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${activityColors[workout.activity_type]}`}>
                    {workout.activity_type.charAt(0).toUpperCase() + workout.activity_type.slice(1)}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(workout.logged_date).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>⏱️ {workout.duration_minutes} mins</span>
                  {workout.distance_km && <span>📍 {workout.distance_km} km</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
