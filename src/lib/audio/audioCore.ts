
import { AudioState, PodcastMeta } from './types';

/**
 * Core audio setup and cleanup functions
 * Handles the setup of a new audio element and cleaning up existing ones
 */
export const createAudioCore = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  return {
    /**
     * Clean up an existing audio element
     */
    cleanupAudioElement: (audioElement: HTMLAudioElement | null) => {
      if (!audioElement) return;
      
      try {
        // Store if it was playing before cleaning up
        const wasPlaying = !audioElement.paused;
        
        // Don't pause if it's already paused
        if (!audioElement.paused) {
          audioElement.pause();
        }
        
        // Clean up visibility change listener if it exists
        if ((audioElement as any).__cleanupVisibilityListener) {
          (audioElement as any).__cleanupVisibilityListener();
        }
        
        return wasPlaying;
      } catch (e) {
        console.error("Error cleaning up audio element:", e);
        return false;
      }
    },
    
    /**
     * Initialize a new audio element with the proper volume
     */
    initializeAudioElement: (audioElement: HTMLAudioElement) => {
      // Set the volume based on store state
      const storeVolume = get().volume;
      audioElement.volume = storeVolume / 100;
      console.log("Setting initial volume to:", storeVolume);
      
      return {
        initialDuration: isFinite(audioElement.duration) && audioElement.duration > 0 
          ? audioElement.duration 
          : 0,
          
        initialTime: isFinite(audioElement.currentTime) 
          ? audioElement.currentTime 
          : 0
      };
    },
    
    /**
     * Full cleanup of audio state
     */
    performFullCleanup: () => {
      const { audioElement } = get();
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
        
        // Clean up visibility change listener if it exists
        if ((audioElement as any).__cleanupVisibilityListener) {
          (audioElement as any).__cleanupVisibilityListener();
        }
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
