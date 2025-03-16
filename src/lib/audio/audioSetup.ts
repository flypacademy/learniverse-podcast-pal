
import { StateCreator } from 'zustand';
import { AudioState, PodcastMeta } from './types';

// Slice for setting up and configuring audio
export interface AudioSetupSlice {
  setAudio: (audioElement: HTMLAudioElement, podcastId: string, meta?: PodcastMeta) => void;
  setPodcastMeta: (meta: PodcastMeta) => void;
}

export const createAudioSetupSlice: StateCreator<
  AudioState,
  [],
  [],
  AudioSetupSlice
> = (set, get, api) => ({
  setAudio: (audioElement, podcastId, meta) => {
    // Validate inputs
    if (!audioElement) {
      console.error("Cannot set null audio element");
      return;
    }
    
    if (!podcastId) {
      console.error("Cannot set audio without podcast ID");
      return;
    }
    
    // If this is the same podcast that's already playing, don't reset
    const currentAudio = get().audioElement;
    const currentPodcastId = get().currentPodcastId;
    
    if (currentPodcastId === podcastId && currentAudio) {
      console.log("Same podcast already in store, updating metadata only");
      if (meta) {
        set({ podcastMeta: meta });
      }
      return;
    }
    
    // Clean up existing audio if there is one
    if (currentAudio) {
      console.log("Cleaning up existing audio before setting new audio");
      currentAudio.pause();
      
      // Remove event listeners - we'll recreate them for the new audio
      currentAudio.onended = null;
      currentAudio.ontimeupdate = null;
      currentAudio.onloadedmetadata = null;
      currentAudio.onloadeddata = null;
      currentAudio.onerror = null;
      
      // Set src to empty last to avoid pending network operations
      currentAudio.src = '';
    }
    
    console.log("Setting new audio in global store:", { 
      podcastId,
      audioSrc: audioElement.src
    });
    
    // Set the volume based on store state - ensure it's between 0-1
    const safeVolume = Math.max(0, Math.min(1, get().volume));
    audioElement.volume = safeVolume;
    
    // Make sure the audio is properly loaded before playing
    audioElement.preload = "auto";
    
    // Set up the new audio element
    audioElement.ontimeupdate = () => {
      set({ currentTime: audioElement.currentTime });
    };
    
    audioElement.onended = () => {
      set({ isPlaying: false, currentTime: 0 });
      audioElement.currentTime = 0;
    };
    
    audioElement.onloadedmetadata = () => {
      set({ duration: audioElement.duration || 0 });
    };
    
    // Handle loading events
    audioElement.onloadeddata = () => {
      console.log("Audio loaded data successfully");
    };
    
    audioElement.onerror = (e) => {
      console.error("Audio element error in global store:", e);
      // Don't update isPlaying state if there's an error
    };
    
    // Add canplay event to help with playback after load
    audioElement.oncanplay = () => {
      console.log("Audio can play in global store");
    };
    
    // Update state with new audio (in a single set call to avoid multiple rerenders)
    set({ 
      audioElement, 
      currentPodcastId: podcastId,
      isPlaying: false,
      currentTime: 0,
      duration: audioElement.duration || 0,
      podcastMeta: meta || null
    });
  },
  
  setPodcastMeta: (meta) => {
    if (!meta || !meta.id) {
      console.error("Cannot set invalid podcast metadata");
      return;
    }
    set({ podcastMeta: meta });
  },
});
