'use client';
import { useState } from 'react';
import { Reading } from '@/types/habits';

interface ReadingFilterProps {
  onFilter: (filtered: Reading[]) => void;
  readings: Reading[];
}

export default function ReadingFilter({ readings, onFilter }: ReadingFilterProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const handleFilterChange = (genre: string, status: string, start: string, end: string) => {
    let filtered = readings;

    if (genre !== 'all') {
      filtered = filtered.filter(r => r.genre === genre);
    }

    if (status !== 'all') {
      filtered = filtered.filter(r => r.status === status);
    }

    if (start) {
      filtered = filtered.filter(r => new Date(r.started_date) >= new Date(start));
    }

    if (end) {
      filtered = filtered.filter(r => new Date(r.started_date) <= new Date(end));
    }

    onFilter(filtered);
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGenre = e.target.value;
    setSelectedGenre(newGenre);
    handleFilterChange(newGenre, selectedStatus, dateRange.start, dateRange.end);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setSelectedStatus(newStatus);
    handleFilterChange(selectedGenre, newStatus, dateRange.start, dateRange.end);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setDateRange(prev => ({ ...prev, start: newStart }));
    handleFilterChange(selectedGenre, selectedStatus, newStart, dateRange.end);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setDateRange(prev => ({ ...prev, end: newEnd }));
    handleFilterChange(selectedGenre, selectedStatus, dateRange.start, newEnd);
  };

  const handleReset = () => {
    setSelectedGenre('all');
    setSelectedStatus('all');
    setDateRange({ start: '', end: '' });
    onFilter(readings);
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-dark-border shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Filter Books</h3>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">Genre</label>
          <select
            value={selectedGenre}
            onChange={handleGenreChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-purple outline-none text-foreground"
          >
            <option value="all">All Genres</option>
            <option value="fiction">Fiction</option>
            <option value="non-fiction">Non-Fiction</option>
            <option value="science">Science</option>
            <option value="biography">Biography</option>
            <option value="history">History</option>
            <option value="self-help">Self-Help</option>
            <option value="mystery">Mystery</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-purple outline-none text-foreground"
          >
            <option value="all">All Status</option>
            <option value="reading">Reading</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={handleStartDateChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-purple outline-none text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={handleEndDateChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-purple outline-none text-foreground"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={handleReset}
            className="w-full py-2 px-4 bg-dark-border text-foreground rounded-lg hover:bg-dark-border-light transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
