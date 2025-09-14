export interface Mood {
  emoji: string;
  label: string;
  value: string;
}

export interface WeeklyMoodData {
  day: string;
  value: number;
  mood: string;
}

export interface MoodDistribution {
  mood: string;
  percentage: number;
  color: string;
  count: number;
}

export const defaultMoods: Mood[] = [
  { emoji: '😊', label: 'Amazing', value: 'amazing' },
  { emoji: '🙂', label: 'Good', value: 'good' },
  { emoji: '😐', label: 'Okay', value: 'okay' },
  { emoji: '😞', label: 'Not Great', value: 'not-great' },
  { emoji: '😠', label: 'Awful', value: 'awful' },
];

export const defaultWeeklyMoodData: WeeklyMoodData[] = [
  { day: 'Mon', value: 4.2, mood: 'good' },
  { day: 'Tue', value: 4.8, mood: 'amazing' },
  { day: 'Wed', value: 4.1, mood: 'good' },
  { day: 'Thu', value: 3.5, mood: 'okay' },
  { day: 'Fri', value: 2.8, mood: 'not-great' },
  { day: 'Sat', value: 4.9, mood: 'amazing' },
  { day: 'Sun', value: 4.3, mood: 'good' },
];

export const defaultMoodDistribution: MoodDistribution[] = [
  { mood: 'Amazing', percentage: 45, color: '#10B981', count: 18 },
  { mood: 'Good', percentage: 30, color: '#3B82F6', count: 12 },
  { mood: 'Okay', percentage: 15, color: '#F59E0B', count: 6 },
  { mood: 'Not Great', percentage: 8, color: '#EF4444', count: 3 },
  { mood: 'Awful', percentage: 2, color: '#7C2D12', count: 1 },
];