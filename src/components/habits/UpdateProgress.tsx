'use client';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Reading } from '@/types/habits';
import CircularProgress from './CircularProgress';

interface UpdateProgressProps {
  readings: Reading[];
  onProgressUpdated?: (reading: Reading) => void;
}

const genreEmojis: Record<Reading['genre'], string> = {
  fiction: '📖', 'non-fiction': '📚', science: '🔬', biography: '👤',
  history: '📜', 'self-help': '🌱', mystery: '🔍', other: '📕',
};

export default function UpdateProgress({ readings, onProgressUpdated }: UpdateProgressProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [selectedReadingId, setSelectedReadingId] = useState<string>('');
  const [newPagesRead, setNewPagesRead] = useState('');
  const [sliderValue, setSliderValue] = useState(0);

  const selectedReading = readings.find(r => r.id === selectedReadingId);
  const allReadings = [...readings].sort((a, b) =>
    new Date(b.started_date).getTime() - new Date(a.started_date).getTime()
  );

  const handleSelectBook = (bookId: string) => {
    const book = readings.find(r => r.id === bookId);
    // Allow selecting completed books just to view, but we can keep the logic focused on active updates
    if (book && book.status !== 'completed') {
      setSelectedReadingId(bookId);
      setNewPagesRead(book.pages_read.toString());
      setSliderValue(book.pages_read);
    }
  };

  const closeUpdateModal = () => setSelectedReadingId('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReading || !newPagesRead) return;
    setLoading(true);

    const pagesRead = parseInt(newPagesRead);
    const isNowCompleted = pagesRead >= selectedReading.total_pages;
    const newStatus = isNowCompleted ? 'completed' : 'reading';

    const { data, error } = await supabase
      .from('books')
      .update({
        pages_read: pagesRead,
        status: newStatus,
        is_completed: isNowCompleted,
        completed_date: isNowCompleted ? new Date().toISOString().split('T')[0] : selectedReading.completed_date,
      })
      .eq('id', selectedReadingId)
      .select().single();

    if (!error) {
      onProgressUpdated?.(data);
      closeUpdateModal();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-[32px] border border-dark-border shadow-sm overflow-hidden">
        <div className="p-8 border-b border-dark-border">
          <h2 className="text-2xl font-black text-foreground tracking-tight italic">YOUR LIBRARY</h2>
          <p className="text-muted text-[10px] font-bold uppercase tracking-[0.2em]">Tap an active book to sync progress</p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {allReadings.map(reading => {
              const isSelected = reading.id === selectedReadingId;
              const isCompleted = reading.status === 'completed';
              const progress = (reading.pages_read / reading.total_pages) * 100;

              return (
                <button
                  key={reading.id}
                  onClick={() => handleSelectBook(reading.id)}
                  className={`group relative flex flex-col text-left transition-all duration-300 ${isCompleted ? 'cursor-default' : 'hover:-translate-y-2'
                    }`}
                >
                  {/* Book Cover Container */}
                  <div className={`relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-lg border-4 transition-all ${isSelected ? 'border-accent-purple ring-8 ring-accent-purple/10' : 'border-transparent'
                    }`}>
                    {reading.cover_image_url ? (
                      <img src={reading.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-dark-border flex items-center justify-center">
                        <span className="text-4xl">{genreEmojis[reading.genre]}</span>
                      </div>
                    )}

                    {/* NEW: Completed Indicator Badge (No Opacity Change) */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2 flex items-center justify-center w-8 h-8 bg-accent-green text-white rounded-full shadow-lg border-2 border-surface animate-in zoom-in duration-300">
                        <span className="text-sm">✓</span>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="mt-4 px-1">
                    <h3 className="font-black text-foreground text-[13px] truncate leading-tight group-hover:text-accent-purple transition-colors uppercase tracking-tight">
                      {reading.title}
                    </h3>

                    {/* Progress UI */}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex-1 h-1.5 bg-dark-border rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${isCompleted ? 'bg-accent-green' : 'bg-accent-purple'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-black ${isCompleted ? 'text-accent-green' : 'text-muted'}`}>
                        {isCompleted ? 'DONE' : `${Math.round(progress)}%`}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modern Pop-up Modal (Matching your concept image) */}
      {selectedReading && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={closeUpdateModal}
        >
          <div
            className="bg-surface rounded-[40px] shadow-2xl w-full max-w-md overflow-hidden border border-dark-border animate-in zoom-in-95 duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* Concept Header */}
            <div className="relative p-8 bg-accent-purple flex items-center gap-4">
              <button
                onClick={closeUpdateModal}
                className="absolute top-6 right-6 w-10 h-10 bg-white/20 hover:bg-white/30 text-white rounded-full flex items-center justify-center transition-all"
              >
                <span className="text-xl">✕</span>
              </button>

              <div className="w-16 h-20 rounded-lg shadow-md border-2 border-white/20 overflow-hidden shrink-0">
                {selectedReading.cover_image_url && <img src={selectedReading.cover_image_url} className="w-full h-full object-cover" />}
              </div>
              <div className="text-white pr-8">
                <h4 className="text-xl font-black leading-tight uppercase tracking-tight">{selectedReading.title}</h4>
                <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{selectedReading.author}</p>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="flex justify-center">
                <CircularProgress
                  progress={(parseInt(newPagesRead || '0') / selectedReading.total_pages) * 100}
                  size="lg"
                  color="purple"
                />
              </div>

              <div className="space-y-6">
                <input
                  type="range"
                  min="0"
                  max={selectedReading.total_pages}
                  value={sliderValue}
                  onChange={(e) => {
                    setSliderValue(parseInt(e.target.value));
                    setNewPagesRead(e.target.value);
                  }}
                  className="w-full h-2 bg-dark-border rounded-full appearance-none cursor-pointer accent-accent-purple"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background p-4 rounded-3xl text-center border border-dark-border">
                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.15em] mb-1">Current Page</p>
                    <input
                      type="number"
                      value={newPagesRead}
                      onChange={(e) => {
                        const val = Math.min(parseInt(e.target.value || '0'), selectedReading.total_pages);
                        setNewPagesRead(val.toString());
                        setSliderValue(val);
                      }}
                      className="text-2xl font-black text-accent-purple bg-transparent w-full text-center outline-none"
                    />
                  </div>
                  <div className="bg-background p-4 rounded-3xl text-center border border-dark-border">
                    <p className="text-[9px] font-black text-muted uppercase tracking-[0.15em] mb-1">Total Pages</p>
                    <p className="text-2xl font-black text-foreground">{selectedReading.total_pages}</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-accent-purple text-white rounded-[24px] font-black text-lg hover:bg-accent-purple/80 transition-all shadow-xl shadow-accent-purple/10 disabled:bg-dark-border"
              >
                {loading ? 'SYNCING...' : 'UPDATE JOURNEY'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}