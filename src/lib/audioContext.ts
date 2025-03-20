
import { create } from 'zustand';
import { AudioState, PodcastMeta } from './audio/types';

// Re-export the PodcastMeta type
export { type PodcastMeta } from './audio/types';

// Global audio element that persists across the entire app
let globalAudio: HTMLAudioElement | null = null;

// Create the audio store
export const useAudioStore = create<AudioState>((set, get) => {
  return {
    // Initial state
    audioElement: null,
    isPlaying: false,
    currentPodcastId: null,
    currentTime: 0,
    duration: 0,
    volume: 80,
    podcastMeta: null,
    
    // Setup method - this is critical for connecting the audio element
    setAudio: (audioElement, podcastId, meta) => {
      console.log("audioContext: setAudio called", { podcastId, meta });
      
      // Ensure we're using the same audio element globally
      if (!globalAudio) {
        globalAudio = audioElement;
        
        // Set up event listeners on the global audio element
        globalAudio.addEventListener('timeupdate', () => {
          if (globalAudio) {
            set({ currentTime: globalAudio.currentTime });
          }
        });
        
        globalAudio.addEventListener('loadedmetadata', () => {
          if (globalAudio) {
            set({ duration: globalAudio.duration });
          }
        });
        
        globalAudio.addEventListener('ended', () => {
          set({ isPlaying: false });
        });
        
        globalAudio.addEventListener('play', () => {
          set({ isPlaying: true });
        });
        
        globalAudio.addEventListener('pause', () => {
          set({ isPlaying: false });
        });
        
        // Set volume from stored state
        globalAudio.volume = get().volume / 100;
      }
      
      // Update state with new podcast info
      set({ 
        audioElement: globalAudio, 
        currentPodcastId: podcastId,
        podcastMeta: meta || null
      });
    },
    
    setPodcastMeta: (meta) => {
      console.log("audioContext: setPodcastMeta called", meta);
      set({ podcastMeta: meta });
    },
    
    cleanup: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      
      set({ 
        audioElement: null, 
        isPlaying: false, 
        currentPodcastId: null,
        currentTime: 0,
        podcastMeta: null
      });
      
      // Reset global audio
      globalAudio = null;
    },
    
    play: () => {
      console.log("audioContext: play called");
      const { audioElement } = get();
      if (audioElement) {
        const playPromise = audioElement.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Playback started successfully");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio:", error);
            });
        }
      }
    },
    
    pause: () => {
      console.log("audioContext: pause called");
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
        set({ isPlaying: false });
      }
    },
    
    setCurrentTime: (time) => {
      const { audioElement } = get();
      if (audioElement && isFinite(time)) {
        audioElement.currentTime = time;
        set({ currentTime: time });
      }
    },
    
    setDuration: (duration) => {
      if (isFinite(duration) && duration > 0) {
        set({ duration });
      }
    },
    
    setVolume: (volume) => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.volume = volume / 100;
      }
      set({ volume });
    },
    
    // Method to check if audio is ready
    isAudioReady: () => {
      const state = get();
      return state.audioElement !== null && state.currentPodcastId !== null;
    }
  };
});
