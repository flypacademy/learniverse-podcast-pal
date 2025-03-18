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
        
        // Keep the current time if we have one
        if (get().currentTime > 0 && audioElement) {
          audioElement.currentTime = get().currentTime;
        }
        
        return;
      }
      
      // Clean up existing audio if there is one
      const currentAudio = get().audioElement;
      const currentPodcastId = get().currentPodcastId;
      const isCurrentlyPlaying = get().isPlaying;
      const currentAudioTime = get().currentTime;
      
      if (currentAudio) {
        try {
          // Store if it was playing before switching
          const wasPlaying = !currentAudio.paused;
          
          // Always pause the current audio before switching to prevent multiple simultaneous playback
          currentAudio.pause();
          
          // Only if it's a different audio element, we need to clean up the old one
          if (currentAudio !== audioElement) {
            console.log("Cleaning up previous audio before setting new one");
            // Remove event listeners from the old audio element
            if ((currentAudio as any).__cleanupVisibilityListener) {
              (currentAudio as any).__cleanupVisibilityListener();
            }
          }
        } catch (e) {
          console.error("Error cleaning up previous audio:", e);
        }
      }
      
      // Set the volume based on store state
      audioElement.volume = get().volume / 100;
      
      // For the same podcast, preserve the current time
      if (currentPodcastId === podcastId && currentAudioTime > 0) {
        console.log("Same podcast detected, preserving time:", currentAudioTime);
        audioElement.currentTime = currentAudioTime;
        
        // Update state with new audio but keep the time
        set({ 
          audioElement, 
          currentPodcastId: podcastId,
          isPlaying: isCurrentlyPlaying,  // Preserve playing state
          currentTime: currentAudioTime,  // Preserve time
          podcastMeta: meta || get().podcastMeta
        });
      } else {
        // Ensure we have valid duration and currentTime before setting state for new podcast
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
          isPlaying: isCurrentlyPlaying,  // Preserve playing state
          currentTime: initialTime,
          duration: initialDuration,
          podcastMeta: meta || get().podcastMeta
        });
      }
      
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
      
      // Resume playback if it was playing before
      if (isCurrentlyPlaying) {
        try {
          const playPromise = audioElement.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.warn("Could not auto-resume audio after setting new source:", error);
              set({ isPlaying: false });
            });
          }
        } catch (error) {
          console.warn("Error auto-resuming audio:", error);
          set({ isPlaying: false });
        }
      }
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
