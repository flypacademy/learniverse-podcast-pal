
// Helper to generate ISO format dates for the last 7 days
const getLastWeekDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
};

// Get the last week's dates
const weekDates = getLastWeekDates();

export const activityDays = [
  { date: weekDates[0], completed: true },
  { date: weekDates[1], completed: true },
  { date: weekDates[2], completed: true },
  { date: weekDates[3], completed: true },
  { date: weekDates[4], completed: false, partial: true },
  { date: weekDates[5], completed: false },
  { date: weekDates[6], completed: false }
];
