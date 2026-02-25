'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout } from '@/types/habits';

interface WorkoutFormProps {
  onWorkoutAdded?: (workout: Workout) => void;
}

export default function WorkoutForm({ onWorkoutAdded }: WorkoutFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: 'running' as Workout['activity_type'],
    duration_minutes: '',
    distance_km: '',
    logged_date: new Date().toISOString().split('T')[0],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newWorkout = {
        activity_type: formData.activity_type,
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
        alert('Workout logged successfully!');
        onWorkoutAdded?.(data);
        setFormData({
          activity_type: 'running',
          duration_minutes: '',
          distance_km: '',
          logged_date: new Date().toISOString().split('T')[0],
        });
      }
    } catch (err) {
      alert('Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-dark-border shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">Log Workout</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Activity Type</label>
            <select
              name="activity_type"
              value={formData.activity_type}
              onChange={handleChange}
              className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
            >
              <option value="running">Running</option>
              <option value="training">Training</option>
              <option value="walking">Walking</option>
              <option value="swimming">Swimming</option>
              <option value="cycling">Cycling</option>
              <option value="yoga">Yoga</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Duration (minutes)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50"
              placeholder="30"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Distance (km, optional)</label>
            <input
              type="number"
              name="distance_km"
              value={formData.distance_km}
              onChange={handleChange}
              step="0.1"
              className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50"
              placeholder="5.0"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-2">Date</label>
            <input
              type="date"
              name="logged_date"
              value={formData.logged_date}
              onChange={handleChange}
              className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-accent-blue text-white rounded-xl font-bold hover:bg-accent-blue/80 transition-colors disabled:bg-dark-border"
        >
          {loading ? 'Logging...' : 'Log Workout'}
        </button>
      </form>
    </div>
  );
}
