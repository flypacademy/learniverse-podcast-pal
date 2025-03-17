
import { AudioState } from './types';

// Event handler functions for audio elements
export const createAudioEventHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  const handleTimeUpdate = (audioElement: HTMLAudioElement) => {
    const newTime = audioElement.currentTime;
    if (isFinite(newTime)) {
      set({ currentTime: newTime });
    }
  };
  
  const handleEnded = (audioElement: HTMLAudioElement) => {
    set({ isPlaying: false, currentTime: 0 });
    audioElement.currentTime = 0;
  };
  
  const handleLoadedMetadata = (audioElement: HTMLAudioElement) => {
    const newDuration = audioElement.duration;
    if (isFinite(newDuration) && newDuration > 0) {
      set({ duration: newDuration });
    }
  };
  
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
    handleTimeUpdate,
    handleEnded,
    handleLoadedMetadata,
    handleVisibilityChange
  };
};
