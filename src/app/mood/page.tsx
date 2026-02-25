'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mood, MoodLevel } from '@/types/habits';
import MoodCalendar from '@/components/habits/MoodCalendar';
import MoodForm from '@/components/habits/MoodForm';
import { MOCK_MOODS } from '@/utils/mockData';

const moodEmojis: Record<MoodLevel, string> = {
  'great': '😄',
  'happy': '🙂',
  'so-so': '😐',
  'weird': '😕',
  'bad': '😞',
};

const moodScores: Record<MoodLevel, number> = {
  'great': 5,
  'happy': 4,
  'so-so': 3,
  'weird': 2,
  'bad': 1,
};

// Calculate mood streak (consecutive days with any entry)
function calcMoodStreak(moods: Mood[]): number {
  const dates = [...new Set(moods.map(m => m.entry_date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  if (dates.length === 0) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
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
  const [moods, setMoods] = useState<Mood[]>(MOCK_MOODS);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setMoods(MOCK_MOODS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('moods')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) {
        setMoods(MOCK_MOODS);
      } else if (data) {
        setMoods(data);
      }
    } catch {
      setMoods(MOCK_MOODS);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodAdded = (newMood: Mood) => {
    setMoods(prev => [newMood, ...prev]);
  };

  // Stats
  const totalEntries = moods.length;
  const moodStreak = calcMoodStreak(moods);
  const avgScore = totalEntries > 0
    ? (moods.reduce((acc, m) => acc + moodScores[m.mood], 0) / totalEntries)
    : 0;

  // Mood distribution
  const distribution = moods.reduce((acc, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Most frequent mood
  const topMood = Object.entries(distribution).sort((a, b) => b[1] - a[1])[0];
  const topMoodLevel = topMood ? topMood[0] as MoodLevel : null;

  // Recent entries (last 7)
  const sortedMoods = [...moods].sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  const recentMoods = sortedMoods.slice(0, 7);

  return (
    <main className="max-w-7xl mx-auto p-8 bg-background min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Mood</h1>
        <p className="text-muted">Understand your emotional patterns.</p>
      </header>

      {/* Stats */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-[#1a3a2a] to-[#152e22] p-6 rounded-xl border border-[#2d5a3f] relative overflow-hidden">
            <div className="absolute top-3 right-3 text-3xl opacity-30">📝</div>
            <p className="text-[10px] font-black text-green-400 uppercase tracking-[0.15em] mb-1">Check-in Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-green-300">{moodStreak}</span>
              <span className="text-sm text-green-500 font-bold">{moodStreak === 1 ? 'day' : 'days'}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2d47] p-6 rounded-xl border border-[#264f78]">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] mb-1">Total Entries</p>
            <span className="text-3xl font-black text-blue-300">{totalEntries}</span>
          </div>

          <div className="bg-gradient-to-br from-[#3d3a1a] to-[#352f15] p-6 rounded-xl border border-[#5a5320]">
            <p className="text-[10px] font-black text-yellow-400 uppercase tracking-[0.15em] mb-1">Avg Score</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-yellow-300">{avgScore.toFixed(1)}</span>
              <span className="text-sm text-yellow-500">/5</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#2d1f3d] to-[#231735] p-6 rounded-xl border border-[#4a2d6b]">
            <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.15em] mb-1">Top Mood</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl">{topMoodLevel ? moodEmojis[topMoodLevel] : '—'}</span>
              <span className="text-lg font-black text-purple-300 capitalize">{topMoodLevel || 'N/A'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contribution Calendar */}
      <section className="mb-12">
        {loading ? (
          <div className="text-left py-12">
            <p className="text-muted italic">Loading mood data...</p>
          </div>
        ) : (
          <MoodCalendar moods={moods} />
        )}
      </section>

      {/* Recent Entries */}
      <section>
        <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden">
          <div className="p-8 border-b border-dark-border">
            <h2 className="text-2xl font-black text-foreground tracking-tight italic">RECENT CHECK-INS</h2>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Your latest mood entries</p>
          </div>

          <div className="divide-y divide-dark-border">
            {recentMoods.map(mood => {
              const date = new Date(mood.entry_date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div key={mood.id} className="px-8 py-5 flex items-center gap-6 hover:bg-surface-hover transition-colors">
                  {/* Date */}
                  <div className="w-16 text-center flex-shrink-0">
                    <p className="text-[10px] font-black text-muted uppercase">{dayName}</p>
                    <p className="text-sm font-bold text-foreground">{dateStr}</p>
                  </div>

                  {/* Emoji */}
                  <div className="text-3xl">{moodEmojis[mood.mood]}</div>

                  {/* Mood label & notes */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-foreground capitalize text-sm">{mood.mood}</p>
                    {mood.notes && (
                      <p className="text-xs text-muted truncate">{mood.notes}</p>
                    )}
                  </div>

                  {/* Score badge */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${moodScores[mood.mood] >= 4 ? 'bg-green-500/70' :
                      moodScores[mood.mood] === 3 ? 'bg-yellow-500/70' :
                        'bg-red-500/70'
                    }`}>
                    {moodScores[mood.mood]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mood Distribution Bar */}
          <div className="p-8 border-t border-dark-border">
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.15em] mb-3">Mood Distribution</p>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              {(['great', 'happy', 'so-so', 'weird', 'bad'] as MoodLevel[]).map(level => {
                const count = distribution[level] || 0;
                const pct = totalEntries > 0 ? (count / totalEntries) * 100 : 0;
                const colors: Record<MoodLevel, string> = {
                  'great': 'bg-green-500',
                  'happy': 'bg-green-400/70',
                  'so-so': 'bg-yellow-500/60',
                  'weird': 'bg-orange-500/50',
                  'bad': 'bg-red-500/50',
                };

                if (pct === 0) return null;

                return (
                  <div
                    key={level}
                    className={`${colors[level]} transition-all`}
                    style={{ width: `${pct}%` }}
                    title={`${level}: ${count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              {(['great', 'happy', 'so-so', 'weird', 'bad'] as MoodLevel[]).map(level => {
                const count = distribution[level] || 0;
                return (
                  <div key={level} className="flex items-center gap-1">
                    <span className="text-xs">{moodEmojis[level]}</span>
                    <span className="text-[10px] text-muted font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* FAB for logging mood */}
      <MoodForm isOpen={showAddForm} onToggle={setShowAddForm} onMoodAdded={handleMoodAdded} />
    </main>
  );
}