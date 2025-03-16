
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
  volume: 80,
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
      currentAudio.removeEventListener('timeupdate', () => {});
      currentAudio.removeEventListener('ended', () => {});
    }
    
    console.log("Setting new audio in global store:", { podcastId });
    
    // Set the volume based on store state
    audioElement.volume = get().volume / 100;
    
    // Update state with new audio
    set({ 
      audioElement, 
      currentPodcastId: podcastId,
      isPlaying: false,
      currentTime: 0,
      duration: audioElement.duration || 0,
      podcastMeta: meta || null
    });
    
    // Add event listeners
    audioElement.addEventListener('timeupdate', () => {
      set({ currentTime: audioElement.currentTime });
    });
    
    audioElement.addEventListener('ended', () => {
      set({ isPlaying: false, currentTime: 0 });
      audioElement.currentTime = 0;
    });
    
    audioElement.addEventListener('loadedmetadata', () => {
      set({ duration: audioElement.duration });
    });
  },
  
  setPodcastMeta: (meta) => {
    set({ podcastMeta: meta });
  },
  
  play: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Playing audio from global store");
      audioElement.play().catch(error => {
        console.error("Error playing audio from global store:", error);
      });
      set({ isPlaying: true });
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
    const { audioElement } = get();
    if (audioElement) {
      audioElement.volume = volume / 100;
    }
    set({ volume });
  },
  
  cleanup: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Cleaning up global audio store");
      audioElement.pause();
      audioElement.src = '';
      audioElement.removeEventListener('timeupdate', () => {});
      audioElement.removeEventListener('ended', () => {});
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
