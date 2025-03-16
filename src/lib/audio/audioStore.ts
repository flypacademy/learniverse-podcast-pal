
import { create } from 'zustand';
import { AudioState } from './types';
import { createAudioSetupSlice } from './audioSetup';
import { createAudioPlaybackSlice } from './audioPlayback';
import { createAudioLifecycleSlice } from './audioLifecycle';

// Create the combined audio store with all the slices
export const useAudioStore = create<AudioState>((set, get) => ({
  // Initial state
  audioElement: null,
  isPlaying: false,
  currentPodcastId: null,
  currentTime: 0,
  duration: 0,
  volume: 0.8, // Using 0-1 scale
  podcastMeta: null,
  
  // Include all the slices
  ...createAudioSetupSlice(set, get),
  ...createAudioPlaybackSlice(set, get),
  ...createAudioLifecycleSlice(set, get),
}));
