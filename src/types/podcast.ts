
export interface PodcastData {
  id: string;
  title: string;
  audio_url: string;
  image_url?: string | null;
  duration: number;
  description?: string | null;
  course_id?: string;
}

export interface PodcastProgressData {
  last_position: number;
  completed: boolean;
}

export interface CourseData {
  id: string;
  title: string;
  image?: string;
}
