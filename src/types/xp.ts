
export interface XPTransaction {
  amount: number;
  reason: string;
  timestamp: string;
}

export interface UserXP {
  totalXP: number;
  weeklyXP: number;
  lastUpdated: string;
}

export enum XPReason {
  LISTENING_TIME = "listening time",
  PODCAST_COMPLETION = "completing a podcast",
  STREAK_DAY = "maintaining a daily streak",
  WEEKLY_STREAK = "completing a weekly streak",
  QUIZ_COMPLETION = "completing a quiz",
  QUIZ_PERFECT = "perfect quiz score"
}
