
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
    const { podcastMeta, currentTime } = get();
    
    if (!podcastMeta?.audioUrl) {
      console.error("Cannot continue playback without audio URL");
      return;
    }
    
    try {
      console.log("Creating new audio element for continued playback");
      
      // Create a new audio element
      const newAudioElement = new Audio(podcastMeta.audioUrl);
      
      // Set volume based on stored value
      newAudioElement.volume = get().volume;
      
      // Set up event listeners before attempting playback
      // This helps prevent potential state update loops
      
      // Set up time update handler that won't cause re-render loops
      let lastTimeUpdate = 0;
      const timeUpdateHandler = () => {
        // Only update time if it's changed by at least 0.5 seconds to reduce updates
        if (Math.abs(newAudioElement.currentTime - lastTimeUpdate) >= 0.5) {
          lastTimeUpdate = newAudioElement.currentTime;
          set({ currentTime: newAudioElement.currentTime });
        }
      };
      
      newAudioElement.addEventListener('timeupdate', timeUpdateHandler);
      
      newAudioElement.addEventListener('loadedmetadata', () => {
        console.log("New audio element loaded metadata, duration:", newAudioElement.duration);
        set({ duration: newAudioElement.duration });
      });
      
      newAudioElement.addEventListener('ended', () => {
        set({ isPlaying: false, currentTime: 0 });
      });
      
      newAudioElement.addEventListener('error', (e) => {
        console.error("Error in recreated audio element:", e);
        // Don't update state on error to avoid potential loops
      });
      
      // Make sure the audio is loaded
      newAudioElement.preload = "auto";
      
      // Update state with new audio (in a single set call to avoid multiple rerenders)
      set({ audioElement: newAudioElement });
      
      // Wait for audio to be loaded before setting current time
      newAudioElement.addEventListener('canplay', () => {
        console.log("New audio element is ready to play");
        
        // Set current time if available
        if (currentTime > 0) {
          newAudioElement.currentTime = currentTime;
          set({ currentTime }); // Make sure store is updated too
        }
      });
      
    } catch (error) {
      console.error("Error recreating audio element:", error);
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
      audioElement.pause();
      
      // Remove event listeners to prevent memory leaks and avoid potential callbacks after cleanup
      const clonedAudio = audioElement;
      
      // Use a more robust approach to remove all listeners
      clonedAudio.onended = null;
      clonedAudio.ontimeupdate = null;
      clonedAudio.onloadedmetadata = null;
      clonedAudio.oncanplay = null;
      clonedAudio.onerror = null;
      
      // Clone references before clearing state to prevent accessing nullified values
      set({ 
        audioElement: null,
        isPlaying: false
      });
      
      // Clear the source on the cloned reference
      setTimeout(() => {
        try {
          clonedAudio.src = '';
        } catch (e) {
          console.log("Non-critical error cleaning audio source:", e);
        }
      }, 0);
      
    } catch (error) {
      console.error("Error during audio cleanup:", error);
      // Still attempt to reset the state even if cleanup fails
      set({ 
        audioElement: null,
        isPlaying: false
      });
    }
  }
});
