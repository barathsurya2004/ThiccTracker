export const saveData = <T>(key: string, value: T) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const loadData = <T>(key: string): T | null => {
  const data = localStorage.getItem(key);
  return data ? (JSON.parse(data) as T) : null;
};
