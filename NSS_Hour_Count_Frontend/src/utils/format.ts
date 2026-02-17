
export const formatDuration = (decimalHours: number): string => {
  if (!decimalHours) return "0 mins";

  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hr${hours !== 1 ? 's' : ''}`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min${minutes !== 1 ? 's' : ''}`);
  }

  return parts.length > 0 ? parts.join(" ") : "0 mins";
};
