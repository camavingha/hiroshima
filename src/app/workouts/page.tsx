'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Workout } from '@/types/habits';
import WorkoutForm from '@/components/habits/WorkoutForm';
import WorkoutStats from '@/components/habits/WorkoutStats';
import WorkoutFilter from '@/components/habits/WorkoutFilter';
import WorkoutList from '@/components/habits/WorkoutList';
import WorkoutTimeline from '@/components/habits/WorkoutTimeline';
import { MOCK_WORKOUTS } from '@/utils/mockData';

export default function Page() {
  const supabase = createClient();
  const [workouts, setWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(MOCK_WORKOUTS);
  const [view, setView] = useState<'list' | 'timeline'>('list');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .order('logged_date', { ascending: false });

      if (error) {
        console.log('Using mock data - Supabase not configured');
        setWorkouts(MOCK_WORKOUTS);
        setFilteredWorkouts(MOCK_WORKOUTS);
      } else if (data) {
        setWorkouts(data);
        setFilteredWorkouts(data);
      }
    } catch (err) {
      console.log('Using mock data - connection error');
      setWorkouts(MOCK_WORKOUTS);
      setFilteredWorkouts(MOCK_WORKOUTS);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutAdded = (newWorkout: Workout) => {
    setWorkouts(prev => [newWorkout, ...prev]);
    setFilteredWorkouts(prev => [newWorkout, ...prev]);
  };

  const handleFilter = (filtered: Workout[]) => {
    setFilteredWorkouts(filtered);
  };

  return (
    <main className="max-w-7xl mx-auto p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Workouts</h1>
        <p className="text-gray-500">Track your fitness journey, every step of the way.</p>
      </header>

      {/* Stats Section */}
      <section className="mb-8">
        <WorkoutStats workouts={workouts} />
      </section>

      {/* Add Workout Form */}
      <section className="mb-8">
        <WorkoutForm onWorkoutAdded={handleWorkoutAdded} />
      </section>

      {/* Filter Section */}
      <section className="mb-8">
        <WorkoutFilter workouts={workouts} onFilter={handleFilter} />
      </section>

      {/* View Toggle */}
      <section className="mb-6 flex gap-3">
        <button
          onClick={() => setView('list')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            view === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          List View
        </button>
        <button
          onClick={() => setView('timeline')}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
            view === 'timeline'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Timeline View
        </button>
      </section>

      {/* Content Section */}
      <section>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading workouts...</p>
          </div>
        ) : view === 'list' ? (
          <WorkoutList workouts={filteredWorkouts} />
        ) : (
          <WorkoutTimeline workouts={filteredWorkouts} />
        )}
      </section>
    </main>
  );
}