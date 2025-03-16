import { StateCreator } from 'zustand';
import { AudioState } from './types';

// Slice for audio playback controls
export interface AudioPlaybackSlice {
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
}

export const createAudioPlaybackSlice: StateCreator<
  AudioState,
  [],
  [],
  AudioPlaybackSlice
> = (set, get, api) => ({
  play: () => {
    const { audioElement, podcastMeta } = get();
    
    // If no audio element but we have metadata, try to recreate it
    if (!audioElement && podcastMeta?.audioUrl) {
      get().continuePlayback();
      // The play action will be handled by the oncanplay handler
      set({ isPlaying: true });
      return;
    }
    
    if (!audioElement) {
      console.warn("No audio element available in global store");
      return;
    }
    
    console.log("Playing audio from global store");
    
    // Check if the audio is actually loaded and ready before playing
    if (audioElement.readyState < 2) {
      console.log("Audio in global store not ready yet, waiting...");
      
      const canPlayHandler = () => {
        console.log("Audio in global store now ready to play");
        
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully from global store");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio from global store:", error);
              // Don't update state to playing if it failed
            });
        }
        
        // Remove event listener after attempting to play
        audioElement.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioElement.addEventListener('canplay', canPlayHandler);
      
      // Also set a timeout in case canplay never fires
      setTimeout(() => {
        if (!get().isPlaying) {
          console.log("Timeout: trying to play from global store anyway");
          
          const playPromise = audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully from global store after timeout");
                set({ isPlaying: true });
              })
              .catch(error => {
                console.error("Error playing audio from global store after timeout:", error);
                // Don't update state to playing if it failed
              });
          }
        }
      }, 2000);
      
      return;
    }
    
    // If audio is already loaded, try to play directly
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Audio playback started successfully from global store");
          set({ isPlaying: true });
        })
        .catch(error => {
          console.error("Error playing audio from global store:", error);
          // Don't update state to playing if it failed
        });
    }
  },
  
  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Pausing audio from global store");
      audioElement.pause();
      set({ isPlaying: false });
    }
  },
  
  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Setting current time in global store:", time);
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },
  
  setDuration: (duration) => {
    set({ duration });
  },
  
  setVolume: (volume) => {
    // Ensure volume is within valid range of 0-1
    const safeVolume = Math.max(0, Math.min(1, volume));
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = safeVolume;
    }
    set({ volume: safeVolume });
  },
});
