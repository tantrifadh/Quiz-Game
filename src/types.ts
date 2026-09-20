export type QuestionCategory =
  | 'umum'
  | 'sains'
  | 'teknologi'
  | 'pop'
  | 'logika'
  | 'custom';

export interface Question {
  id: string;
  category: QuestionCategory;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  difficulty?: 'mudah' | 'sedang' | 'sulit';
}

export interface QuizCategoryMeta {
  id: QuestionCategory;
  name: string;
  description: string;
  icon: string;
  badgeColor: string;
  bgGradient: string;
  questionsCount: number;
}

export interface PlayerProfile {
  name: string;
  avatar: string;
  avatarBg: string;
}

export type GameMode = 'classic' | 'tug_of_war' | 'mountain_climb';

export interface CompetitorAnswer {
  questionId: string;
  isCorrect: boolean;
  selectedOptionIndex: number | null;
  timeSpentMs: number;
}

export interface Competitor {
  id: string;
  name: string;
  avatar: string;
  avatarBg: string;
  score: number;
  streak: number;
  isHuman: boolean;
  accuracyRate: number; // 0.0 - 1.0 likelihood of answering right
  speedWeight: number; // 0.6 - 1.2 speed variance
  correctCount?: number;
  wrongCount?: number;
  answers?: CompetitorAnswer[];
  team?: 'left' | 'right'; // For Tug of War mode: Tim Kiri vs Tim Kanan
  altitudeMeters?: number; // For Mountain Climb mode: in MDPL (e.g. 0 - 3676m)
  climbProgress?: number; // 0 to 100%
}

export interface QuizPackage {
  id: string;
  title: string;
  description: string;
  icon?: string;
  badgeColor?: string;
  isBuiltIn?: boolean;
  questions: Question[];
}

export interface LeaderboardRecord {
  id: string;
  playerName: string;
  avatar: string;
  avatarBg: string;
  score: number;
  accuracy: number;
  correctAnswers: number;
  totalQuestions: number;
  maxStreak: number;
  categoryName: string;
  date: string;
  rank?: number;
}

export interface PowerUp {
  id: 'fiftyFifty' | 'doubleScore' | 'extraTime' | 'streakShield';
  name: string;
  description: string;
  icon: string;
  count: number;
  used: boolean;
}

export interface AnswerLog {
  question: Question;
  selectedOptionIndex: number | null;
  isCorrect: boolean;
  timeSpentMs: number;
  pointsEarned: number;
}

export type GamePhase =
  | 'lobby'
  | 'playing'
  | 'feedback'
  | 'podium'
  | 'review';
