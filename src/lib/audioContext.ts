
import { create } from 'zustand';

// Add podcast metadata type
export interface PodcastMeta {
  id: string;
  title: string;
  courseName: string;
  image?: string;
  audioUrl?: string; // Add audio URL to metadata
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
  continuePlayback: () => void; // New method to create and continue playback
}

export const useAudioStore = create<AudioState>((set, get) => ({
  audioElement: null,
  isPlaying: false,
  currentPodcastId: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8, // Using 0-1 scale
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
      
      // Remove event listeners - we'll recreate them for the new audio
      currentAudio.onended = null;
      currentAudio.ontimeupdate = null;
      currentAudio.onloadedmetadata = null;
      currentAudio.onloadeddata = null;
      currentAudio.onerror = null;
      
      // Set src to empty last to avoid pending network operations
      currentAudio.src = '';
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
    set({ podcastMeta: meta });
  },
  
  // New method to continue playback using stored metadata
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
  
  play: () => {
    const { audioElement, podcastMeta } = get();
    
    // If no audio element but we have metadata, try to recreate it
    if (!audioElement && podcastMeta?.audioUrl) {
      get().continuePlayback();
      // The play action will be handled by the oncanplay handler
      set({ isPlaying: true });
      return;
    }
    
    if (!audioElement) {
      console.warn("No audio element available in global store");
      return;
    }
    
    console.log("Playing audio from global store");
    
    // Check if the audio is actually loaded and ready before playing
    if (audioElement.readyState < 2) {
      console.log("Audio in global store not ready yet, waiting...");
      
      const canPlayHandler = () => {
        console.log("Audio in global store now ready to play");
        
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully from global store");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio from global store:", error);
              // Don't update state to playing if it failed
            });
        }
        
        // Remove event listener after attempting to play
        audioElement.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioElement.addEventListener('canplay', canPlayHandler);
      
      // Also set a timeout in case canplay never fires
      setTimeout(() => {
        if (!get().isPlaying) {
          console.log("Timeout: trying to play from global store anyway");
          
          const playPromise = audioElement.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("Audio playback started successfully from global store after timeout");
                set({ isPlaying: true });
              })
              .catch(error => {
                console.error("Error playing audio from global store after timeout:", error);
                // Don't update state to playing if it failed
              });
          }
        }
      }, 2000);
      
      return;
    }
    
    // If audio is already loaded, try to play directly
    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log("Audio playback started successfully from global store");
          set({ isPlaying: true });
        })
        .catch(error => {
          console.error("Error playing audio from global store:", error);
          // Don't update state to playing if it failed
        });
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
}));
