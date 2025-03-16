
// Define types used across the audio context

export interface PodcastMeta {
  id: string;
  title: string;
  courseName: string;
  image?: string;
  audioUrl?: string;
}

export interface AudioState {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  currentPodcastId: string | null;
  currentTime: number;
  duration: number;
  volume: number;
  podcastMeta: PodcastMeta | null;
  
  // Actions
  setAudio: (audioElement: HTMLAudioElement, podcastId: string, meta?: PodcastMeta) => void;
  setPodcastMeta: (meta: PodcastMeta) => void;
  play: () => void;
  pause: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  cleanup: () => void;
  continuePlayback: () => void;
}
