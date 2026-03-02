'use client';
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
      <div className="bg-surface p-8 rounded-[32px] border border-dark-border text-center">
        <p className="text-muted text-sm italic">No data detected in the neural link.</p>
      </div>
    );
  }

  // Sort by date descending
  const sorted = [...workouts].sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime());

  const grouped = sorted.reduce((acc, workout) => {
    const date = new Date(workout.logged_date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    if (!acc[date]) acc[date] = [];
    acc[date].push(workout);
    return acc;
  }, {} as Record<string, Workout[]>);

  return (
    <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden flex flex-col">
      <div className="p-8 border-b border-dark-border flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase">Workout Timeline</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Historical activity logs</p>
        </div>
        <div className="text-[10px] font-black text-muted italic">
          {workouts.length} TOTAL ENTRIES
        </div>
      </div>

      {/* SCROLLABLE CONTAINER */}
      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
        <div className="relative">
          {Object.entries(grouped).map(([date, dayWorkouts]) => (
            <div key={date} className="p-6 last:border-b-0 border-b border-dark-border/30">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 bg-accent-blue rounded-full shadow-[0_0_8px_rgba(86,156,214,0.6)]" />
                <h4 className="font-bold text-foreground/80 text-sm uppercase tracking-wider">{date}</h4>
                <span className="text-[10px] bg-highlight/30 text-accent-blue px-2 py-0.5 rounded-full font-black border border-accent-blue/20">
                  {dayWorkouts.length} {dayWorkouts.length === 1 ? 'WORKOUT' : 'WORKOUTS'}
                </span>
              </div>

              {/* Workouts for this date */}
              <div className="space-y-3 ml-5">
                {dayWorkouts.map(workout => (
                  <div
                    key={workout.id}
                    className="p-4 bg-background/50 border border-dark-border/50 rounded-2xl flex items-center justify-between group hover:border-accent-blue/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-surface border border-dark-border flex items-center justify-center text-xl">
                        {activityEmojis[workout.activity_type]}
                      </div>
                      <div>
                        <p className="font-black text-foreground capitalize text-sm tracking-tight">
                          {workout.activity_type}
                        </p>
                        <p className="text-[11px] text-muted font-bold uppercase tracking-tighter">
                          {workout.duration_minutes} MINS 
                          {workout.distance_km && ` • ${workout.distance_km} KM`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer hint */}
      <div className="p-4 bg-background/20 border-t border-dark-border flex justify-center">
          <div className="w-8 h-1 bg-dark-border rounded-full opacity-50" />
      </div>
    </div>
  );
}