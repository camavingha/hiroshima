'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout } from '@/types/habits';

interface RunningFormProps {
    onWorkoutAdded?: (workout: Workout) => void;
    isOpen?: boolean;
    onToggle?: (open: boolean) => void;
}

export default function RunningForm({ onWorkoutAdded, isOpen = false, onToggle }: RunningFormProps) {
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        duration_minutes: '',
        distance_km: '',
        logged_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Calculate pace (min/km) from duration and distance
    const calcPace = () => {
        const dur = parseFloat(formData.duration_minutes);
        const dist = parseFloat(formData.distance_km);
        if (dur && dist && dist > 0) {
            const paceMin = Math.floor(dur / dist);
            const paceSec = Math.round(((dur / dist) - paceMin) * 60);
            return `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
        }
        return '--:--';
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const newWorkout = {
                activity_type: 'running' as const,
                duration_minutes: parseInt(formData.duration_minutes),
                distance_km: formData.distance_km ? parseFloat(formData.distance_km) : undefined,
                logged_date: formData.logged_date,
            };

            const { data, error } = await supabase
                .from('workouts')
                .insert([newWorkout])
                .select()
                .single();

            if (error) {
                alert(`Error: ${error.message}`);
            } else {
                alert('Run logged successfully! 🏃');
                onWorkoutAdded?.(data);
                onToggle?.(false);
                setFormData({
                    duration_minutes: '',
                    distance_km: '',
                    logged_date: new Date().toISOString().split('T')[0],
                    notes: '',
                });
            }
        } catch (err) {
            alert('Failed to log run');
        } finally {
            setLoading(false);
        }
    };

    const pace = calcPace();

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => onToggle?.(!isOpen)}
                className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-accent-blue to-blue-700 text-white rounded-full flex items-center justify-center text-3xl font-bold hover:shadow-xl hover:shadow-accent-blue/20 hover:scale-110 transition-all transform z-50"
            >
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
            </button>

            {/* Modal Overlay & Form */}
            {isOpen && (
                <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => onToggle?.(false)}>
                    <div className="bg-surface rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-dark-border animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="relative p-8 bg-accent-blue flex items-center gap-4">
                            <button
                                onClick={() => onToggle?.(false)}
                                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
                            >
                                <span className="text-xl">✕</span>
                            </button>

                            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                <span className="text-3xl">🏃</span>
                            </div>
                            <div className="text-white pr-8">
                                <h4 className="text-xl font-black leading-tight uppercase tracking-tight">Log Run</h4>
                                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Track your progress</p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            {/* Live Pace Display */}
                            <div className="bg-background rounded-3xl p-6 border border-dark-border text-center">
                                <p className="text-[9px] font-black text-muted uppercase tracking-[0.15em] mb-2">Estimated Pace</p>
                                <p className="text-4xl font-black text-accent-blue">{pace}</p>
                                <p className="text-[10px] text-muted uppercase tracking-wider mt-1">min / km</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase mb-2">Distance (km)</label>
                                    <input
                                        type="number"
                                        name="distance_km"
                                        value={formData.distance_km}
                                        onChange={handleChange}
                                        required
                                        step="0.01"
                                        min="0.1"
                                        className="w-full p-3 bg-input-bg border border-dark-border-light rounded-xl focus:ring-2 focus:ring-accent-blue outline-none text-foreground text-lg font-bold text-center placeholder:text-muted/50"
                                        placeholder="5.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-muted uppercase mb-2">Duration (min)</label>
                                    <input
                                        type="number"
                                        name="duration_minutes"
                                        value={formData.duration_minutes}
                                        onChange={handleChange}
                                        required
                                        min="1"
                                        className="w-full p-3 bg-input-bg border border-dark-border-light rounded-xl focus:ring-2 focus:ring-accent-blue outline-none text-foreground text-lg font-bold text-center placeholder:text-muted/50"
                                        placeholder="30"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted uppercase mb-2">Date</label>
                                <input
                                    type="date"
                                    name="logged_date"
                                    value={formData.logged_date}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-input-bg border border-dark-border-light rounded-xl focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-accent-blue text-white rounded-[24px] font-black text-lg hover:bg-accent-blue/80 transition-all shadow-xl shadow-accent-blue/10 disabled:bg-dark-border"
                            >
                                {loading ? 'LOGGING...' : 'LOG RUN 🏃'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
