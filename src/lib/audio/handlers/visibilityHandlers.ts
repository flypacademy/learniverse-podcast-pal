
import { AudioState } from '../types';

/**
 * Handlers for document visibility events
 */
export const createVisibilityHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  /**
   * Handle document visibility change
   */
  const handleVisibilityChange = (audioElement: HTMLAudioElement) => {
    if (document.visibilityState === 'visible') {
      // Check if it was playing before and try to resume
      const isCurrentlyPlaying = get().isPlaying;
      if (isCurrentlyPlaying && audioElement.paused) {
        audioElement.play().catch(err => {
          console.warn("Could not auto-resume audio after visibility change:", err);
        });
      }
    }
  };
  
  return {
    handleVisibilityChange
  };
};
