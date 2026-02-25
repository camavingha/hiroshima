'use client';
import { useState } from 'react';
import { Workout } from '@/types/habits';

interface WorkoutFilterProps {
  onFilter: (filtered: Workout[]) => void;
  workouts: Workout[];
}

export default function WorkoutFilter({ workouts, onFilter }: WorkoutFilterProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const handleFilterChange = (type: string, start: string, end: string) => {
    let filtered = workouts;

    if (type !== 'all') {
      filtered = filtered.filter(w => w.activity_type === type);
    }

    if (start) {
      filtered = filtered.filter(w => new Date(w.logged_date) >= new Date(start));
    }

    if (end) {
      filtered = filtered.filter(w => new Date(w.logged_date) <= new Date(end));
    }

    onFilter(filtered);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setSelectedType(newType);
    handleFilterChange(newType, dateRange.start, dateRange.end);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setDateRange(prev => ({ ...prev, start: newStart }));
    handleFilterChange(selectedType, newStart, dateRange.end);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value;
    setDateRange(prev => ({ ...prev, end: newEnd }));
    handleFilterChange(selectedType, dateRange.start, newEnd);
  };

  const handleReset = () => {
    setSelectedType('all');
    setDateRange({ start: '', end: '' });
    onFilter(workouts);
  };

  return (
    <div className="bg-surface p-6 rounded-2xl border border-dark-border shadow-sm">
      <h3 className="text-lg font-bold text-foreground mb-4">Filter Workouts</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">Activity Type</label>
          <select
            value={selectedType}
            onChange={handleTypeChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
          >
            <option value="all">All Activities</option>
            <option value="running">Running</option>
            <option value="training">Training</option>
            <option value="walking">Walking</option>
            <option value="swimming">Swimming</option>
            <option value="cycling">Cycling</option>
            <option value="yoga">Yoga</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">From Date</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={handleStartDateChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-muted uppercase mb-2">To Date</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={handleEndDateChange}
            className="w-full p-2 bg-input-bg border border-dark-border-light rounded-lg focus:ring-2 focus:ring-accent-blue outline-none text-foreground"
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
