export const toISODate = (date: Date) => date.toISOString().slice(0, 10);

export function getLastNDays(n: number) {
  const lastNDays = Array.from({ length: n }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);
    return day;
  });
  return lastNDays;
}

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const toWeekDay = (date: Date) => {
  return days[date.getDay()];
};

export const navTo = (path: string) => {
  location.hash = path;
};
