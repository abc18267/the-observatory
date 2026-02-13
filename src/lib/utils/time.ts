/**
 * Time-of-day detection.
 * Night mode activates between 8 PM and 6 AM local time.
 */

export function isNightTime(): boolean {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}

export function getCurrentHour(): number {
  return new Date().getHours();
}

export function getTimeOfDay(): 'dawn' | 'day' | 'dusk' | 'night' {
  const hour = getCurrentHour();
  if (hour >= 5 && hour < 8) return 'dawn';
  if (hour >= 8 && hour < 18) return 'day';
  if (hour >= 18 && hour < 20) return 'dusk';
  return 'night';
}
