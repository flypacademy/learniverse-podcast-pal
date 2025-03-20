
import { AudioState } from '../types';

/**
 * Handlers for metadata-related audio events
 */
export const createMetadataHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  /**
   * Handle audio loadedmetadata event
   */
  const handleLoadedMetadata = (audioElement: HTMLAudioElement) => {
    const newDuration = audioElement.duration;
    if (isFinite(newDuration) && newDuration > 0) {
      set({ duration: newDuration });
    }
  };
  
  return {
    handleLoadedMetadata
  };
};
