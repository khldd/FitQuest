/**
 * Utility functions for analytics features
 */

/**
 * Format duration in minutes to human-readable string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format points with thousands separator
 */
export function formatPoints(points: number): string {
  return points.toLocaleString();
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Get color for intensity level
 */
export function getIntensityColor(intensity: 'light' | 'moderate' | 'intense'): string {
  const colors = {
    light: '#10b981', // green-500
    moderate: '#f59e0b', // amber-500
    intense: '#ef4444', // red-500
  };
  return colors[intensity];
}

/**
 * Get color for goal type
 */
export function getGoalColor(goal: string): string {
  const colors: Record<string, string> = {
    strength: '#3b82f6', // blue-500
    hypertrophy: '#8b5cf6', // purple-500
    endurance: '#ec4899', // pink-500
    fat_loss: '#14b8a6', // teal-500
  };
  return colors[goal] || '#6b7280'; // gray-500 as default
}

/**
 * Get color for equipment type
 */
export function getEquipmentColor(equipment: string): string {
  const colors: Record<string, string> = {
    gym: '#6366f1', // indigo-500
    home: '#14b8a6', // teal-500
    bodyweight: '#84cc16', // lime-500
  };
  return colors[equipment] || '#6b7280'; // gray-500 as default
}

/**
 * Get color for muscle group
 */
export function getMuscleColor(muscle: string): string {
  // Generate consistent color based on muscle name
  const colors = [
    '#8b5cf6', // purple-500
    '#6366f1', // indigo-500
    '#3b82f6', // blue-500
    '#06b6d4', // cyan-500
    '#14b8a6', // teal-500
    '#10b981', // green-500
    '#84cc16', // lime-500
    '#f59e0b', // amber-500
    '#f97316', // orange-500
    '#ef4444', // red-500
    '#ec4899', // pink-500
  ];

  // Simple hash function to get consistent color for same muscle
  let hash = 0;
  for (let i = 0; i < muscle.length; i++) {
    hash = muscle.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * Chart color palette
 */
export const CHART_COLORS = {
  intensity: {
    light: '#10b981',
    moderate: '#f59e0b',
    intense: '#ef4444',
  },
  goal: {
    strength: '#3b82f6',
    hypertrophy: '#8b5cf6',
    endurance: '#ec4899',
    fat_loss: '#14b8a6',
  },
  equipment: {
    gym: '#6366f1',
    home: '#14b8a6',
    bodyweight: '#84cc16',
  },
  gradient: [
    '#8b5cf6', // purple-500
    '#6366f1', // indigo-500
    '#3b82f6', // blue-500
    '#06b6d4', // cyan-500
    '#14b8a6', // teal-500
  ],
};

/**
 * Get day of week abbreviation
 */
export function getDayAbbreviation(day: string): string {
  const abbreviations: Record<string, string> = {
    Monday: 'Mon',
    Tuesday: 'Tue',
    Wednesday: 'Wed',
    Thursday: 'Thu',
    Friday: 'Fri',
    Saturday: 'Sat',
    Sunday: 'Sun',
  };
  return abbreviations[day] || day;
}

/**
 * Get calendar heat intensity (0-4) based on workout count
 */
export function getHeatIntensity(workoutCount: number): number {
  if (workoutCount === 0) return 0;
  if (workoutCount === 1) return 1;
  if (workoutCount === 2) return 2;
  if (workoutCount === 3) return 3;
  return 4; // 4+ workouts
}

/**
 * Get heatmap color based on intensity
 */
export function getHeatmapColor(intensity: number): string {
  const colors = [
    '#f3f4f6', // gray-100 - 0 workouts
    '#bfdbfe', // blue-200 - 1 workout
    '#60a5fa', // blue-400 - 2 workouts
    '#3b82f6', // blue-500 - 3 workouts
    '#1d4ed8', // blue-700 - 4+ workouts
  ];
  return colors[Math.min(intensity, 4)];
}

/**
 * Calculate trend direction (up, down, neutral)
 */
export function getTrendDirection(current: number, previous: number): 'up' | 'down' | 'neutral' {
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(dateString);
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Get empty state message based on period
 */
export function getEmptyStateMessage(period: string): string {
  const messages: Record<string, string> = {
    '7d': 'No workouts in the last 7 days',
    '30d': 'No workouts in the last 30 days',
    '90d': 'No workouts in the last 90 days',
    all: 'No workouts yet',
  };
  return messages[period] || 'No data available';
}
