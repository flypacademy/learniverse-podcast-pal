
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
    
    // Validate podcast metadata
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
    
    // If no audio element but we have metadata, recreate the audio
    if (!audioElement && podcastMeta?.audioUrl) {
      console.log("No audio element but we have metadata - recreating audio for playback");
      get().continuePlayback();
      return; // continuePlayback will handle playback if isPlaying was true
    }
    
    if (!audioElement) {
      console.warn("No audio element available for playback");
      return;
    }
    
    console.log("Playing audio from global store");
    
    // Check if audio source is valid
    if (!audioElement.src || audioElement.src === 'about:blank' || audioElement.src === window.location.href) {
      console.log("Audio element has invalid src, setting it from metadata");
      if (podcastMeta?.audioUrl) {
        audioElement.src = podcastMeta.audioUrl;
        audioElement.load();
      }
    }
    
    // Play audio safely
    const safePlay = () => {
      try {
        const playPromise = audioElement.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              set({ isPlaying: true });
            })
            .catch(error => {
              console.error("Error playing audio:", error);
              
              // Check for specific errors
              if (error.name === "NotAllowedError") {
                toast({
                  title: "Playback blocked",
                  description: "Browser requires user interaction to play audio",
                  variant: "destructive"
                });
              } else if (error.name === "NotSupportedError") {
                // Try to recreate the audio element if format not supported
                console.log("Audio format not supported, trying to recreate audio");
                get().continuePlayback();
              } else {
                toast({
                  title: "Playback error",
                  description: "Could not play audio. Please try again.",
                  variant: "destructive"
                });
              }
              
              set({ isPlaying: false });
            });
        }
      } catch (error) {
        console.error("Exception during play():", error);
        set({ isPlaying: false });
      }
    };
    
    // If audio is not ready, wait for it
    if (audioElement.readyState < 2) {
      console.log("Audio not ready yet, waiting for canplay event");
      
      // Use canplay event to know when we can play
      const canPlayHandler = () => {
        console.log("Audio now ready to play");
        safePlay();
        audioElement.removeEventListener('canplay', canPlayHandler);
      };
      
      audioElement.addEventListener('canplay', canPlayHandler);
      
      // Also try to reload the audio if needed
      audioElement.load();
      
      // Set a timeout in case canplay never fires
      setTimeout(() => {
        if (!get().isPlaying) {
          console.log("Timeout: trying to play anyway");
          audioElement.removeEventListener('canplay', canPlayHandler);
          safePlay();
        }
      }, 1000);
    } else {
      // Audio is ready, play directly
      safePlay();
    }
  },
  
  pause: () => {
    const { audioElement } = get();
    if (audioElement) {
      console.log("Pausing audio");
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
      try {
        audioElement.currentTime = time;
        set({ currentTime: time });
      } catch (error) {
        console.error("Error setting current time:", error);
      }
    } else {
      // If no audio element, just update the store so the time is correct when audio is recreated
      set({ currentTime: time });
    }
  },
  
  setDuration: (duration) => {
    set({ duration: duration || 0 });
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
