import { Workout, MoodLevel } from '@/types/habits';

export const MOCK_WORKOUTS: Workout[] = [
  { id: '1', activity_type: 'running', duration_minutes: 30, distance_km: 5, logged_date: '2026-02-18' },
  { id: '2', activity_type: 'swimming', duration_minutes: 45, logged_date: '2026-02-19' }
];

export const MOCK_MOODS = [
  { mood: 'happy' as MoodLevel, entry_date: '2026-02-18' },
  { mood: 'great' as MoodLevel, entry_date: '2026-02-19' }
];