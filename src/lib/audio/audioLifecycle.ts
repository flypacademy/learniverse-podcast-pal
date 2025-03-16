
import { StateCreator } from 'zustand';
import { AudioState } from './types';

// Slice for audio lifecycle management
export interface AudioLifecycleSlice {
  continuePlayback: () => void;
  cleanup: () => void;
}

export const createAudioLifecycleSlice: StateCreator<
  AudioState, 
  [],
  [],
  AudioLifecycleSlice
> = (set, get, api) => ({
  continuePlayback: () => {
    const { podcastMeta, currentTime, isPlaying, volume } = get();
    
    if (!podcastMeta?.audioUrl) {
      console.error("Cannot continue playback without audio URL");
      return;
    }
    
    try {
      console.log("Creating new audio element for continued playback");
      
      // Clean up existing audio element first to avoid conflicts
      const existingAudio = get().audioElement;
      if (existingAudio) {
        try {
          existingAudio.pause();
          existingAudio.src = '';
        } catch (err) {
          console.warn("Non-critical error cleaning up existing audio:", err);
        }
      }
      
      // Create a new audio element
      const newAudioElement = new Audio();
      
      // Set initial volume
      const safeVolume = Math.max(0, Math.min(1, volume || 0.8));
      newAudioElement.volume = safeVolume;
      
      // Important: Set up event listeners BEFORE setting the source
      // This ensures we catch all events
      
      // Use a more efficient timeupdate handler that doesn't trigger state updates too often
      let lastTimeUpdate = 0;
      newAudioElement.addEventListener('timeupdate', () => {
        // Only update time if it's changed by at least 0.5 seconds to reduce updates
        if (Math.abs(newAudioElement.currentTime - lastTimeUpdate) >= 0.5) {
          lastTimeUpdate = newAudioElement.currentTime;
          set({ currentTime: newAudioElement.currentTime });
        }
      });
      
      newAudioElement.addEventListener('loadedmetadata', () => {
        console.log("New audio element loaded metadata, duration:", newAudioElement.duration);
        set({ duration: newAudioElement.duration || 0 });
      });
      
      newAudioElement.addEventListener('ended', () => {
        set({ isPlaying: false, currentTime: 0 });
      });
      
      newAudioElement.addEventListener('error', (e) => {
        console.error("Error in recreated audio element:", e);
      });
      
      // Set the source after adding event listeners
      newAudioElement.src = podcastMeta.audioUrl;
      
      // Ensure audio is loaded
      newAudioElement.preload = "auto";
      newAudioElement.load();
      
      // Update state with new audio
      set({ audioElement: newAudioElement });
      
      // Wait for audio to be loaded before setting time and playing
      const canPlayHandler = () => {
        console.log("New audio element is ready to play");
        
        // Set current time if available
        if (currentTime > 0) {
          try {
            newAudioElement.currentTime = currentTime;
            set({ currentTime }); // Make sure store is in sync
          } catch (error) {
            console.error("Error setting current time on new audio element:", error);
          }
        }
        
        // If it was previously playing, resume playback
        if (isPlaying) {
          try {
            console.log("Attempting to resume playback on new audio element");
            
            const playPromise = newAudioElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log("Successfully resumed playback on new audio element");
                  set({ isPlaying: true });
                })
                .catch(error => {
                  console.error("Error resuming playback on new audio element:", error);
                  set({ isPlaying: false });
                });
            }
          } catch (error) {
            console.error("Exception during play attempt on new audio element:", error);
            set({ isPlaying: false });
          }
        }
        
        // Remove the handler to avoid memory leaks
        newAudioElement.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add canplay event to handle ready state
      newAudioElement.addEventListener('canplay', canPlayHandler);
      
      // Set a fallback timeout in case canplay doesn't trigger
      setTimeout(() => {
        // Only try again if canplay hasn't fired yet
        if (newAudioElement && !newAudioElement.paused === isPlaying) {
          console.log("Fallback: canplay event didn't fire, trying to set time and play anyway");
          canPlayHandler();
        }
      }, 2000);
      
    } catch (error) {
      console.error("Fatal error recreating audio element:", error);
      set({ isPlaying: false });
    }
  },
  
  cleanup: () => {
    const { audioElement } = get();
    
    if (!audioElement) {
      return;
    }
    
    try {
      console.log("Cleaning up audio in store");
      
      // Pause playback
      try {
        audioElement.pause();
      } catch (e) {
        console.error("Error pausing audio during cleanup:", e);
      }
      
      // Store current references before nulling in state
      const elementToCleanup = audioElement;
      
      // Clear store state first
      set({ 
        audioElement: null,
        isPlaying: false
      });
      
      // Clean up event listeners to prevent memory leaks
      try {
        elementToCleanup.onended = null;
        elementToCleanup.ontimeupdate = null;
        elementToCleanup.onloadedmetadata = null;
        elementToCleanup.oncanplay = null;
        elementToCleanup.onerror = null;
        // Clear all events for safety
        elementToCleanup.onplay = null;
        elementToCleanup.onpause = null;
      } catch (e) {
        console.warn("Non-critical error removing event listeners:", e);
      }
      
      // Clear the source last, in a setTimeout to avoid blocking
      setTimeout(() => {
        try {
          elementToCleanup.src = '';
        } catch (err) {
          // This is non-critical
          console.warn("Non-critical error cleaning audio source:", err);
        }
      }, 0);
      
    } catch (error) {
      console.error("Error during audio cleanup:", error);
      // Still reset the state even if cleanup fails
      set({ 
        audioElement: null,
        isPlaying: false
      });
    }
  }
});
