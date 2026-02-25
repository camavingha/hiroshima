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
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
        <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Books Completed</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-amber-900">{completed}</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
        <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Pages Read</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-blue-900">{totalPagesRead}</span>
          <span className="ml-1 text-sm text-blue-700">pages</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
        <p className="text-xs font-semibold text-yellow-600 uppercase mb-2">Avg Rating</p>
        <div className="flex items-baseline">
          <span className="text-3xl font-bold text-yellow-900">{avgRating}</span>
          <span className="ml-1 text-sm text-yellow-700">⭐</span>
        </div>
      </div>

      <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
        <p className="text-xs font-semibold text-pink-600 uppercase mb-2">Fav Genre</p>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-pink-900">{favoriteGenreName}</span>
        </div>
      </div>
    </div>
  );
}
