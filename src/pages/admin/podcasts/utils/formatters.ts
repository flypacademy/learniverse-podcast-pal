
/**
 * Formats seconds into minutes:seconds
 */
export const formatDuration = (seconds: number): string => {
  // Make sure seconds is a valid number
  if (isNaN(seconds) || !isFinite(seconds)) {
    seconds = 0;
  }
  
  // Round to the nearest second to avoid decimal display
  seconds = Math.round(seconds);
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};
