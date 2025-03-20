
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
      
      if (document.visibilityState === 'visible') {
        console.log("Visibility handler: Document became visible");
        
        if (isPlaying && audioElement.paused) {
          console.log("Visibility handler: Resuming playback");
          try {
            const playPromise = audioElement.play();
            if (playPromise) {
              playPromise.catch(error => {
                console.log("Visibility handler: Could not resume playback:", error);
              });
            }
          } catch (error) {
            console.log("Visibility handler: Error playing audio:", error);
          }
        }
      }
    }
  };
};
