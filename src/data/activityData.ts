
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

// Configure activity days with a 4-day streak pattern
// M, T, W are completed (blue)
// T is partial (light blue)
// F is not completed (gray)
// S (today) is in progress (blue border)
// S is not completed
export const activityDays = [
  { date: weekDates[0], completed: true },       // Monday - completed
  { date: weekDates[1], completed: true },       // Tuesday - completed
  { date: weekDates[2], completed: true },       // Wednesday - completed
  { date: weekDates[3], completed: false, partial: true }, // Thursday - partial
  { date: weekDates[4], completed: false },      // Friday - not completed
  { date: weekDates[5], completed: false },      // Saturday (today) - in progress
  { date: weekDates[6], completed: false }       // Sunday - not completed yet
];

// Calculate the streak count dynamically based on the activity days
// Count fully completed days (not partial days) in our streak
export const streakCount = activityDays.filter(day => day.completed).length;
