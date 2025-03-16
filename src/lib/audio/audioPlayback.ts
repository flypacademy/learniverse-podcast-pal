
import { StateCreator } from 'zustand';
import { AudioState } from './types';

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
    
    // If no audio element but we have metadata, try to recreate it
    if (!audioElement && podcastMeta?.audioUrl) {
      console.log("No audio element but we have metadata - recreating audio for playback");
      get().continuePlayback();
      
      // Add a small delay to ensure the audio element is created before attempting to play
      setTimeout(() => {
        const newAudioElement = get().audioElement;
        if (newAudioElement) {
          console.log("Playing newly created audio element after delay");
          const playPromise = newAudioElement.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                set({ isPlaying: true });
              })
              .catch(error => {
                console.error("Error playing newly created audio:", error);
              });
          }
        }
      }, 300);
      
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
              // User interaction may be required for autoplay
              tryPlayOnUserInteraction();
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
                // User interaction may be required for autoplay
                tryPlayOnUserInteraction();
              });
          }
        }
      }, 1000);
      
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
          tryPlayOnUserInteraction();
        });
    }
    
    // Helper function to try playing on next user interaction
    function tryPlayOnUserInteraction() {
      // If autoplay is blocked, we need to set up a user interaction handler
      // to try playing again on the next user interaction
      const userInteractionHandler = () => {
        console.log("User interaction detected, trying to play audio again");
        
        const currentAudio = get().audioElement;
        if (!currentAudio) return;
        
        currentAudio.play()
          .then(() => {
            console.log("Audio playback started after user interaction");
            set({ isPlaying: true });
            
            // Remove the event listeners after successful playback
            document.removeEventListener('click', userInteractionHandler);
            document.removeEventListener('touchstart', userInteractionHandler);
          })
          .catch(err => {
            console.error("Still cannot play audio after user interaction:", err);
          });
      };
      
      // Add event listeners for user interaction
      document.addEventListener('click', userInteractionHandler, { once: true });
      document.addEventListener('touchstart', userInteractionHandler, { once: true });
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
});
