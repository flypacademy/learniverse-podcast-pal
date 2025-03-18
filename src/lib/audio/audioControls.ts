
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
        console.log("Audio controls: play called");
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              // Don't set isPlaying: false here since that could create flicker
              // The audio element's 'pause' event will trigger if play fails
            });
        } else {
          set({ isPlaying: true });
        }
      }
    },
    
    pause: () => {
      const { audioElement } = get();
      if (audioElement) {
        console.log("Audio controls: pause called");
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
