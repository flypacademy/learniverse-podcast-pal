
import { AudioState, PodcastMeta } from './types';
import { createAudioEventHandlers } from './audioEventHandlers';
import { createAudioCore } from './audioCore';
import { createAudioSync } from './audioSync';

// Setup and cleanup functions for audio elements
export const createAudioSetup = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  const audioCore = createAudioCore(set, get);
  const audioSync = createAudioSync(set, get);
  
  return {
    setAudio: (audioElement: HTMLAudioElement, podcastId: string, meta?: PodcastMeta) => {
      // Get current state for comparison
      const { currentPodcastId, audioElement: currentAudio, currentTime: storedTime, isPlaying: wasPlaying } = get();
      
      console.log("Audio setup: setAudio called", { 
        podcastId, 
        currentPodcastId, 
        wasPlaying, 
        storedTime,
        hasMeta: !!meta
      });
      
      // If this is the same podcast that's already playing, preserve the state
      if (currentPodcastId === podcastId && currentAudio) {
        console.log("Audio setup: Same podcast detected, preserving state");
        
        // Only update metadata if provided
        if (meta) {
          set({ podcastMeta: meta });
        }
        
        // If it's a different audio element for the same podcast, sync the time
        if (currentAudio !== audioElement) {
          audioSync.handleSamePodcastDifferentElement(
            audioElement, 
            currentAudio, 
            storedTime, 
            wasPlaying,
            meta
          );
        }
        
        return;
      }
      
      // Clean up existing audio if there is one
      if (currentAudio) {
        const wasPlayingBefore = audioCore.cleanupAudioElement(currentAudio);
        
        // Handle a new podcast with a new audio element
        audioSync.handleNewPodcast(audioElement, podcastId, wasPlayingBefore, meta);
      } else {
        // No previous audio, simply set up the new one
        audioSync.handleNewPodcast(audioElement, podcastId, false, meta);
      }
    },
    
    setPodcastMeta: (meta: PodcastMeta) => {
      set({ podcastMeta: meta });
    },
    
    cleanup: () => {
      audioCore.performFullCleanup();
    }
  };
};
