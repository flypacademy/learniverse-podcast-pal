
import { StateCreator } from 'zustand';
import { AudioState } from './types';
import { toast } from '@/components/ui/use-toast';

// Slice for audio playback controls
export interface AudioPlaybackSlice {
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
}

export const createAudioPlaybackSlice: StateCreator<
  AudioState,
  [],
  [],
  AudioPlaybackSlice
> = (set, get, api) => ({
  play: () => {
    const { audioElement, podcastMeta } = get();
    
    // Validate podcast has audio URL
    if (!podcastMeta?.audioUrl) {
      console.error("Cannot play - no audio URL in metadata");
      try {
        toast({
          title: "Playback error",
          description: "Audio source not available",
          variant: "destructive"
        });
      } catch (e) {
        console.error("Error showing toast:", e);
      }
      return;
    }
    
    // If no audio element but we have metadata, try to recreate it
    if (!audioElement && podcastMeta?.audioUrl) {
      console.log("No audio element but we have metadata - recreating audio for playback");
      get().continuePlayback();
      
      // Add a small delay to ensure the audio element is created before attempting to play
      setTimeout(() => {
        const newAudioElement = get().audioElement;
        if (newAudioElement) {
          console.log("Playing newly created audio element after delay");
          try {
            const playPromise = newAudioElement.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  set({ isPlaying: true });
                  console.log("Audio playback started successfully");
                })
                .catch(error => {
                  console.error("Error playing newly created audio:", error);
                  // Don't try to autoplay again, likely blocked by browser policy
                  set({ isPlaying: false });
                });
            }
          } catch (error) {
            console.error("Exception during play() of newly created audio:", error);
            set({ isPlaying: false });
          }
        }
      }, 500);
      
      return;
    }
    
    if (!audioElement) {
      console.warn("No audio element available in global store");
      return;
    }
    
    console.log("Playing audio from global store");
    
    // Check if audio URL is set correctly
    if (!audioElement.src || audioElement.src === 'about:blank' || audioElement.src === window.location.href) {
      console.log("Audio element has invalid src, setting it from metadata");
      if (podcastMeta?.audioUrl) {
        audioElement.src = podcastMeta.audioUrl;
        audioElement.load();
      }
    }
    
    // Wait for audio to be loadable before playing
    const playWithDelay = () => {
      try {
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully from global store");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio from global store:", error);
              set({ isPlaying: false });
            });
        }
      } catch (error) {
        console.error("Exception during play():", error);
        set({ isPlaying: false });
      }
    };
    
    // Check if the audio is actually loaded and ready before playing
    if (audioElement.readyState < 2) {
      console.log("Audio in global store not ready yet, waiting...");
      
      // Set up one-time event listeners
      const canPlayHandler = () => {
        console.log("Audio in global store now ready to play");
        playWithDelay();
        audioElement.removeEventListener('canplay', canPlayHandler);
      };
      
      // Add event listener for when audio can play
      audioElement.addEventListener('canplay', canPlayHandler, { once: true });
      
      // Also try to reload the audio
      if (podcastMeta?.audioUrl) {
        audioElement.src = podcastMeta.audioUrl;
        audioElement.load();
      }
      
      // Set a timeout in case canplay never fires
      setTimeout(() => {
        if (!get().isPlaying) {
          console.log("Timeout: trying to play from global store anyway");
          playWithDelay();
        }
      }, 1000);
      
      return;
    }
    
    // If audio is already loaded, try to play directly
    playWithDelay();
  },
  
  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Pausing audio from global store");
      try {
        audioElement.pause();
        set({ isPlaying: false });
      } catch (error) {
        console.error("Error pausing audio:", error);
      }
    }
  },
  
  setCurrentTime: (time) => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Setting current time in global store:", time);
      try {
        audioElement.currentTime = time;
        set({ currentTime: time });
      } catch (error) {
        console.error("Error setting current time:", error);
      }
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
      try {
        audioElement.volume = safeVolume;
      } catch (error) {
        console.error("Error setting volume:", error);
      }
    }
    set({ volume: safeVolume });
  },
});
