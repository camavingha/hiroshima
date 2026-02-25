import { Reading } from '@/types/habits';

interface ReadingStatsProps {
  readings: Reading[];
}

export default function ReadingStats({ readings }: ReadingStatsProps) {
  const completed = readings.filter(r => r.status === 'completed').length;
  const totalPagesRead = readings.reduce((acc, r) => acc + r.pages_read, 0);
  const avgRating = readings.filter(r => r.rating).length > 0
    ? (readings.filter(r => r.rating).reduce((acc, r) => acc + (r.rating || 0), 0) / readings.filter(r => r.rating).length).toFixed(1)
    : 'N/A';

  const genreCount = readings.reduce((acc, r) => ({
    ...acc,
    [r.genre]: (acc[r.genre] || 0) + 1,
  }), {} as Record<string, number>);

  const favoriteGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];
  const favoriteGenreName = favoriteGenre ? favoriteGenre[0].charAt(0).toUpperCase() + favoriteGenre[0].slice(1) : 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-[#3d2a1a] to-[#352315] p-6 rounded-xl border border-[#5a3d20]">
        <p className="text-xs font-semibold text-amber-400 uppercase mb-2">Books Completed</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-amber-300">{completed}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#1a2d47] p-6 rounded-xl border border-[#264f78]">
        <p className="text-xs font-semibold text-blue-400 uppercase mb-2">Pages Read</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-300">{totalPagesRead}</span>
          <span className="ml-1 text-sm text-blue-500">pages</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#3d3a1a] to-[#352f15] p-6 rounded-xl border border-[#5a5320]">
        <p className="text-xs font-semibold text-yellow-400 uppercase mb-2">Avg Rating</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-yellow-300">{avgRating}</span>
          <span className="ml-1 text-sm text-yellow-500">⭐</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-[#3d1a2a] to-[#351520] p-6 rounded-xl border border-[#5a2040]">
        <p className="text-xs font-semibold text-pink-400 uppercase mb-2">Fav Genre</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-pink-300">{favoriteGenreName}</span>
        </div>
      </div>
    </div>
  );
}
