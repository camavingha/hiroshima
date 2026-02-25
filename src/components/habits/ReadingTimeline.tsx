'use client';
import { Reading } from '@/types/habits';

interface ReadingTimelineProps {
  readings: Reading[];
}

export default function ReadingTimeline({ readings }: ReadingTimelineProps) {
  if (readings.length === 0) {
    return (
      <div className="bg-surface p-8 rounded-2xl border border-dark-border shadow-sm text-left">
        <p className="text-muted text-sm">No activity found.</p>
      </div>
    );
  }

  const sorted = [...readings].sort((a, b) =>
    new Date(b.started_date).getTime() - new Date(a.started_date).getTime()
  );

  const grouped = sorted.reduce((acc, reading) => {
    const date = new Date(reading.started_date);
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(reading);
    return acc;
  }, {} as Record<string, Reading[]>);

  return (
    <div className="w-full max-w-5xl py-4">
      {Object.entries(grouped).map(([monthYear, monthReadings]) => (
        <div key={monthYear} className="relative pl-8 mb-12 last:mb-0">
          {/* Vertical Timeline Line */}
          <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-dark-border" />

          <div className="flex items-center gap-3 mb-6">
            <h4 className="font-bold text-foreground text-sm tracking-tight">{monthYear}</h4>
            <div className="flex-1 h-[1px] bg-dark-border" />
          </div>

          <div className="space-y-8">
            <div className="flex items-center gap-3 text-foreground/70">
              <div className="w-6 h-6 rounded-md bg-surface border border-dark-border flex items-center justify-center text-xs shadow-sm">
                📖
              </div>
              <p className="text-sm font-medium">
                Updated <span className="font-bold text-foreground">{monthReadings.length} books</span> in current library
              </p>
            </div>

            <div className="ml-9 space-y-6">
              {monthReadings.map(reading => {
                const progress = (reading.pages_read / reading.total_pages) * 100;
                const formattedDate = new Date(reading.started_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={reading.id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                    <div className="flex items-center gap-4 flex-1">
                      {/* 1. Small Book Cover on the Left */}
                      <div className="w-10 h-14 rounded-md overflow-hidden shadow-sm border border-dark-border flex-shrink-0">
                        {reading.cover_image_url ? (
                          <img src={reading.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-dark-border flex items-center justify-center text-[10px] opacity-40 text-muted">
                            BK
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-accent-blue hover:underline text-sm font-bold cursor-pointer truncate">
                            {reading.title.toLowerCase().replace(/\s+/g, '-')}
                          </span>
                          <span className="text-[11px] text-muted font-medium flex-shrink-0">
                            {reading.pages_read} pages
                          </span>
                        </div>
                        <span className="text-[10px] text-muted uppercase tracking-tighter">
                          Logged on {formattedDate}
                        </span>
                      </div>
                    </div>

                    {/* 2. Progress Bar (Pill Shape) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-32 h-2 bg-dark-border rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-accent-green' : 'bg-green-500'}`}
                          style={{
                            width: `${progress}%`,
                            opacity: progress === 100 ? '1' : '0.6'
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted w-8 text-right">
                        {Math.round(progress)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}