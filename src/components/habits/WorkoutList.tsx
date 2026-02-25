import { Workout } from '@/types/habits';

interface WorkoutListProps {
  workouts: Workout[];
}

const activityColors: Record<Workout['activity_type'], string> = {
  running: 'bg-red-900/30 text-red-400',
  training: 'bg-blue-900/30 text-blue-400',
  walking: 'bg-green-900/30 text-green-400',
  swimming: 'bg-cyan-900/30 text-cyan-400',
  cycling: 'bg-yellow-900/30 text-yellow-400',
  yoga: 'bg-purple-900/30 text-purple-400',
  other: 'bg-gray-700/30 text-gray-400',
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
      <div className="bg-surface p-8 rounded-2xl border border-dark-border shadow-sm text-center">
        <p className="text-muted text-lg">No workouts found. Start by logging your first workout!</p>
      </div>
    );
  }

  // Sort by date descending
  const sorted = [...workouts].sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());

  return (
    <div className="space-y-3">
      {sorted.map(workout => (
        <div key={workout.id} className="bg-surface p-4 rounded-xl border border-dark-border hover:border-dark-border-light transition-all">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <span className="text-3xl">{activityIcons[workout.activity_type]}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${activityColors[workout.activity_type]}`}>
                    {workout.activity_type.charAt(0).toUpperCase() + workout.activity_type.slice(1)}
                  </span>
                  <span className="text-xs text-muted">{new Date(workout.logged_date).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-4 text-sm text-foreground/70">
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
