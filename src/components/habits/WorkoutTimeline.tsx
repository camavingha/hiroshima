import { Workout } from '@/types/habits';

interface WorkoutTimelineProps {
  workouts: Workout[];
}

const activityEmojis: Record<Workout['activity_type'], string> = {
  running: '🏃',
  training: '💪',
  walking: '🚶',
  swimming: '🏊',
  cycling: '🚴',
  yoga: '🧘',
  other: '⚡',
};

export default function WorkoutTimeline({ workouts }: WorkoutTimelineProps) {
  if (workouts.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
        <p className="text-gray-500">No workouts to display</p>
      </div>
    );
  }

  // Sort by date descending and group by date
  const sorted = [...workouts].sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());

  const grouped = sorted.reduce((acc, workout) => {
    const date = new Date(workout.logged_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Workout Timeline</h3>
      </div>

      <div className="relative">
        {Object.entries(grouped).map(([date, dayWorkouts], index) => (
          <div key={date} className="border-b border-gray-100 last:border-b-0">
            <div className="p-6">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <h4 className="font-semibold text-gray-700">{date}</h4>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  {dayWorkouts.length} {dayWorkouts.length === 1 ? 'workout' : 'workouts'}
                </span>
              </div>

              {/* Workouts for this date */}
              <div className="space-y-2 ml-5">
                {dayWorkouts.map(workout => (
                  <div
                    key={workout.id}
                    className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activityEmojis[workout.activity_type]}</span>
                      <div>
                        <p className="font-medium text-gray-900 capitalize">
                          {workout.activity_type.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          {workout.duration_minutes} mins
                          {workout.distance_km && ` • ${workout.distance_km} km`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
