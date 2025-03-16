
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
> = (set, get) => ({
  // Method to continue playback using stored metadata
  continuePlayback: () => {
    const meta = get().podcastMeta;
    
    if (!meta || !meta.audioUrl) {
      console.warn("Cannot continue playback: missing podcast metadata or audio URL");
      return;
    }
    
    // We need to create a new audio element if the original was cleaned up
    if (!get().audioElement) {
      console.log("Creating new audio element to continue playback");
      
      const newAudio = new Audio(meta.audioUrl);
      const currentTime = get().currentTime;
      
      // Set the current time if we had one
      if (currentTime > 0) {
        newAudio.currentTime = currentTime;
      }
      
      // Setup the audio element similar to setAudio method
      const safeVolume = Math.max(0, Math.min(1, get().volume));
      newAudio.volume = safeVolume;
      newAudio.preload = "auto";
      
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
      
      set({ audioElement: newAudio });
      
      // Auto-play when ready
      newAudio.oncanplay = () => {
        if (get().isPlaying) {
          newAudio.play()
            .catch(error => {
              console.error("Error auto-playing continued audio:", error);
            });
        }
      };
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
      
      // Set src to empty last to avoid pending network operations
      audioElement.src = '';
    }
    set({ 
      audioElement: null, 
      isPlaying: false, 
      currentPodcastId: null,
      currentTime: 0,
      podcastMeta: null
    });
  }
});
