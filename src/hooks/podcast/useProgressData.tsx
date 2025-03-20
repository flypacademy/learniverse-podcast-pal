
import { PodcastProgressData } from "@/types/podcast";

export function useProgressData(
  audioRef: React.RefObject<HTMLAudioElement>,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
) {
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (!progressData || progressData.last_position === undefined) {
      console.log("No valid progress data to restore");
      return;
    }
    
    if (progressData.last_position > 0 && audioRef.current) {
      try {
        console.log("Restoring podcast position to:", progressData.last_position);
        audioRef.current.currentTime = progressData.last_position;
        setCurrentTime(progressData.last_position);
      } catch (error) {
        console.error("Error setting audio currentTime:", error);
      }
    } else {
      console.log("No previous position to restore (position was 0 or audio not ready)");
    }
  };

  return {
    handleProgressData
  };
}
