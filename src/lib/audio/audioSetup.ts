
import { AudioState, PodcastMeta } from './types';
import { createAudioEventHandlers } from './audioEventHandlers';

// Setup and cleanup functions for audio elements
export const createAudioSetup = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  const eventHandlers = createAudioEventHandlers(set, get);
  
  return {
    setAudio: (audioElement: HTMLAudioElement, podcastId: string, meta?: PodcastMeta) => {
      // If this is the same podcast that's already playing, don't reset
      if (get().currentPodcastId === podcastId && get().audioElement) {
        if (meta) {
          set({ podcastMeta: meta });
        }
        return;
      }
      
      // Clean up existing audio if there is one
      const currentAudio = get().audioElement;
      if (currentAudio) {
        try {
          currentAudio.pause();
          // Don't clear the source - we want to keep playing the same audio
        } catch (e) {
          console.error("Error cleaning up previous audio:", e);
        }
      }
      
      // Set the volume based on store state
      audioElement.volume = get().volume / 100;
      
      // Ensure we have valid duration and currentTime before setting state
      const initialDuration = isFinite(audioElement.duration) && audioElement.duration > 0 
        ? audioElement.duration 
        : 0;
        
      const initialTime = isFinite(audioElement.currentTime) 
        ? audioElement.currentTime 
        : 0;
      
      // Update state with new audio
      set({ 
        audioElement, 
        currentPodcastId: podcastId,
        isPlaying: false,
        currentTime: initialTime,
        duration: initialDuration,
        podcastMeta: meta || get().podcastMeta
      });
      
      // Add event listeners
      audioElement.addEventListener('timeupdate', () => eventHandlers.handleTimeUpdate(audioElement));
      audioElement.addEventListener('ended', () => eventHandlers.handleEnded(audioElement));
      audioElement.addEventListener('loadedmetadata', () => eventHandlers.handleLoadedMetadata(audioElement));
      
      // Preserve playback state across navigation
      const visibilityChangeHandler = () => eventHandlers.handleVisibilityChange(audioElement);
      document.addEventListener('visibilitychange', visibilityChangeHandler);
      
      // Store cleanup function on the element for later use
      (audioElement as any).__cleanupVisibilityListener = () => {
        document.removeEventListener('visibilitychange', visibilityChangeHandler);
      };
    },
    
    setPodcastMeta: (meta: PodcastMeta) => {
      set({ podcastMeta: meta });
    },
    
    cleanup: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        
        // Clean up visibility change listener if it exists
        if ((audioElement as any).__cleanupVisibilityListener) {
          (audioElement as any).__cleanupVisibilityListener();
        }
        
        // Event listeners will be garbage collected with the audio element
      }
      set({ 
        audioElement: null, 
        isPlaying: false, 
        currentPodcastId: null,
        currentTime: 0,
        podcastMeta: null
      });
    }
  };
};
