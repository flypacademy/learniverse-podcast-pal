
import { create } from 'zustand';
import { AudioState } from './audio/types';
import { createAudioControls } from './audio/audioControls';
import { createAudioSetup } from './audio/audioSetup';

// Re-export the PodcastMeta type
export { type PodcastMeta } from './audio/types';

// Create the audio store using our modular functions
export const useAudioStore = create<AudioState>((set, get) => {
  const audioControls = createAudioControls(set, get);
  const audioSetup = createAudioSetup(set, get);
  
  return {
    // Initial state
    audioElement: null,
    isPlaying: false,
    currentPodcastId: null,
    currentTime: 0,
    duration: 0,
    volume: 80,
    podcastMeta: null,
    
    // Setup and cleanup methods
    setAudio: audioSetup.setAudio,
    setPodcastMeta: audioSetup.setPodcastMeta,
    cleanup: audioSetup.cleanup,
    
    // Playback control methods
    play: audioControls.play,
    pause: audioControls.pause,
    setCurrentTime: audioControls.setCurrentTime,
    setDuration: audioControls.setDuration,
    setVolume: audioControls.setVolume
  };
});
