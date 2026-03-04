'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BodyStats } from '@/types/habits';
import BodyCompositionMap from '@/components/habits/BodyCompositionMap';
import BodyHologram from '@/components/habits/BodyHologram';

export default function BodyPage() {
  const supabase = createClient();
  const [history, setHistory] = useState<BodyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('body_tracking').select('*').order('logged_date', { ascending: false });
    if (data) setHistory(data);
    setLoading(false);
  }

  async function handleAddEntry(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    const newEntry = {
      user_id: user?.id,
      weight_kg: parseFloat(formData.get('weight_kg') as string),
      body_water_kg: parseFloat(formData.get('body_water_kg') as string),
      fat_mass_kg: parseFloat(formData.get('fat_mass_kg') as string),
      bone_mineral_kg: parseFloat(formData.get('bone_mineral_kg') as string),
      protein_mass_kg: parseFloat(formData.get('protein_mass_kg') as string),
      muscle_mass_kg: parseFloat(formData.get('muscle_mass_kg') as string),
      bmr_kcal: parseInt(formData.get('bmr_kcal') as string),
      body_type: formData.get('body_type') as string,
      logged_date: formData.get('logged_date') as string,
    };

    const { error } = await supabase.from('body_tracking').insert([newEntry]);
    if (!error) { fetchStats(); setShowForm(false); }
    setSaving(false);
  }

  const latest = history[0];

  return (
    <main className="max-w-7xl mx-auto space-y-12 pb-24 relative">
      <header>
        <h1 className="text-4xl font-black italic text-foreground tracking-tighter uppercase">Physical Evolution</h1>
        <p className="text-muted text-[10px] font-bold uppercase tracking-[0.4em] mt-2 italic">Biometric Data Visualization</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: The Professional 2D Hologram */}
        <section className="sticky top-8">
          <BodyHologram stats={latest || null} />
        </section>

        {/* RIGHT COLUMN: Professional Report & History */}
        <section className="space-y-8">
          {loading ? (
            <div className="h-[500px] bg-surface rounded-[40px] border border-dark-border animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-muted font-black tracking-widest uppercase italic">Initializing Scanners...</span>
            </div>
          ) : latest ? (
            <BodyCompositionMap stats={latest} />
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center bg-surface rounded-[40px] border border-dashed border-dark-border text-muted">
               <p className="italic text-sm">No biometric signature found in archive.</p>
            </div>
          )}

          {/* Historical Logs */}
          <div className="bg-surface rounded-[32px] border border-dark-border overflow-hidden">
            <div className="px-8 py-4 bg-white/5 border-b border-dark-border">
              <p className="text-[10px] font-black text-muted uppercase tracking-widest italic">Evolution Logs</p>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-dark-border/30">
              {history.map((entry) => (
                <div key={entry.id} className="px-8 py-4 flex justify-between items-center hover:bg-white/[0.02]">
                  <span className="text-xs font-black text-foreground italic">{entry.logged_date}</span>
                  <div className="flex gap-6">
                    <HistoryItem label="WT" val={entry.weight_kg} />
                    <HistoryItem label="MS" val={entry.muscle_mass_kg} />
                    <HistoryItem label="FT" val={entry.fat_mass_kg} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* UNIQUE AMBER BUTTON FOR BODY STATS */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-full flex items-center justify-center text-3xl font-bold hover:shadow-xl hover:shadow-amber-500/20 hover:scale-110 transition-all z-50 shadow-2xl"
      >
        <span className="mb-1">+</span>
      </button>

      {/* ENTRY MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-surface rounded-[40px] border border-dark-border p-10 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-300">
            <button onClick={() => setShowForm(false)} className="absolute top-8 right-8 text-muted hover:text-white">✕</button>
            <h2 className="text-xl font-black text-amber-500 uppercase mb-8 italic tracking-tight">Perform New Scan</h2>
            <form onSubmit={handleAddEntry} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Weight (kg)" name="weight_kg" placeholder="75.5" />
                <FormInput label="Muscle (kg)" name="muscle_mass_kg" placeholder="35.0" />
                <FormInput label="Fat Mass (kg)" name="fat_mass_kg" placeholder="12.0" />
                <FormInput label="Water (kg)" name="body_water_kg" placeholder="42.0" />
                <FormInput label="Bone (kg)" name="bone_mineral_kg" placeholder="3.0" />
                <FormInput label="Protein (kg)" name="protein_mass_kg" placeholder="11.0" />
                <FormInput label="BMR (Kcal)" name="bmr_kcal" placeholder="1800" />
                <FormInput label="Body Type" name="body_type" placeholder="Athletic" />
              </div>
              <FormInput label="Scan Date" name="logged_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              <button disabled={saving} className="w-full py-5 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-500 transition-all uppercase tracking-widest shadow-xl shadow-amber-600/20">
                {saving ? 'SYNCING...' : 'INITIATE DATA SYNC'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function FormInput({ label, ...props }: any) {
  return (
    <div>
      <label className="text-[9px] font-black text-muted uppercase block mb-1.5 ml-1 tracking-widest">{label}</label>
      <input required {...props} className="w-full bg-background border border-dark-border p-3 rounded-xl text-foreground text-sm outline-none focus:ring-1 focus:ring-amber-500" />
    </div>
  );
}

function HistoryItem({ label, val }: any) {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-[8px] font-black text-muted uppercase tracking-tighter">{label}</span>
      <span className="text-xs font-black text-foreground">{val}</span>
    </div>
  );
}