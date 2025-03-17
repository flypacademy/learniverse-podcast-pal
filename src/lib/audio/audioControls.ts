
import { AudioState } from './types';

// Control functions for audio playback
export const createAudioControls = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  return {
    play: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.play().catch(error => {
          console.error("Error playing audio:", error);
        });
        set({ isPlaying: true });
      }
    },
    
    pause: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
        set({ isPlaying: false });
      }
    },
    
    setCurrentTime: (time: number) => {
      const { audioElement } = get();
      if (audioElement && isFinite(time)) {
        audioElement.currentTime = time;
        set({ currentTime: time });
      }
    },
    
    setDuration: (duration: number) => {
      if (isFinite(duration) && duration > 0) {
        set({ duration });
      }
    },
    
    setVolume: (volume: number) => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.volume = volume / 100;
      }
      set({ volume });
    }
  };
};
