
import { AudioState } from './types';
import { createTimeHandlers } from './handlers/timeHandlers';
import { createMetadataHandlers } from './handlers/metadataHandlers';
import { createVisibilityHandlers } from './handlers/visibilityHandlers';

// Event handler functions for audio elements
export const createAudioEventHandlers = (
  set: (state: Partial<AudioState>) => void,
  get: () => AudioState
) => {
  const timeHandlers = createTimeHandlers(set, get);
  const metadataHandlers = createMetadataHandlers(set, get);
  const visibilityHandlers = createVisibilityHandlers(set, get);
  
  return {
    handleTimeUpdate: timeHandlers.handleTimeUpdate,
    handleEnded: timeHandlers.handleEnded,
    handleLoadedMetadata: metadataHandlers.handleLoadedMetadata,
    handleVisibilityChange: visibilityHandlers.handleVisibilityChange
  };
};
