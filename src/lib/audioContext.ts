
import { create } from 'zustand';

interface AudioState {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentPodcastId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  setAudio: (audioElement: HTMLAudioElement, podcastId: string) => void;
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
  
  setAudio: (audioElement, podcastId) => {
    // Clean up existing audio if there is one
    const currentAudio = get().audioElement;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.removeEventListener('timeupdate', () => {});
      currentAudio.removeEventListener('ended', () => {});
    }
    
    // Set the volume based on store state
    audioElement.volume = get().volume / 100;
    
    // Update state with new audio
    set({ 
      audioElement, 
      currentPodcastId: podcastId,
      isPlaying: false,
      currentTime: 0,
      duration: audioElement.duration || 0
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
    if (audioElement) {
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
      audioElement.pause();
      audioElement.src = '';
      audioElement.removeEventListener('timeupdate', () => {});
      audioElement.removeEventListener('ended', () => {});
    }
    set({ 
      audioElement: null, 
      isPlaying: false, 
      currentPodcastId: null,
      currentTime: 0
    });
  }
}));
