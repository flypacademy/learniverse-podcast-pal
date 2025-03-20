
import { AudioState } from '../types';

export const createVisibilityHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  return {
    /**
     * Handle document visibility change events to preserve audio playback across tabs/navigation
     */
    handleVisibilityChange: (audioElement: HTMLAudioElement) => {
      const { isPlaying } = get();
      
      // When document becomes visible
      if (document.visibilityState === 'visible') {
        console.log("Visibility handler: Document became visible");
        
        // If audio should be playing but isn't, try to resume it
        if (isPlaying && audioElement.paused) {
          console.log("Visibility handler: Resuming playback");
          try {
            const playPromise = audioElement.play();
            if (playPromise) {
              playPromise.catch(error => {
                console.log("Visibility handler: Could not resume playback:", error);
                // Don't update isPlaying state here - we want to try again later
              });
            }
          } catch (error) {
            console.log("Visibility handler: Error playing audio:", error);
          }
        }
      } else if (document.visibilityState === 'hidden') {
        // When document becomes hidden, just log but don't pause
        // This is crucial for background playback
        console.log("Visibility handler: Document hidden, continuing playback");
      }
    }
  };
};
