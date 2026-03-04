'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Mood, MoodLevel } from '@/types/habits';

interface MoodFormProps {
    onMoodAdded?: (mood: Mood) => void;
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
}

const moodOptions: { level: MoodLevel; emoji: string; label: string; color: string }[] = [
    { level: 'great', emoji: '🤩', label: 'Great', color: 'bg-green-500 ring-green-400/30' },
    { level: 'happy', emoji: '😊', label: 'Happy', color: 'bg-green-600/70 ring-green-500/30' },
    { level: 'so-so', emoji: '😐', label: 'So-so', color: 'bg-yellow-500/70 ring-yellow-400/30' },
    { level: 'weird', emoji: '🫠', label: 'Weird', color: 'bg-orange-500/70 ring-orange-400/30' },
    { level: 'bad', emoji: '😞', label: 'Bad', color: 'bg-red-500/70 ring-red-400/30' },
];

export default function MoodForm({ onMoodAdded, isOpen = false, onToggle }: MoodFormProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
    const [notes, setNotes] = useState('');
    const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = async () => {
        if (!selectedMood) return;
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            const newMood = {
                user_id: user?.id,
                mood: selectedMood,
                notes: notes.trim() || null, // Ensure empty strings are sent as null
                entry_date: entryDate,
            };

            const { data, error } = await supabase
                .from('daily_moods') // Target correct table
                .insert([newMood])
                .select()
                .single();

            if (error) {
                alert(`Error: ${error.message}`);
            } else {
                onMoodAdded?.(data);
                onToggle?.(false);
                setSelectedMood(null);
                setNotes('');
                setEntryDate(new Date().toISOString().split('T')[0]);
            }
        } catch (err) {
            alert('Failed to log mood');
        } finally {
            setLoading(false);
        }
    };

    const selectedOption = moodOptions.find(m => m.level === selectedMood);

    return (
        <>
            <button
                onClick={() => onToggle?.(!isOpen)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-accent-green to-green-700 text-white rounded-full flex items-center justify-center text-3xl font-bold hover:shadow-xl hover:shadow-accent-green/20 hover:scale-110 transition-all transform z-50"
            >
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => onToggle?.(false)}>
                    <div className="bg-surface rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-dark-border animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        <div className="relative p-8 bg-gradient-to-br from-accent-green to-green-700 text-center">
                            <button
                                onClick={() => onToggle?.(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                            >
                                <span className="text-xl">✕</span>
                            </button>
                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-2">How are you feeling?</p>
                            <div className="text-5xl mb-1">
                                {selectedOption ? selectedOption.emoji : '🫥'}
                            </div>
                            <p className="text-white font-black text-lg uppercase tracking-tight">
                                {selectedOption ? selectedOption.label : 'Select your mood'}
                            </p>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex justify-center gap-3">
                                {moodOptions.map(opt => (
                                    <button
                                        key={opt.level}
                                        onClick={() => setSelectedMood(opt.level)}
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${opt.color} ${selectedMood === opt.level
                                                ? 'ring-4 scale-110 shadow-lg'
                                                : 'opacity-60 hover:opacity-100'
                                            }`}
                                        title={opt.label}
                                    >
                                        {opt.emoji}
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase mb-2">Date</label>
                                <input
                                    type="date"
                                    value={entryDate}
                                    onChange={(e) => setEntryDate(e.target.value)}
                                    className="w-full p-3 bg-input-bg border border-dark-border-light rounded-xl focus:ring-2 focus:ring-accent-green outline-none text-foreground"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase mb-2">Notes (optional)</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full p-3 bg-input-bg border border-dark-border-light rounded-xl focus:ring-2 focus:ring-accent-green outline-none text-foreground resize-none placeholder:text-muted/50"
                                    placeholder="What made you feel this way?"
                                    rows={3}
                                />
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading || !selectedMood}
                                className="w-full py-5 bg-accent-green text-white rounded-[24px] font-black text-lg hover:bg-accent-green/80 transition-all shadow-xl shadow-accent-green/10 disabled:bg-dark-border disabled:text-muted"
                            >
                                {loading ? 'SAVING...' : 'LOG MOOD'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}