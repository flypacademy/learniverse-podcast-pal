import { StateCreator } from 'zustand';
import { AudioState } from './types';

// Slice for audio lifecycle management (continuation and cleanup)
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
  // Method to continue playback using stored metadata
  continuePlayback: () => {
    const meta = get().podcastMeta;
    
    if (!meta || !meta.audioUrl) {
      console.warn("Cannot continue playback: missing podcast metadata or audio URL");
      return;
    }
    
    try {
      // Validate the audio URL before creating a new element
      new URL(meta.audioUrl); // This will throw if URL is invalid
      
      // We need to create a new audio element if the original was cleaned up
      if (!get().audioElement) {
        console.log("Creating new audio element to continue playback");
        
        const newAudio = new Audio();
        
        // Setup event handlers before setting src to avoid race conditions
        newAudio.preload = "auto";
        
        // Set up error handling first
        newAudio.onerror = (e) => {
          console.error("Error in continued playback audio:", e);
          
          // Try to recover
          setTimeout(() => {
            console.log("Attempting to recover from playback error");
            newAudio.load();
          }, 1000);
        };
        
        newAudio.ontimeupdate = () => {
          set({ currentTime: newAudio.currentTime });
        };
        
        newAudio.onended = () => {
          set({ isPlaying: false, currentTime: 0 });
          newAudio.currentTime = 0;
        };
        
        newAudio.onloadedmetadata = () => {
          set({ duration: newAudio.duration || 0 });
        };
        
        // Set volume before loading content
        const safeVolume = Math.max(0, Math.min(1, get().volume));
        newAudio.volume = safeVolume;
        
        // Only set the src after all handlers are in place
        newAudio.src = meta.audioUrl;
        
        // Set audio element in state
        set({ audioElement: newAudio });
        
        // Set current time after load is complete
        const currentTime = get().currentTime;
        newAudio.oncanplaythrough = () => {
          console.log("Audio can play through, setting current time:", currentTime);
          if (currentTime > 0) {
            newAudio.currentTime = currentTime;
          }
          
          // Auto-play when ready if isPlaying is true
          if (get().isPlaying) {
            newAudio.play()
              .catch(error => {
                console.error("Error auto-playing continued audio:", error);
              });
          }
        };
        
        // Start loading the audio
        newAudio.load();
      }
    } catch (error) {
      console.error("Invalid audio URL in metadata:", error);
    }
  },
  
  cleanup: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Cleaning up global audio store");
      audioElement.pause();
      
      // Remove all event listeners
      audioElement.onended = null;
      audioElement.ontimeupdate = null;
      audioElement.onloadedmetadata = null;
      audioElement.onloadeddata = null;
      audioElement.onerror = null;
      audioElement.oncanplay = null;
      audioElement.oncanplaythrough = null; // Added this
      
      // Store current state before cleanup if metadata exists
      const meta = get().podcastMeta;
      const currentTime = get().currentTime;
      const isPlaying = get().isPlaying;
      
      // Set src to empty last to avoid pending network operations
      audioElement.src = '';
      
      // Clear audio element but maintain state if possible
      set({ 
        audioElement: null,
        isPlaying: meta ? isPlaying : false,
        currentPodcastId: meta ? get().currentPodcastId : null,
        currentTime: meta ? currentTime : 0
        // We keep podcastMeta if it exists
      });
    } else {
      // Full cleanup if no audio element
      set({ 
        audioElement: null, 
        isPlaying: false, 
        currentPodcastId: null,
        currentTime: 0,
        podcastMeta: null
      });
    }
  }
});
