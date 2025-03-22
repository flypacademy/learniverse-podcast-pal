
// Get the current date information
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();
const currentDay = currentDate.getDate();

// Generate dates for the past week
const generatePastWeekDates = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth, currentDay - i);
    // Format as YYYY-MM-DD
    const dateString = date.toISOString().split('T')[0];
    
    // Randomly assign completion status
    // Higher chance of completion for past dates (5-6 days ago)
    // Less chance for recent dates (last 2-3 days)
    let completed = false;
    let partial = false;
    
    if (i >= 4) {
      // Older dates - higher chance of being completed
      completed = Math.random() > 0.2;
    } else if (i >= 2) {
      // Middle dates - mixed completion with some partial
      completed = Math.random() > 0.5;
      if (!completed) {
        partial = Math.random() > 0.5;
      }
    } else {
      // Recent dates - less likely to be completed
      completed = Math.random() > 0.7;
      if (!completed) {
        partial = Math.random() > 0.6;
      }
    }
    
    dates.push({
      date: dateString,
      completed,
      partial: !completed && partial
    });
  }
  return dates;
};

export const activityDays = generatePastWeekDates();
