export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  dailyGoalRepetitions: number;
  showTashkeel: boolean;
  testDifficulty: 'easy' | 'medium' | 'hard';
  notifications: boolean;
}

export const defaultSettings: UserSettings = {
  theme: 'system',
  fontSize: 'medium',
  dailyGoalRepetitions: 10,
  showTashkeel: true,
  testDifficulty: 'medium',
  notifications: false,
};
