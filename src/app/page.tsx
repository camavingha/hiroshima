'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout, Mood, MoodLevel, Reading, BodyStats } from '@/types/habits';
import Link from 'next/link';

const moodEmojis: Record<MoodLevel, string> = {
  great: '🤩', happy: '😊', 'so-so': '😐', weird: '🫠', bad: '😞',
};
const moodScores: Record<MoodLevel, number> = {
  great: 5, happy: 4, 'so-so': 3, weird: 2, bad: 1,
};
const moodColors: Record<MoodLevel, string> = {
  great: '#6a9955', happy: '#569cd6', 'so-so': '#dcdcaa', weird: '#c586c0', bad: '#f44747',
};

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
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export default function OverviewPage() {
  const supabase = createClient();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [moods, setMoods] = useState<Mood[]>([]);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [hoveredRun, setHoveredRun] = useState<number | null>(null);
  const [bodyStats, setBodyStats] = useState<BodyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [wRes, mRes, rRes, bRes] = await Promise.all([
        supabase.from('workouts').select('*').order('logged_date', { ascending: false }),
        supabase.from('daily_moods').select('*').eq('user_id', user.id).order('entry_date', { ascending: false }),
        supabase.from('books').select('*').eq('user_id', user.id).order('started_date', { ascending: false }),
        supabase.from('body_tracking').select('*').order('logged_date', { ascending: false }),
      ]);

      if (wRes.data) setWorkouts(wRes.data);
      if (mRes.data) setMoods(mRes.data);
      if (rRes.data) setReadings(rRes.data);
      if (bRes.data) setBodyStats(bRes.data);
    } catch (err) {
      console.error('Failed to fetch overview data', err);
    } finally {
      setLoading(false);
    }
  }

  // ─── Workout Stats ───
  const runs = workouts.filter(w => w.activity_type === 'running');
  const totalRuns = runs.length;
  const totalKm = runs.reduce((a, w) => a + (w.distance_km || 0), 0);
  const totalMins = runs.reduce((a, w) => a + w.duration_minutes, 0);
  const avgPace = totalKm > 0 ? totalMins / totalKm : 0;
  const avgPaceMin = Math.floor(avgPace);
  const avgPaceSec = Math.round((avgPace - avgPaceMin) * 60);
  const streak = calcStreak(workouts);

  // ─── Mood Stats ───
  const totalMoodEntries = moods.length;
  const avgMoodScore = totalMoodEntries > 0
    ? (moods.reduce((a, m) => a + moodScores[m.mood], 0) / totalMoodEntries)
    : 0;
  const latestMood = moods[0];
  const moodDistribution = moods.reduce((acc, m) => {
    acc[m.mood] = (acc[m.mood] || 0) + 1;
    return acc;
  }, {} as Record<MoodLevel, number>);

  // ─── Reading Stats ───
  const booksReading = readings.filter(r => r.status === 'reading');
  const booksCompleted = readings.filter(r => r.status === 'completed');
  const currentBook = booksReading[0];
  const totalPagesRead = readings.reduce((a, r) => a + r.pages_read, 0);

  // ─── Body Stats ───
  const latestBody = bodyStats[0];

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-8">
          <div className="h-20 bg-surface rounded-2xl animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-surface rounded-[32px] border border-dark-border animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl space-y-10">

        {/* ═══ HEADER ═══ */}
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter italic uppercase">
              Command Center
            </h1>
            <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
              All Systems — Operational Status
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted font-medium">{today}</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Live</span>
            </div>
          </div>
        </header>

        {/* ═══ TOP-LEVEL METRICS BAR ═══ */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricPill label="Total Runs" value={totalRuns} color="blue" />
          <MetricPill label="Mood Score" value={avgMoodScore.toFixed(1)} color="green" />
          <MetricPill label="Books Read" value={booksCompleted.length} color="purple" />
          <MetricPill label="Weight" value={latestBody ? `${latestBody.weight_kg}` : '—'} unit="kg" color="orange" />
        </section>

        {/* ═══ MAIN GRID ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── WORKOUTS SECTION ── */}
          <Link href="/workouts" className="group">
            <section className="bg-surface rounded-[32px] border border-dark-border p-8 hover:border-accent-blue/50 transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Running</h2>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Performance Log</p>
                </div>
                <span className="text-[9px] font-black text-accent-blue uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </span>
              </div>

              {/* Mini Performance Graph */}
              <RunChart runs={runs} hoveredRun={hoveredRun} setHoveredRun={setHoveredRun} />

              {/* Streak Bar */}
              <div className="bg-gradient-to-r from-[#3d2a1a] to-[#352315] rounded-xl p-4 border border-[#5a3d20] flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-[9px] font-black text-orange-400 uppercase tracking-widest">Current Streak</p>
                    <p className="text-2xl font-black text-orange-300">{streak} <span className="text-sm text-orange-500">{streak === 1 ? 'day' : 'days'}</span></p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                    <div key={i} className="w-2 h-6 bg-orange-500/60 rounded-full" style={{ height: `${12 + i * 4}px` }} />
                  ))}
                </div>
              </div>
            </section>
          </Link>

          {/* ── MOOD SECTION ── */}
          <Link href="/mood" className="group">
            <section className="bg-surface rounded-[32px] border border-dark-border p-8 hover:border-accent-green/50 transition-all h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Emotional Freq</h2>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Sentiment Analysis</p>
                </div>
                <span className="text-[9px] font-black text-accent-green uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </span>
              </div>

              {/* Mood Distribution — Full Card */}
              <div className="flex-1 flex flex-col">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-4">Frequency Distribution</p>
                <div className="flex gap-3 items-end flex-1" style={{ minHeight: '160px' }}>
                  {(['great', 'happy', 'so-so', 'weird', 'bad'] as MoodLevel[]).map(level => {
                    const count = moodDistribution[level] || 0;
                    const maxCount = Math.max(...Object.values(moodDistribution), 1);
                    const heightPercent = (count / maxCount) * 100;
                    return (
                      <div key={level} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[10px] font-black text-foreground">{count}</span>
                        <div
                          className="w-full rounded-lg transition-all relative group/bar"
                          style={{
                            height: `${Math.max(heightPercent, 6)}%`,
                            backgroundColor: moodColors[level],
                            opacity: count > 0 ? 0.85 : 0.12,
                            boxShadow: count > 0 ? `0 0 12px ${moodColors[level]}30` : 'none',
                          }}
                        />
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-base">{moodEmojis[level]}</span>
                          <span className="text-[8px] font-bold text-muted uppercase tracking-wider">{level}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-3 border-t border-dark-border/50 flex justify-between items-center">
                  <span className="text-[9px] font-black text-muted uppercase tracking-widest">{totalMoodEntries} Total Entries</span>
                  <span className="text-[9px] font-black text-accent-green uppercase tracking-widest">Avg {avgMoodScore.toFixed(1)} / 5</span>
                </div>
              </div>
            </section>
          </Link>

          {/* ── LIBRARY SECTION ── */}
          <Link href="/reading" className="group">
            <section className="bg-surface rounded-[32px] border border-dark-border p-8 hover:border-accent-purple/50 transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Library</h2>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Neural Archive</p>
                </div>
                <span className="text-[9px] font-black text-accent-purple uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-background/50 rounded-xl p-4 border border-dark-border text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Reading</p>
                  <p className="text-2xl font-black text-accent-blue">{booksReading.length}</p>
                </div>
                <div className="bg-background/50 rounded-xl p-4 border border-dark-border text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Done</p>
                  <p className="text-2xl font-black text-accent-green">{booksCompleted.length}</p>
                </div>
                <div className="bg-background/50 rounded-xl p-4 border border-dark-border text-center">
                  <p className="text-[8px] font-black text-muted uppercase tracking-widest mb-1">Pages</p>
                  <p className="text-2xl font-black text-accent-yellow">{totalPagesRead.toLocaleString()}</p>
                </div>
              </div>

              {/* Current Book */}
              {currentBook ? (
                <div className="bg-gradient-to-r from-[#1e1e3a] to-[#252540] rounded-xl p-4 border border-[#3a3a5c] flex items-center gap-4">
                  {currentBook.cover_image_url ? (
                    <img
                      src={currentBook.cover_image_url}
                      alt={currentBook.title}
                      className="w-12 h-16 object-cover rounded-lg border border-dark-border shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-16 rounded-lg bg-dark-border flex items-center justify-center text-xs text-muted">📖</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-black text-accent-purple uppercase tracking-widest">Currently Reading</p>
                    <p className="text-sm font-black text-foreground truncate">{currentBook.title}</p>
                    <p className="text-[10px] text-muted italic">by {currentBook.author}</p>
                    <div className="mt-2 h-1.5 bg-dark-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent-purple rounded-full transition-all"
                        style={{ width: `${(currentBook.pages_read / currentBook.total_pages) * 100}%` }}
                      />
                    </div>
                    <p className="text-[8px] text-muted mt-1">{currentBook.pages_read} / {currentBook.total_pages} pages</p>
                  </div>
                </div>
              ) : (
                <div className="bg-background/30 rounded-xl p-6 border border-dashed border-dark-border text-center">
                  <p className="text-muted text-xs italic">No book in progress</p>
                </div>
              )}
            </section>
          </Link>

          {/* ── BODY STATS SECTION ── */}
          <Link href="/body" className="group">
            <section className="bg-surface rounded-[32px] border border-dark-border p-8 hover:border-amber-500/50 transition-all h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-foreground uppercase tracking-tight italic">Body Stats</h2>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-[0.2em]">Biometric Scanner</p>
                </div>
                <span className="text-[9px] font-black text-amber-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                  View All →
                </span>
              </div>

              {latestBody ? (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <BodyMetric label="Weight" value={latestBody.weight_kg} unit="kg" color="text-amber-300" bgFrom="#3d2a1a" bgTo="#352315" border="#5a3d20" />
                    <BodyMetric label="Muscle" value={latestBody.muscle_mass_kg} unit="kg" color="text-green-300" bgFrom="#1a3a2a" bgTo="#152e22" border="#2d5a3f" />
                    <BodyMetric label="Fat Mass" value={latestBody.fat_mass_kg} unit="kg" color="text-red-300" bgFrom="#3a1a1a" bgTo="#351515" border="#5a2020" />
                    <BodyMetric label="BMR" value={latestBody.bmr_kcal} unit="kcal" color="text-blue-300" bgFrom="#1e3a5f" bgTo="#1a2d47" border="#264f78" />
                  </div>

                  {/* Body Composition Mini-Bar */}
                  <div className="bg-background/50 rounded-xl p-4 border border-dark-border">
                    <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-3">Composition Breakdown</p>
                    <div className="flex rounded-lg overflow-hidden h-4">
                      <div
                        className="bg-blue-400"
                        style={{ width: `${(latestBody.body_water_kg / latestBody.weight_kg) * 100}%` }}
                        title={`Water: ${latestBody.body_water_kg}kg`}
                      />
                      <div
                        className="bg-green-400"
                        style={{ width: `${(latestBody.muscle_mass_kg / latestBody.weight_kg) * 100}%` }}
                        title={`Muscle: ${latestBody.muscle_mass_kg}kg`}
                      />
                      <div
                        className="bg-red-400"
                        style={{ width: `${(latestBody.fat_mass_kg / latestBody.weight_kg) * 100}%` }}
                        title={`Fat: ${latestBody.fat_mass_kg}kg`}
                      />
                      <div
                        className="bg-amber-400"
                        style={{ width: `${(latestBody.bone_mineral_kg / latestBody.weight_kg) * 100}%` }}
                        title={`Bone: ${latestBody.bone_mineral_kg}kg`}
                      />
                      <div
                        className="bg-purple-400"
                        style={{ width: `${(latestBody.protein_mass_kg / latestBody.weight_kg) * 100}%` }}
                        title={`Protein: ${latestBody.protein_mass_kg}kg`}
                      />
                    </div>
                    <div className="flex justify-between mt-2 flex-wrap gap-y-1">
                      <Legend color="bg-blue-400" label="Water" />
                      <Legend color="bg-green-400" label="Muscle" />
                      <Legend color="bg-red-400" label="Fat" />
                      <Legend color="bg-amber-400" label="Bone" />
                      <Legend color="bg-purple-400" label="Protein" />
                    </div>
                  </div>

                  <p className="text-[8px] text-muted text-right mt-2 italic">
                    Last scan: {latestBody.logged_date} • {latestBody.body_type}
                  </p>
                </>
              ) : (
                <div className="bg-background/30 rounded-xl p-10 border border-dashed border-dark-border text-center">
                  <p className="text-muted text-xs italic">No biometric data recorded yet</p>
                </div>
              )}
            </section>
          </Link>

        </div>

        {/* ═══ QUICK NAV ═══ */}
        <section className="pb-8">
          <p className="text-[9px] font-black text-muted uppercase tracking-widest mb-4">Quick Navigation</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <QuickNav href="/workouts" icon="🏃" label="Workouts" accent="border-accent-blue/30 hover:border-accent-blue" />
            <QuickNav href="/mood" icon="🧠" label="Mood" accent="border-accent-green/30 hover:border-accent-green" />
            <QuickNav href="/reading" icon="📚" label="Library" accent="border-accent-purple/30 hover:border-accent-purple" />
            <QuickNav href="/body" icon="💪" label="Body Stats" accent="border-amber-500/30 hover:border-amber-500" />
          </div>
        </section>

      </div>
    </main>
  );
}

// ─── Sub-components ───

function RunChart({ runs, hoveredRun, setHoveredRun }: {
  runs: Workout[]; hoveredRun: number | null; setHoveredRun: (i: number | null) => void;
}) {
  const recentRuns = [...runs]
    .sort((a, b) => new Date(a.logged_date).getTime() - new Date(b.logged_date).getTime())
    .slice(-8);

  if (recentRuns.length < 2) {
    return (
      <div className="h-[140px] bg-background/30 rounded-xl border border-dashed border-dark-border flex items-center justify-center mb-4">
        <p className="text-muted text-xs italic">Need 2+ runs to display chart</p>
      </div>
    );
  }

  const W = 440, H = 130, PX = 32, PY = 16;
  const distances = recentRuns.map(r => r.distance_km || 0);
  const maxD = Math.max(...distances) * 1.15;
  const minD = Math.min(...distances) * 0.85;
  const range = maxD - minD || 1;

  const points = recentRuns.map((r, i) => ({
    x: PX + (i / (recentRuns.length - 1)) * (W - PX * 2),
    y: PY + (1 - ((r.distance_km || 0) - minD) / range) * (H - PY * 2),
    run: r,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H - PY} L${points[0].x},${H - PY} Z`;

  const hovered = hoveredRun !== null && points[hoveredRun] ? points[hoveredRun] : null;
  const hoveredData = hovered ? hovered.run : null;
  const hoveredPace = hoveredData && hoveredData.distance_km && hoveredData.distance_km > 0
    ? hoveredData.duration_minutes / hoveredData.distance_km : null;
  const pMin = hoveredPace ? Math.floor(hoveredPace) : null;
  const pSec = hoveredPace ? Math.round((hoveredPace - Math.floor(hoveredPace)) * 60) : null;

  return (
    <div className="relative bg-background/30 rounded-xl border border-dark-border p-3 mb-0">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[140px]" onMouseLeave={() => setHoveredRun(null)}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#569cd6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#569cd6" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(frac => {
          const y = PY + frac * (H - PY * 2);
          return <line key={frac} x1={PX} y1={y} x2={W - PX} y2={y} stroke="#3c3c3c" strokeWidth="0.5" strokeDasharray="4 3" />;
        })}
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#569cd6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredRun(i)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
            <circle cx={p.x} cy={p.y} r={hoveredRun === i ? 5 : 3.5} fill={hoveredRun === i ? '#fff' : '#569cd6'} stroke="#1e1e1e" strokeWidth="2" className="transition-all" />
          </g>
        ))}
        {/* X-axis date labels */}
        {points.map((p, i) => (
          <text key={`lbl-${i}`} x={p.x} y={H - 2} textAnchor="middle" fontSize="8" fill="#808080" fontWeight="700">
            {new Date(p.run.logged_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        ))}
      </svg>

      {/* Tooltip */}
      {hovered && hoveredData && (
        <div
          className="absolute z-10 pointer-events-none bg-[#1e1e1e] border border-accent-blue/40 rounded-xl px-4 py-3 shadow-2xl shadow-black/50"
          style={{
            left: `${(hovered.x / W) * 100}%`,
            top: '-8px',
            transform: 'translate(-50%, -100%)',
            minWidth: '150px',
          }}
        >
          <p className="text-[9px] font-black text-accent-blue uppercase tracking-widest mb-1.5">
            {new Date(hoveredData.logged_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <div className="flex justify-between gap-4">
            <div>
              <p className="text-[8px] font-bold text-muted uppercase">Distance</p>
              <p className="text-sm font-black text-green-300">{hoveredData.distance_km?.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-muted uppercase">Pace</p>
              <p className="text-sm font-black text-purple-300">
                {pMin !== null ? `${pMin}:${pSec?.toString().padStart(2, '0')}` : '—'} /km
              </p>
            </div>
          </div>
          <div className="mt-1.5 pt-1.5 border-t border-dark-border/50">
            <p className="text-[8px] text-muted"><span className="font-bold">{hoveredData.duration_minutes}</span> min total</p>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-accent-blue/40" />
        </div>
      )}
    </div>
  );
}

function MetricPill({ label, value, unit, color }: { label: string; value: string | number; unit?: string; color: string }) {
  const colorMap: Record<string, { bg: string; text: string; label: string }> = {
    blue: { bg: 'from-[#1e3a5f] to-[#1a2d47]', text: 'text-blue-300', label: 'text-blue-400' },
    green: { bg: 'from-[#1a3a2a] to-[#152e22]', text: 'text-green-300', label: 'text-green-400' },
    purple: { bg: 'from-[#2d1f3d] to-[#231735]', text: 'text-purple-300', label: 'text-purple-400' },
    orange: { bg: 'from-[#3d2a1a] to-[#352315]', text: 'text-amber-300', label: 'text-amber-400' },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className={`bg-gradient-to-br ${c.bg} p-5 rounded-xl border border-white/5`}>
      <p className={`text-[9px] font-black ${c.label} uppercase tracking-[0.15em] mb-1`}>{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-black ${c.text}`}>{value}</span>
        {unit && <span className="text-xs text-muted">{unit}</span>}
      </div>
    </div>
  );
}

function BodyMetric({ label, value, unit, color, bgFrom, bgTo, border }: {
  label: string; value: number; unit: string; color: string; bgFrom: string; bgTo: string; border: string;
}) {
  return (
    <div className="bg-gradient-to-br p-4 rounded-xl border" style={{ backgroundImage: `linear-gradient(to bottom right, ${bgFrom}, ${bgTo})`, borderColor: border }}>
      <p className="text-[9px] font-black text-muted uppercase tracking-[0.1em] mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className={`text-xl font-black ${color}`}>{value}</span>
        <span className="text-xs text-muted">{unit}</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-[8px] text-muted font-bold uppercase">{label}</span>
    </div>
  );
}

function QuickNav({ href, icon, label, accent }: { href: string; icon: string; label: string; accent: string }) {
  return (
    <Link href={href} className={`bg-surface border ${accent} rounded-xl p-4 flex items-center gap-3 transition-all hover:bg-surface-hover`}>
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-foreground">{label}</span>
    </Link>
  );
}