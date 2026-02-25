import { Reading } from '@/types/habits';
import CircularProgress from './CircularProgress';

interface ReadingListProps {
  readings: Reading[];
}

const genreColors: Record<Reading['genre'], string> = {
  fiction: 'bg-pink-900/30 text-pink-400',
  'non-fiction': 'bg-blue-900/30 text-blue-400',
  science: 'bg-cyan-900/30 text-cyan-400',
  biography: 'bg-amber-900/30 text-amber-400',
  history: 'bg-orange-900/30 text-orange-400',
  'self-help': 'bg-green-900/30 text-green-400',
  mystery: 'bg-purple-900/30 text-purple-400',
  other: 'bg-gray-700/30 text-gray-400',
};

export default function ReadingList({ readings }: ReadingListProps) {
  if (readings.length === 0) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-dark-border shadow-sm text-center">
        <p className="text-muted text-lg">No books found.</p>
      </div>
    );
  }

  const sorted = [...readings].sort((a, b) => new Date(b.started_date).getTime() - new Date(a.started_date).getTime());

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sorted.map(reading => {
        const progress = (reading.pages_read / reading.total_pages) * 100;
        const isCompleted = reading.status === 'completed';

        return (
          <div key={reading.id} className="bg-surface p-5 rounded-2xl border border-dark-border shadow-sm flex items-center gap-6">
            {/* Left: Book Cover (Compact) */}
            <div className="w-20 aspect-[2/3] rounded-lg overflow-hidden shadow-sm flex-shrink-0">
              {reading.cover_image_url ? (
                <img src={reading.cover_image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-dark-border flex items-center justify-center text-2xl opacity-30">📖</div>
              )}
            </div>

            {/* Middle: Progress Circle (Referencing your side-by-side image) */}
            <div className="flex-shrink-0 scale-90">
              <CircularProgress
                progress={progress}
                size="md"
                color={isCompleted ? 'green' : 'purple'}
              />
            </div>

            {/* Right: Detailed Text */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground text-base truncate leading-tight">
                {reading.title}
              </h3>
              <p className="text-xs text-muted font-medium truncate mb-2">
                {reading.author}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-foreground">
                  {reading.pages_read}
                </span>
                <span className="text-sm text-muted font-normal">/ {reading.total_pages}</span>
              </div>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${genreColors[reading.genre]}`}>
                {reading.genre}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}