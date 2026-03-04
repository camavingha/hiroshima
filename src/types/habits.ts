export type MoodLevel = 'bad' | 'weird' | 'so-so' | 'happy' | 'great';

export interface Mood {
  id: string;
  user_id?: string;
  mood: MoodLevel;
  notes?: string;
  entry_date: string;
}

export interface Workout {
  id: string;
  activity_type: 'running' | 'training' | 'walking' | 'swimming' | 'cycling' | 'yoga' | 'other';
  duration_minutes: number;
  distance_km?: number;
  logged_date: string;
}

export interface BodyStats {
  weight_kg: number;
  waist_cm: number;
  chest_cm: number;
  thigh_cm: number;
  logged_date: string;
}

export interface Reading {
  id: string;
  user_id?: string;
  title: string;
  author: string;
  pages_read: number;
  total_pages: number;
  genre: 'fiction' | 'non-fiction' | 'science' | 'biography' | 'history' | 'self-help' | 'mystery' | 'other';
  status: 'reading' | 'completed' | 'paused';
  is_completed?: boolean;
  rating?: number;
  notes?: string;
  started_date: string;
  completed_date?: string;
  cover_image_url?: string;
  created_at?: string;
}

// src/types/habits.ts

export interface BodyStats {
  id?: string;
  user_id?: string;
  weight_kg: number;
  body_water_kg: number;
  fat_mass_kg: number;
  bone_mineral_kg: number;
  protein_mass_kg: number;
  muscle_mass_kg: number;
  bmr_kcal: number;
  body_type: string;
  logged_date: string;
  created_at?: string;
}