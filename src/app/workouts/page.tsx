'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout } from '@/types/habits';
import RunningForm from '@/components/habits/RunningForm';
import WorkoutTimeline from '@/components/habits/WorkoutTimeline';
// import PaceChart from '@/components/habits/PerformanceChart';
import PerformanceChart from '@/components/habits/PerformanceChart';  

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
  // Initialize with empty array - no more MOCK_WORKOUTS fallback
  const [workouts, setWorkouts] = useState<Workout[]>([]); 
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('logged_date', { ascending: false });

      if (error) {
        console.error('Database Error:', error.message);
        setWorkouts([]); // Ensure state is empty on error
      } else if (data) {
        setWorkouts(data);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setWorkouts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutAdded = (newWorkout: Workout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
  };

  // Stats Logic
  const runs = workouts.filter(w => w.activity_type === 'running');
  const totalRuns = runs.length;
  const totalKm = runs.reduce((acc, w) => acc + (w.distance_km || 0), 0);
  const totalMins = runs.reduce((acc, w) => acc + w.duration_minutes, 0);
  const avgPace = totalKm > 0 ? totalMins / totalKm : 0;
  const avgPaceMin = Math.floor(avgPace);
  const avgPaceSec = Math.round((avgPace - avgPaceMin) * 60);
  const streak = calcStreak(workouts);

  const recentRuns = [...runs]
    .sort((a, b) => new Date(b.logged_date).getTime() - new Date(a.logged_date).getTime())
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        
        <header className="text-left">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight italic uppercase">Hiroshima Running</h1>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Live Database Connection Active</p>
        </header>
        
        {/* If loading, we show a clean message. Once loaded, if no data, PaceChart handles it */}
        <section>
          {loading ? (
            <div className="h-[300px] flex items-center justify-center bg-surface rounded-[32px] border border-dark-border animate-pulse">
               <p className="text-muted font-black uppercase tracking-widest text-xs">Syncing Performance Data...</p>
            </div>
          ) : (
            <PerformanceChart workouts={workouts} />
          )}
        </section>

        {/* Stats Strip */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2d47] p-6 rounded-xl border border-[#264f78]">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1">Total Runs</p>
              <span className="text-3xl font-black text-blue-300">{loading ? '—' : totalRuns}</span>
            </div>

            <div className="bg-gradient-to-br from-[#1a3a2a] to-[#152e22] p-6 rounded-xl border border-[#2d5a3f]">
              <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.15em] mb-1">Distance</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-green-300">{loading ? '—' : totalKm.toFixed(1)}</span>
                <span className="text-sm text-green-500">km</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#2d1f3d] to-[#231735] p-6 rounded-xl border border-[#4a2d6b]">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.15em] mb-1">Avg Pace</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-purple-300">
                  {loading ? '--:--' : (totalKm > 0 ? `${avgPaceMin}:${avgPaceSec.toString().padStart(2, '0')}` : '--:--')}
                </span>
                <span className="text-sm text-purple-500">/km</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#3d2a1a] to-[#352315] p-6 rounded-xl border border-[#5a3d20] relative overflow-hidden">
              <div className="absolute top-3 right-3 text-3xl opacity-30">🔥</div>
              <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.15em] mb-1">Streak</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-orange-300">{loading ? '—' : streak}</span>
                <span className="text-sm text-orange-500 font-bold">{streak === 1 ? 'day' : 'days'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Runs */}
        <section>
          <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-dark-border">
              <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase">Latest Runs</h2>
            </div>

            {loading ? (
              <div className="p-12 text-center text-muted animate-pulse">Fetching latest entries...</div>
            ) : recentRuns.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-muted italic">No records found in database.</p>
              </div>
            ) : (
              <div className="divide-y divide-dark-border">
                {recentRuns.map((run, i) => {
                  const pace = run.distance_km && run.distance_km > 0 ? run.duration_minutes / run.distance_km : null;
                  const paceMin = pace ? Math.floor(pace) : null;
                  const paceSec = pace ? Math.round((pace - Math.floor(pace)) * 60) : null;

                  return (
                    <div key={run.id} className="px-8 py-5 flex items-center gap-6 hover:bg-surface-hover transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-dark-border flex items-center justify-center">
                        <span className="text-xs font-black text-muted">{i + 1}</span>
                      </div>
                      <div className="w-24">
                        <p className="text-sm font-bold text-foreground">{new Date(run.logged_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-lg font-black text-green-400">{run.distance_km?.toFixed(1)} km</span>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="bg-background px-3 py-1.5 rounded-lg border border-dark-border font-black text-purple-400">
                           {paceMin}:{paceSec?.toString().padStart(2, '0')} /km
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Scrollable Timeline */}
        <section className="pb-24">
          {loading ? (
            <div className="text-center py-12 text-muted italic">Decrypting neural activity...</div>
          ) : (
            <WorkoutTimeline workouts={workouts} />
          )}
        </section>

      </div>

      <RunningForm isOpen={showAddForm} onToggle={setShowAddForm} onWorkoutAdded={handleWorkoutAdded} />
    </main>
  );
}