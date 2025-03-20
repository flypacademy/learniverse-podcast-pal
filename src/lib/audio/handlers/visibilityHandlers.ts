
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
            // Set a small timeout to ensure DOM is ready before playing
            setTimeout(() => {
              if (audioElement && isPlaying && audioElement.paused) {
                const playPromise = audioElement.play();
                if (playPromise) {
                  playPromise.catch(error => {
                    console.log("Visibility handler: Could not resume playback:", error);
                    // Try again after a short delay as a fallback
                    setTimeout(() => {
                      if (audioElement && isPlaying && audioElement.paused) {
                        audioElement.play().catch(e => console.log("Retry failed:", e));
                      }
                    }, 300);
                  });
                }
              }
            }, 100);
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
