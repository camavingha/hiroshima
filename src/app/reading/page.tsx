'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Reading } from '@/types/habits';
import ReadingForm from '@/components/habits/ReadingForm';
import UpdateProgress from '@/components/habits/UpdateProgress';
import ReadingTimeline from '@/components/habits/ReadingTimeline';

export default function Page() {
  const supabase = createClient();
  // Initialize with empty array - no more MOCK_READINGS fallback
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('Authentication error or no user found');
        setReadings([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('started_date', { ascending: false });

      if (error) {
        console.error('Database Error:', error.message);
        setReadings([]);
      } else if (data) {
        setReadings(data);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setReadings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReadingAdded = (newReading: Reading) => {
    setReadings(prev => [newReading, ...prev]);
  };

  const handleProgressUpdated = (updatedReading: Reading) => {
    setReadings(prev =>
      prev.map(r => (r.id === updatedReading.id ? updatedReading : r))
    );
  };

  return (
    <main className="min-h-screen bg-background p-8 flex flex-col items-center">
      {/* Centered Content Constraint Container */}
      <div className="w-full max-w-5xl space-y-12">
        
        {/* Header */}
        <header className="text-left">
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight italic uppercase">Hiroshima Collection</h1>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Live Neural Library Link</p>
        </header>

        {/* Update Progress Section - Book Album */}
        <section>
          {loading ? (
            <div className="h-[400px] flex items-center justify-center bg-surface rounded-[32px] border border-dark-border animate-pulse">
               <p className="text-muted font-black uppercase tracking-widest text-xs text-center px-8">
                Scanning Library Archive...
               </p>
            </div>
          ) : (
            <UpdateProgress readings={readings} onProgressUpdated={handleProgressUpdated} />
          )}
        </section>

        {/* Content Section - Timeline */}
        <section className="pb-24">
          <div className="flex justify-between items-end mb-8 border-b border-dark-border pb-4">
             <div>
                <h2 className="text-2xl font-black text-foreground tracking-tight italic uppercase">Activity Feed</h2>
                <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Historical archive logs</p>
             </div>
             <div className="text-[10px] font-black text-accent-purple">
                {readings.length} VOLUMES TRACKED
             </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted italic">Decrypting reading activity...</div>
          ) : readings.length === 0 ? (
            <div className="text-center py-12 bg-surface rounded-[32px] border border-dark-border border-dashed">
               <p className="text-muted italic">No logs found in the current archive.</p>
            </div>
          ) : (
            <ReadingTimeline readings={readings} />
          )}
        </section>
      </div>

      {/* Floating Action Button for Adding Books */}
      <ReadingForm isOpen={showAddForm} onToggle={setShowAddForm} onReadingAdded={handleReadingAdded} />
    </main>
  );
}