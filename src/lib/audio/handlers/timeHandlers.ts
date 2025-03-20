
import { AudioState } from '../types';

/**
 * Handlers for time-related audio events
 */
export const createTimeHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  /**
   * Handle audio timeupdate event
   */
  const handleTimeUpdate = (audioElement: HTMLAudioElement) => {
    const newTime = audioElement.currentTime;
    if (isFinite(newTime)) {
      set({ currentTime: newTime });
    }
  };
  
  /**
   * Handle audio ended event
   */
  const handleEnded = (audioElement: HTMLAudioElement) => {
    set({ isPlaying: false, currentTime: 0 });
    audioElement.currentTime = 0;
  };
  
  return {
    handleTimeUpdate,
    handleEnded
  };
};
