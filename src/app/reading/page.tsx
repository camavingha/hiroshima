'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Reading } from '@/types/habits';
import ReadingForm from '@/components/habits/ReadingForm';
import UpdateProgress from '@/components/habits/UpdateProgress';
import ReadingTimeline from '@/components/habits/ReadingTimeline';
import { MOCK_READINGS } from '@/utils/mockData';

export default function Page() {
  const supabase = createClient();
  const [readings, setReadings] = useState<Reading[]>(MOCK_READINGS);
  const [filteredReadings, setFilteredReadings] = useState<Reading[]>(MOCK_READINGS);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchReadings();
  }, []);

  const fetchReadings = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setReadings(MOCK_READINGS);
        setFilteredReadings(MOCK_READINGS);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .order('started_date', { ascending: false });

      if (error) {
        setReadings(MOCK_READINGS);
        setFilteredReadings(MOCK_READINGS);
      } else if (data) {
        setReadings(data);
        setFilteredReadings(data);
      }
    } catch (err) {
      setReadings(MOCK_READINGS);
      setFilteredReadings(MOCK_READINGS);
    } finally {
      setLoading(false);
    }
  };

  const handleReadingAdded = (newReading: Reading) => {
    setReadings(prev => [newReading, ...prev]);
    setFilteredReadings(prev => [newReading, ...prev]);
  };

  const handleProgressUpdated = (updatedReading: Reading) => {
    const updateList = (prev: Reading[]) =>
      prev.map(r => (r.id === updatedReading.id ? updatedReading : r));

    setReadings(updateList);
    setFilteredReadings(updateList);
  };

  return (
    <main className="max-w-7xl mx-auto p-8 bg-background min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-foreground tracking-tight text-left">Reading Journey</h1>
        <p className="text-muted text-left">Your historical reading activity log.</p>
      </header>

      {/* Update Progress Section - Book Album */}
      <section className="mb-12">
        <UpdateProgress readings={readings} onProgressUpdated={handleProgressUpdated} />
      </section>

      {/* Content Section - Timeline */}
      <section className="mt-12 flex justify-start">
        {loading ? (
          <div className="text-left py-12">
            <p className="text-muted italic">Loading activity feed...</p>
          </div>
        ) : (
          <ReadingTimeline readings={filteredReadings} />
        )}
      </section>

      {/* Floating Action Button for Adding Books */}
      <ReadingForm isOpen={showAddForm} onToggle={setShowAddForm} onReadingAdded={handleReadingAdded} />
    </main>
  );
}