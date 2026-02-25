'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout } from '@/types/habits';
import RunningForm from '@/components/habits/RunningForm';
import WorkoutTimeline from '@/components/habits/WorkoutTimeline';
import { MOCK_WORKOUTS } from '@/utils/mockData';

// Calculate running streak from consecutive dates
function calcStreak(workouts: Workout[]): number {
  const runDates = workouts
    .filter(w => w.activity_type === 'running')
    .map(w => w.logged_date)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (runDates.length === 0) return 0;

  const uniqueDates = [...new Set(runDates)];

  let streak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = new Date(uniqueDates[i]);
    const next = new Date(uniqueDates[i + 1]);
    const diffDays = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function Page() {
  const supabase = createClient();
  const [workouts, setWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('logged_date', { ascending: false });

      if (error) {
        console.log('Using mock data - Supabase not configured');
        setWorkouts(MOCK_WORKOUTS);
      } else if (data) {
        setWorkouts(data);
      }
    } catch (err) {
      console.log('Using mock data - connection error');
      setWorkouts(MOCK_WORKOUTS);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutAdded = (newWorkout: Workout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  // Stats
  const runs = workouts.filter(w => w.activity_type === 'running');
  const totalRuns = runs.length;
  const totalKm = runs.reduce((acc, w) => acc + (w.distance_km || 0), 0);
  const totalMins = runs.reduce((acc, w) => acc + w.duration_minutes, 0);
  const avgPace = totalKm > 0 ? totalMins / totalKm : 0;
  const avgPaceMin = Math.floor(avgPace);
  const avgPaceSec = Math.round((avgPace - avgPaceMin) * 60);
  const streak = calcStreak(workouts);

  // Recent runs (last 5)
  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime())
    .slice(0, 5);

  return (
    <main className="max-w-7xl mx-auto p-8 bg-background min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Running</h1>
        <p className="text-muted">Track every run, every kilometer.</p>
      </header>

      {/* Stats Strip — reordered: Total Runs, Distance, Avg Pace, Streak */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2d47] p-6 rounded-xl border border-[#264f78]">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1">Total Runs</p>
            <span className="text-3xl font-black text-blue-300">{totalRuns}</span>
          </div>

          <div className="bg-gradient-to-br from-[#1a3a2a] to-[#152e22] p-6 rounded-xl border border-[#2d5a3f]">
            <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.15em] mb-1">Distance</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-green-300">{totalKm.toFixed(1)}</span>
              <span className="text-sm text-green-500">km</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2d1f3d] to-[#231735] p-6 rounded-xl border border-[#4a2d6b]">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.15em] mb-1">Avg Pace</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-purple-300">
                {totalKm > 0 ? `${avgPaceMin}:${avgPaceSec.toString().padStart(2, '0')}` : '--:--'}
              </span>
              <span className="text-sm text-purple-500">/km</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#3d2a1a] to-[#352315] p-6 rounded-xl border border-[#5a3d20] relative overflow-hidden">
            <div className="absolute top-3 right-3 text-3xl opacity-30">🔥</div>
            <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.15em] mb-1">Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-orange-300">{streak}</span>
              <span className="text-sm text-orange-500 font-bold">{streak === 1 ? 'day' : 'days'}</span>
            </div>
            <p className="text-[9px] text-orange-600 mt-1 font-bold uppercase tracking-wider">
              {streak >= 7 ? '🔥 On fire!' : streak >= 3 ? '💪 Keep going!' : '🏃 Start strong!'}
            </p>
          </div>
        </div>
      </section>

      {/* Recent Runs */}
      <section className="mb-12">
        <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-dark-border">
            <h2 className="text-2xl font-black text-foreground tracking-tight italic">LATEST RUNS</h2>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Your most recent sessions</p>
          </div>

          {recentRuns.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted">No runs logged yet. Hit the + button to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-dark-border">
              {recentRuns.map((run, i) => {
                const date = new Date(run.logged_date);
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const pace = run.distance_km && run.distance_km > 0
                  ? run.duration_minutes / run.distance_km
                  : null;
                const paceMin = pace ? Math.floor(pace) : null;
                const paceSec = pace ? Math.round((pace - Math.floor(pace)) * 60) : null;

                return (
                  <div key={run.id} className="px-8 py-5 flex items-center gap-6 hover:bg-surface-hover transition-colors">
                    {/* Rank / Index */}
                    <div className="w-8 h-8 rounded-lg bg-dark-border flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-muted">{i + 1}</span>
                    </div>

                    {/* Date */}
                    <div className="w-16 text-center flex-shrink-0">
                      <p className="text-[10px] font-black text-muted uppercase">{dayName}</p>
                      <p className="text-sm font-bold text-foreground">{dateStr}</p>
                    </div>

                    {/* Distance */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-green-400">{run.distance_km?.toFixed(1) || '—'}</span>
                        <span className="text-xs text-muted">km</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-blue-400">{run.duration_minutes}</span>
                        <span className="text-xs text-muted">min</span>
                      </div>
                    </div>

                    {/* Pace */}
                    <div className="flex-shrink-0">
                      <div className="bg-background px-3 py-1.5 rounded-lg border border-dark-border">
                        <span className="text-sm font-black text-purple-400">
                          {paceMin !== null && paceSec !== null
                            ? `${paceMin}:${paceSec.toString().padStart(2, '0')}`
                            : '--:--'
                          }
                        </span>
                        <span className="text-[9px] text-muted ml-1">/km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Timeline Section */}
      <section>
        {loading ? (
          <div className="text-left py-12">
            <p className="text-muted italic">Loading runs...</p>
          </div>
        ) : (
          <WorkoutTimeline workouts={workouts} />
        )}
      </section>

      {/* FAB for logging runs */}
      <RunningForm isOpen={showAddForm} onToggle={setShowAddForm} onWorkoutAdded={handleWorkoutAdded} />
    </main>
  );
}