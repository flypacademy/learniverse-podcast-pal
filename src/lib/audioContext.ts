
import { create } from 'zustand';

// Add podcast metadata type
export interface PodcastMeta {
  id: string;
  title: string;
  courseName: string;
  image?: string;
}

interface AudioState {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentPodcastId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  podcastMeta: PodcastMeta | null;
  setAudio: (audioElement: HTMLAudioElement, podcastId: string, meta?: PodcastMeta) => void;
  setPodcastMeta: (meta: PodcastMeta) => void;
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  cleanup: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioElement: null,
  isPlaying: false,
  currentPodcastId: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8, // Changed to 0-1 scale
  podcastMeta: null,
  
  setAudio: (audioElement, podcastId, meta) => {
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
      currentAudio.src = '';
      
      // Remove event listeners - we'll recreate them for the new audio
      currentAudio.onended = null;
      currentAudio.ontimeupdate = null;
      currentAudio.onloadedmetadata = null;
    }
    
    console.log("Setting new audio in global store:", { podcastId });
    
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
      console.error("Audio element error:", e);
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
    set({ podcastMeta: meta });
  },
  
  play: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Playing audio from global store");
      
      // Create a user interaction first by unlocking audio context
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log("Audio playback started successfully");
          set({ isPlaying: true });
        }).catch(error => {
          console.error("Error playing audio from global store:", error);
          // Don't update state to playing if it failed
        });
      }
    }
  },
  
  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Pausing audio from global store");
      audioElement.pause();
      set({ isPlaying: false });
    }
  },
  
  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Setting current time in global store:", time);
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },
  
  setDuration: (duration) => {
    set({ duration });
  },
  
  setVolume: (volume) => {
    // Ensure volume is within valid range of 0-1
    const safeVolume = Math.max(0, Math.min(1, volume));
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = safeVolume;
    }
    set({ volume: safeVolume });
  },
  
  cleanup: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Cleaning up global audio store");
      audioElement.pause();
      audioElement.src = '';
      audioElement.onended = null;
      audioElement.ontimeupdate = null;
      audioElement.onloadedmetadata = null;
      audioElement.onloadeddata = null;
      audioElement.onerror = null;
    }
    set({ 
      audioElement: null, 
      isPlaying: false, 
      currentPodcastId: null,
      currentTime: 0,
      podcastMeta: null
    });
  }
}));
