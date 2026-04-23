export const getGreeting = (date = new Date()): string => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Günaydın";
  if (hour >= 12 && hour < 18) return "İyi günler";
  if (hour >= 18 && hour < 23) return "İyi akşamlar";
  return "İyi geceler";
};

export const getFirstName = (fullName?: string | null): string => {
  if (!fullName) return "Barista";
  const trimmed = fullName.trim();
  if (!trimmed) return "Barista";
  return trimmed.split(/\s+/)[0];
};
