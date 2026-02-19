export type MoodLevel = 'bad' | 'weird' | 'so-so' | 'happy' | 'great';

export interface Workout {
  id: string;
  activity_type: 'running' | 'training' | 'walking' | 'swimming' | 'cycling' | 'yoga' | 'other';
  duration_minutes: number;
  distance_km?: number;
  logged_date: string;
}