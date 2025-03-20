
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
      // Get current state for comparison
      const { currentPodcastId, audioElement: currentAudio, currentTime: storedTime, isPlaying: wasPlaying } = get();
      
      // If this is the same podcast that's already playing, preserve the state
      if (currentPodcastId === podcastId && currentAudio) {
        console.log("Audio setup: Same podcast detected, preserving state");
        
        // Only update metadata if provided
        if (meta) {
          set({ podcastMeta: meta });
        }
        
        // If it's a different audio element for the same podcast, sync the time
        if (currentAudio !== audioElement) {
          console.log("Audio setup: Different audio element for same podcast, syncing time:", storedTime);
          
          // Ensure stored time is applied to the new audio element
          if (isFinite(storedTime) && storedTime > 0) {
            audioElement.currentTime = storedTime;
          }
          
          // Clean up event listeners from the old audio element
          if ((currentAudio as any).__cleanupVisibilityListener) {
            (currentAudio as any).__cleanupVisibilityListener();
          }
          
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
            console.log("Audio setup: Scheduling playback continuation");
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
        }
        
        return;
      }
      
      // Clean up existing audio if there is one
      if (currentAudio) {
        try {
          // Store if it was playing before switching
          const wasPlaying = !currentAudio.paused;
          
          // Don't pause if it's already paused
          if (!currentAudio.paused) {
            // Pause directly without triggering state updates
            currentAudio.pause();
          }
          
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
      const storeVolume = get().volume;
      audioElement.volume = storeVolume / 100;
      console.log("Setting initial volume to:", storeVolume);
      
      // Ensure we have valid duration and currentTime before setting state
      const initialDuration = isFinite(audioElement.duration) && audioElement.duration > 0 
        ? audioElement.duration 
        : 0;
        
      const initialTime = isFinite(audioElement.currentTime) 
        ? audioElement.currentTime 
        : 0;
      
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
          console.log("Audio setup: Scheduling playback for new audio source");
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
  
  // Helper function to set up event listeners for an audio element
  function setupEventListeners(audioElement: HTMLAudioElement) {
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
  }
};
