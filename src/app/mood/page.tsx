'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mood, MoodLevel } from '@/types/habits';
import MoodCalendar from '@/components/habits/MoodCalendar';
import MoodForm from '@/components/habits/MoodForm';

const moodEmojis: Record<MoodLevel, string> = {
  'great': '🤩',
  'happy': '😊',
  'so-so': '😐',
  'weird': '🫠',
  'bad': '😞',
};

const moodScores: Record<MoodLevel, number> = {
  'great': 5, 'happy': 4, 'so-so': 3, 'weird': 2, 'bad': 1,
};

export default function Page() {
  const supabase = createClient();
  const [moods, setMoods] = useState<Mood[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_moods') // Target correct table
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (data) setMoods(data);
    } catch (err) {
      console.error("Failed to sync neural mood link", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMoodAdded = (newMood: Mood) => {
    setMoods(prev => [newMood, ...prev]);
  };

  const totalEntries = moods.length;
  const avgScore = totalEntries > 0 
    ? (moods.reduce((acc, m) => acc + moodScores[m.mood], 0) / totalEntries).toFixed(1) 
    : '0.0';

  return (
    <main className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight italic uppercase">Emotional Frequency</h1>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Neural Sentiment Analysis</p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-surface p-6 rounded-[32px] border border-dark-border text-center">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Avg Frequency</p>
                <p className="text-4xl font-black text-accent-green">{avgScore}</p>
            </div>
            <div className="bg-surface p-6 rounded-[32px] border border-dark-border text-center">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">Total Logs</p>
                <p className="text-4xl font-black text-accent-blue">{totalEntries}</p>
            </div>
            <div className="bg-surface p-6 rounded-[32px] border border-dark-border text-center hidden md:block">
                <p className="text-[10px] font-black text-muted uppercase tracking-widest mb-2">System Status</p>
                <p className="text-xl font-black text-foreground animate-pulse mt-2">ONLINE</p>
            </div>
        </section>

        <section>
          {loading ? (
            <div className="h-64 flex items-center justify-center animate-pulse italic text-muted">Scanning Emotional Map...</div>
          ) : (
            <MoodCalendar moods={moods} />
          )}
        </section>

        <section className="bg-surface rounded-[32px] border border-dark-border overflow-hidden flex flex-col">
            <div className="p-8 border-b border-dark-border flex justify-between items-center bg-surface">
                <div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase">Emotional History</h2>
                    <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Archived neural states</p>
                </div>
                <div className="text-[10px] font-black text-muted italic">
                    {moods.length} TOTAL SESSIONS
                </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
                {moods.length === 0 ? (
                    <div className="p-20 text-center text-muted italic uppercase text-[10px] tracking-[.3em]">
                        Archive Empty: No neural data detected
                    </div>
                ) : (
                    <div className="divide-y divide-dark-border/30">
                        {moods.map((m) => (
                            <div key={m.id} className="p-6 flex items-center gap-6 hover:bg-white/[0.02] transition-all group">
                                <div className="w-14 h-14 rounded-2xl bg-background border border-dark-border flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner shrink-0">
                                    {moodEmojis[m.mood as MoodLevel]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <p className="font-black text-foreground uppercase text-sm tracking-widest">{m.mood}</p>
                                        <span className="h-1 w-1 rounded-full bg-dark-border-light" />
                                        <p className="text-[10px] text-muted font-bold tracking-tighter uppercase">
                                            {new Date(m.entry_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    {m.notes && (
                                        <p className="text-xs italic text-muted mt-1 opacity-70 truncate" title={m.notes}>
                                            "{m.notes}"
                                        </p>
                                    )}
                                </div>
                                <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                                    m.mood === 'great' ? 'border-accent-green/30 text-accent-green' : 
                                    m.mood === 'bad' ? 'border-accent-red/30 text-accent-red' : 
                                    'border-dark-border text-muted'
                                }`}>
                                    Logged
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 bg-background/20 border-t border-dark-border flex justify-center">
                <div className="w-8 h-1 bg-dark-border rounded-full opacity-50" />
            </div>
        </section>
      </div>

      <MoodForm isOpen={showAddForm} onToggle={setShowAddForm} onMoodAdded={handleMoodAdded} />
    </main>
  );
}