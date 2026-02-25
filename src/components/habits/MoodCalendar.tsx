'use client';
import { useState } from 'react';
import { Mood, MoodLevel } from '@/types/habits';

interface MoodCalendarProps {
    moods: Mood[];
}

const moodColors: Record<MoodLevel, string> = {
    'great': 'bg-green-500',
    'happy': 'bg-green-400/70',
    'so-so': 'bg-yellow-500/60',
    'weird': 'bg-orange-500/50',
    'bad': 'bg-red-500/50',
};

const moodEmojis: Record<MoodLevel, string> = {
    'great': '😄',
    'happy': '🙂',
    'so-so': '😐',
    'weird': '😕',
    'bad': '😞',
};

const moodLabels: Record<MoodLevel, string> = {
    'great': 'Great',
    'happy': 'Happy',
    'so-so': 'So-so',
    'weird': 'Weird',
    'bad': 'Bad',
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MoodCalendar({ moods }: MoodCalendarProps) {
    const [hoveredCell, setHoveredCell] = useState<{ dateStr: string; mood: MoodLevel | null; x: number; y: number } | null>(null);

    // Build maps
    const moodMap = new Map<string, MoodLevel>();
    const notesMap = new Map<string, string>();
    moods.forEach(m => {
        moodMap.set(m.entry_date, m.mood);
        if (m.notes) notesMap.set(m.entry_date, m.notes);
    });

    // Generate last 20 weeks
    const today = new Date();
    const weeks: Date[][] = [];
    const endDate = new Date(today);
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (20 * 7) - startDate.getDay() + 1);

    let currentDate = new Date(startDate);
    let currentWeek: Date[] = [];

    while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        const mondayBasedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        if (mondayBasedDay === 0 && currentWeek.length > 0) {
            weeks.push(currentWeek);
            currentWeek = [];
        }

        currentWeek.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    // Month labels
    const monthLabels: { label: string; colStart: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
        const firstDay = week[0];
        const month = firstDay.getMonth();
        if (month !== lastMonth) {
            monthLabels.push({
                label: firstDay.toLocaleDateString('en-US', { month: 'short' }),
                colStart: weekIndex,
            });
            lastMonth = month;
        }
    });

    const isFuture = (date: Date) => {
        const todayStr = today.toISOString().split('T')[0];
        const dateStr = date.toISOString().split('T')[0];
        return dateStr > todayStr;
    };

    const handleMouseEnter = (e: React.MouseEvent, dateStr: string, mood: MoodLevel | null) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const parentRect = (e.currentTarget as HTMLElement).closest('.mood-grid-container')?.getBoundingClientRect();
        if (parentRect) {
            setHoveredCell({
                dateStr,
                mood,
                x: rect.left - parentRect.left + rect.width / 2,
                y: rect.top - parentRect.top,
            });
        }
    };

    return (
        <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden">
            <div className="p-8 border-b border-dark-border">
                <h2 className="text-2xl font-black text-foreground tracking-tight italic">MOOD MAP</h2>
                <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Your emotional landscape over time</p>
            </div>

            <div className="p-8 overflow-x-auto">
                {/* Month Labels */}
                <div className="flex mb-2 ml-10">
                    {monthLabels.map((m, i) => (
                        <div
                            key={i}
                            className="text-[10px] text-muted font-bold uppercase tracking-wider"
                            style={{ marginLeft: i === 0 ? `${m.colStart * 18}px` : `${(m.colStart - (monthLabels[i - 1]?.colStart || 0)) * 18 - 30}px` }}
                        >
                            {m.label}
                        </div>
                    ))}
                </div>

                <div className="flex gap-0 relative mood-grid-container">
                    {/* Day Labels */}
                    <div className="flex flex-col gap-[3px] mr-2 pt-0">
                        {dayLabels.map((day, i) => (
                            <div key={day} className="h-[14px] flex items-center">
                                {i % 2 === 0 && (
                                    <span className="text-[9px] text-muted font-medium w-7 text-right">{day}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="flex gap-[3px]">
                        {weeks.map((week, weekIndex) => (
                            <div key={weekIndex} className="flex flex-col gap-[3px]">
                                {weekIndex === 0 && week.length < 7 && (
                                    Array.from({ length: 7 - week.length }).map((_, i) => (
                                        <div key={`pad-${i}`} className="w-[14px] h-[14px]" />
                                    ))
                                )}
                                {week.map((date) => {
                                    const dateStr = date.toISOString().split('T')[0];
                                    const mood = moodMap.get(dateStr);
                                    const future = isFuture(date);

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`w-[14px] h-[14px] rounded-[3px] transition-all cursor-pointer ${future
                                                    ? 'bg-transparent'
                                                    : mood
                                                        ? `${moodColors[mood]} hover:ring-2 hover:ring-foreground/30 hover:scale-150 hover:z-10`
                                                        : 'bg-dark-border/50 hover:bg-dark-border hover:scale-150'
                                                }`}
                                            onMouseEnter={(e) => !future && handleMouseEnter(e, dateStr, mood || null)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredCell && (
                        <div
                            className="absolute z-50 pointer-events-none"
                            style={{
                                left: `${hoveredCell.x}px`,
                                top: `${hoveredCell.y - 8}px`,
                                transform: 'translate(-50%, -100%)',
                            }}
                        >
                            <div className="bg-[#1e1e1e] border border-dark-border-light rounded-xl shadow-2xl px-4 py-3 min-w-[160px]">
                                {/* Date */}
                                <p className="text-[10px] text-muted font-bold uppercase tracking-wider mb-1">
                                    {new Date(hoveredCell.dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>

                                {hoveredCell.mood ? (
                                    <>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xl">{moodEmojis[hoveredCell.mood]}</span>
                                            <span className="font-black text-foreground capitalize text-sm">{moodLabels[hoveredCell.mood]}</span>
                                        </div>
                                        {notesMap.get(hoveredCell.dateStr) && (
                                            <p className="text-[10px] text-muted mt-1 italic truncate max-w-[200px]">
                                                &quot;{notesMap.get(hoveredCell.dateStr)}&quot;
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-xs text-muted/60 mt-1 italic">No entry logged</p>
                                )}
                            </div>
                            {/* Arrow */}
                            <div className="flex justify-center">
                                <div className="w-2 h-2 bg-[#1e1e1e] border-r border-b border-dark-border-light rotate-45 -mt-1" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-6 ml-10">
                    <span className="text-[10px] text-muted font-bold">Less</span>
                    <div className="flex gap-1">
                        <div className="w-[14px] h-[14px] rounded-[3px] bg-dark-border/50" title="No entry" />
                        <div className={`w-[14px] h-[14px] rounded-[3px] ${moodColors['bad']}`} title="Bad" />
                        <div className={`w-[14px] h-[14px] rounded-[3px] ${moodColors['weird']}`} title="Weird" />
                        <div className={`w-[14px] h-[14px] rounded-[3px] ${moodColors['so-so']}`} title="So-so" />
                        <div className={`w-[14px] h-[14px] rounded-[3px] ${moodColors['happy']}`} title="Happy" />
                        <div className={`w-[14px] h-[14px] rounded-[3px] ${moodColors['great']}`} title="Great" />
                    </div>
                    <span className="text-[10px] text-muted font-bold">More</span>
                    <div className="flex items-center gap-2 ml-4">
                        {Object.entries(moodEmojis).reverse().map(([level, emoji]) => (
                            <span key={level} className="text-xs" title={level}>{emoji}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
