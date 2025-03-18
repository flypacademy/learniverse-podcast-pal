
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
      
      // If this is the same podcast that's already playing, preserve the time
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
          
          // Update the audio element in the state but preserve everything else
          set({ 
            audioElement,
            isPlaying: wasPlaying  // Explicitly preserve playing state 
          });
          
          // Add event listeners to the new audio element
          setupEventListeners(audioElement);
          
          // If it was playing, resume playback on the new element
          if (wasPlaying) {
            setTimeout(() => {
              if (audioElement) {
                console.log("Audio setup: Auto-resuming after audio element change");
                const playPromise = audioElement.play();
                if (playPromise !== undefined) {
                  playPromise.catch(error => {
                    console.warn("Could not auto-resume after audio element change:", error);
                  });
                }
              }
            }, 50);
          }
        }
        
        return;
      }
      
      // Clean up existing audio if there is one
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
      
      // Ensure we have valid duration and currentTime before setting state
      const initialDuration = isFinite(audioElement.duration) && audioElement.duration > 0 
        ? audioElement.duration 
        : 0;
        
      const initialTime = isFinite(audioElement.currentTime) 
        ? audioElement.currentTime 
        : 0;
      
      // Get the current playing state
      const wasStillPlaying = get().isPlaying;
      
      // Update state with new audio
      set({ 
        audioElement, 
        currentPodcastId: podcastId,
        isPlaying: wasStillPlaying,  // Preserve playing state when switching podcasts
        currentTime: initialTime,
        duration: initialDuration,
        podcastMeta: meta || get().podcastMeta
      });
      
      // Add event listeners
      setupEventListeners(audioElement);
      
      // Resume playback if it was playing before
      if (wasStillPlaying) {
        try {
          setTimeout(() => {
            console.log("Audio setup: Auto-playing after setting new audio source");
            const playPromise = audioElement.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                console.warn("Could not auto-resume audio after setting new source:", error);
                set({ isPlaying: false });
              });
            }
          }, 50);
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
