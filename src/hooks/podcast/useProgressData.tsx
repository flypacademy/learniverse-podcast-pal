
import { PodcastProgressData } from "@/types/podcast";

export function useProgressData(
  audioRef: React.RefObject<HTMLAudioElement>,
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>
) {
  const handleProgressData = (progressData: PodcastProgressData) => {
    if (progressData.last_position > 0 && audioRef.current) {
      try {
        audioRef.current.currentTime = progressData.last_position;
        setCurrentTime(progressData.last_position);
      } catch (error) {
        console.error("Error setting audio currentTime:", error);
      }
    }
  };

  return {
    handleProgressData
  };
}
