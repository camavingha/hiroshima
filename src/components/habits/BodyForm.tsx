'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';


export default function BodyForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    // Collecting data from your form fields
    const { data, error } = await supabase
      .from('body_tracking')
      .insert([
        {
          weight_kg: parseFloat(formData.get('weight') as string),
          waist_cm: parseFloat(formData.get('waist') as string),
          chest_cm: parseFloat(formData.get('chest') as string),
          thigh_cm: parseFloat(formData.get('thigh') as string),
          logged_date: formData.get('date'),
          // user_id is automatically handled by Supabase Auth + RLS if set up, 
          // but we usually grab it to be safe:
        }
      ]);

    setLoading(false);
    if (error) alert(error.message);
    else alert('Evolution saved successfully!');
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-dark-border shadow-sm max-w-md">
      <h2 className="text-xl font-bold text-foreground mb-4">Update Body Stats</h2>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-1">Weight (kg)</label>
            <input type="number" step="0.1" className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50" placeholder="00.0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-1">Waist (cm)</label>
            <input type="number" step="0.1" className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50" placeholder="00.0" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-1">Chest (cm)</label>
            <input type="number" step="0.1" className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50" placeholder="00.0" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted uppercase mb-1">Thigh (cm)</label>
            <input type="number" step="0.1" className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground placeholder:text-muted/50" placeholder="00.0" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-1">Measurement Date</label>
          <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg text-foreground" />
        </div>

        <button type="submit" className="w-full py-3 bg-accent-blue text-white rounded-xl font-bold hover:bg-accent-blue/80 transition-colors">
          Save Progress
        </button>
      </form>
    </div>
  );
}