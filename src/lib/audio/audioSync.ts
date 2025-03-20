import { AudioState, PodcastMeta } from './types';
import { createAudioEventHandlers } from './audioEventHandlers';
import { createAudioCore } from './audioCore';

/**
 * Functions for syncing audio state between components
 */
export const createAudioSync = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  const eventHandlers = createAudioEventHandlers(set, get);
  const audioCore = createAudioCore(set, get);
  
  /**
   * Set up event listeners for an audio element
   */
  const setupEventListeners = (audioElement: HTMLAudioElement) => {
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
  };
  
  return {
    /**
     * Handle the case when syncing the same podcast but with a different audio element
     */
    handleSamePodcastDifferentElement: (
      audioElement: HTMLAudioElement, 
      currentAudio: HTMLAudioElement, 
      storedTime: number, 
      wasPlaying: boolean,
      meta?: PodcastMeta
    ) => {
      console.log("Audio sync: Different audio element for same podcast, syncing time:", storedTime);
      
      // Ensure stored time is applied to the new audio element
      if (isFinite(storedTime) && storedTime > 0) {
        audioElement.currentTime = storedTime;
      }
      
      // Clean up event listeners from the old audio element
      audioCore.cleanupAudioElement(currentAudio);
      
      // Check if it was playing before (either from state or actual element state)
      const shouldKeepPlaying = wasPlaying || (currentAudio && !currentAudio.paused);
      
      // Update the audio element in the state but preserve everything else
      set({ 
        audioElement,
        isPlaying: shouldKeepPlaying  // Preserve playing state 
      });
      
      // Add event listeners to the new audio element
      setupEventListeners(audioElement);
      
      // If it was playing, resume playback on the new element after ensuring DOM is ready
      if (shouldKeepPlaying) {
        console.log("Audio sync: Scheduling playback continuation");
        setTimeout(() => {
          try {
            console.log("Attempting to resume playback");
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.warn("Could not resume after audio element change:", error);
                set({ isPlaying: false });
              });
            }
          } catch (error) {
            console.warn("Error during delayed playback continuation:", error);
            set({ isPlaying: false });
          }
        }, 300); // Increased delay to ensure DOM is ready
      }
    },
    
    /**
     * Handle setting up a new audio element for a different podcast
     */
    handleNewPodcast: (
      audioElement: HTMLAudioElement, 
      podcastId: string, 
      wasPlaying: boolean,
      meta?: PodcastMeta
    ) => {
      // Initialize the audio element
      const { initialDuration, initialTime } = audioCore.initializeAudioElement(audioElement);
      
      // Check if it was playing previously or marked for auto-play
      const shouldPlay = wasPlaying || audioElement.dataset.shouldAutoPlay === "true";
      
      // Remove the auto-play marker if it exists
      if (audioElement.dataset.shouldAutoPlay) {
        delete audioElement.dataset.shouldAutoPlay;
      }
      
      // Update state with new audio - critical for seamless transition
      set({ 
        audioElement, 
        currentPodcastId: podcastId,
        isPlaying: shouldPlay,  // Preserve playing state when switching podcasts
        currentTime: initialTime,
        duration: initialDuration,
        podcastMeta: meta || get().podcastMeta
      });
      
      // Add event listeners
      setupEventListeners(audioElement);
      
      // Resume playback if needed - with an increased delay
      if (shouldPlay) {
        try {
          console.log("Audio sync: Scheduling playback for new audio source");
          setTimeout(() => {
            if (!audioElement) return;
            console.log("Attempting playback of new audio");
            try {
              const playPromise = audioElement.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  console.warn("Could not auto-play audio after setting new source:", error);
                  // Try one more time after a short delay as a fallback
                  setTimeout(() => {
                    try {
                      audioElement.play().catch(e => {
                        console.warn("Second attempt to auto-play failed:", e);
                        set({ isPlaying: false });
                      });
                    } catch (retryError) {
                      console.warn("Error during retry playback:", retryError);
                      set({ isPlaying: false });
                    }
                  }, 300);
                });
              }
            } catch (error) {
              console.warn("Error auto-playing audio:", error);
              set({ isPlaying: false });
            }
          }, 500); // Increased delay to ensure DOM is fully ready
        } catch (error) {
          console.warn("Error scheduling audio playback:", error);
          set({ isPlaying: false });
        }
      }
    }
  };
};
