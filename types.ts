
export interface UserStats {
  streak: number;
  totalPoints: number;
  xp: number; // Experience points for levels
  level: number;
  workoutsCompleted: number;
  lastWorkoutDate: string | null;
  badges: string[];
  isPremium: boolean;
  userId: string;
  username: string;
}

// 5 Archetypes x 5 Skins
export type CharacterArchetype = 'CYBER' | 'STICKMAN' | 'MECH' | 'ALIEN' | 'SPIRIT';
export type CharacterSkinId = number; // 0 to 4

export interface UserSettings {
  isDebugMode: boolean;
  soundEnabled: boolean;
  seatedMode: boolean;
  characterArchetype: CharacterArchetype;
  characterSkin: CharacterSkinId;
}

export interface LogMessage {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  avatar: string;
  level: number;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  PAYWALL = 'PAYWALL',
  HOME = 'HOME',
  WORKOUT = 'WORKOUT',
  RESULTS = 'RESULTS',
  BADGE_REVEAL = 'BADGE_REVEAL', // New separate view for unlocking badges
  LEADERBOARD = 'LEADERBOARD',
  SETTINGS = 'SETTINGS',
  LEVELING = 'LEVELING', // New View
  RATE_US = 'RATE_US',
}

export interface WorkoutResultData {
  score: number;
  xpGained: number;
  newBadges: string[];
  isNewStreak: boolean;
  isLevelUp: boolean;
  prevLevel: number;
  newLevel: number;
}

export type ExerciseType = 'Jumping Jacks' | 'Squats' | 'High Knees' | 'Shadow Boxing' | 'Overhead Reach' | 'T-Pose Pulses' | 'Hooks' | 'Uppercuts' | 'Shoulder Press' | 'Rest';

export interface ExerciseDef {
  id: ExerciseType;
  name: string;
  duration: number;
  instruction: string;
  color: string;
}

export interface GameState {
  score: number;
  combo: number; // Multiplier (1x, 2x, 4x...)
  health: number; // 0-100
  feedback: string;
  feedbackType: 'neutral' | 'good' | 'bad';
  isSessionActive: boolean;
  currentExerciseIndex: number;
  timeRemaining: number;
  phase: 'WARMUP' | 'COUNTDOWN' | 'ACTIVE' | 'COOLDOWN';
  lastHitTime: number;
  incorrectJoints?: string[];
}

export interface OnboardingAnswers {
  goal: string;
  level: string;
  frequency: string;
}
