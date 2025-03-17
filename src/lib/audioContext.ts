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
    if (get().currentPodcastId === podcastId && get().audioElement) {
      if (meta) {
        set({ podcastMeta: meta });
      }
      return;
    }
    
    // Clean up existing audio if there is one
    const currentAudio = get().audioElement;
    if (currentAudio) {
      try {
        currentAudio.pause();
        // Don't clear the source - we want to keep playing the same audio
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
    
    // Update state with new audio
    set({ 
      audioElement, 
      currentPodcastId: podcastId,
      isPlaying: false,
      currentTime: initialTime,
      duration: initialDuration,
      podcastMeta: meta || get().podcastMeta
    });
    
    // Add event listeners
    const handleTimeUpdate = () => {
      const newTime = audioElement.currentTime;
      if (isFinite(newTime)) {
        set({ currentTime: newTime });
      }
    };
    
    const handleEnded = () => {
      set({ isPlaying: false, currentTime: 0 });
      audioElement.currentTime = 0;
    };
    
    const handleLoadedMetadata = () => {
      const newDuration = audioElement.duration;
      if (isFinite(newDuration) && newDuration > 0) {
        set({ duration: newDuration });
      }
    };
    
    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Attach cleanup functions to the audio element
    const originalRemoveEventListener = audioElement.removeEventListener.bind(audioElement);
    audioElement.removeEventListener = function(type, listener, options) {
      if (type === 'timeupdate' && listener === handleTimeUpdate) {
        return originalRemoveEventListener(type, handleTimeUpdate, options);
      }
      if (type === 'ended' && listener === handleEnded) {
        return originalRemoveEventListener(type, handleEnded, options);
      }
      if (type === 'loadedmetadata' && listener === handleLoadedMetadata) {
        return originalRemoveEventListener(type, handleLoadedMetadata, options);
      }
      return originalRemoveEventListener(type, listener, options);
    };
  },
  
  setPodcastMeta: (meta) => {
    set({ podcastMeta: meta });
  },
  
  play: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.play().catch(error => {
        console.error("Error playing audio:", error);
      });
      set({ isPlaying: true });
    }
  },
  
  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      audioElement.pause();
      set({ isPlaying: false });
    }
  },
  
  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement && isFinite(time)) {
      audioElement.currentTime = time;
      set({ currentTime: time });
    }
  },
  
  setDuration: (duration) => {
    if (isFinite(duration) && duration > 0) {
      set({ duration });
    }
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
      audioElement.pause();
      audioElement.src = '';
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
}));
