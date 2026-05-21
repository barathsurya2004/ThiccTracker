export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage write failed:', e);
  }
}

export function remove(key: string): void {
  localStorage.removeItem(key);
}

export const KEYS = {
  user: 'tn_user',
  session: 'tn_session',
  plans: 'tn_plans',
  dayIndex: 'tn_day_index',
  history: 'tn_history',
  settings: 'tn_settings',
  credentials: 'tn_creds',
} as const;
