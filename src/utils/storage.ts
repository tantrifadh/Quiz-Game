import { LeaderboardRecord, Question, PlayerProfile } from '../types';

const LEADERBOARD_KEY = 'quizizz_leaderboard_records';
const CUSTOM_QUIZZES_KEY = 'quizizz_custom_quizzes';
const PROFILE_KEY = 'quizizz_saved_profile';

const INITIAL_LEADERBOARD_SEEDS: LeaderboardRecord[] = [
  {
    id: 'seed-1',
    playerName: 'Bintang Alamsyah',
    avatar: '⚡',
    avatarBg: 'bg-amber-500',
    score: 9420,
    accuracy: 100,
    correctAnswers: 10,
    totalQuestions: 10,
    maxStreak: 10,
    categoryName: 'Sains & Luar Angkasa',
    date: 'Kemarin',
  },
  {
    id: 'seed-2',
    playerName: 'Clarissa Putri',
    avatar: '🦄',
    avatarBg: 'bg-pink-500',
    score: 8950,
    accuracy: 90,
    correctAnswers: 9,
    totalQuestions: 10,
    maxStreak: 7,
    categoryName: 'Pengetahuan Umum',
    date: '2 hari lalu',
  },
  {
    id: 'seed-3',
    playerName: 'Rian Hidayat',
    avatar: '🎮',
    avatarBg: 'bg-indigo-600',
    score: 8630,
    accuracy: 90,
    correctAnswers: 9,
    totalQuestions: 10,
    maxStreak: 6,
    categoryName: 'Teknologi & Gaming',
    date: '3 hari lalu',
  },
  {
    id: 'seed-4',
    playerName: 'Dewi Kartika',
    avatar: '🦉',
    avatarBg: 'bg-purple-600',
    score: 7920,
    accuracy: 80,
    correctAnswers: 8,
    totalQuestions: 10,
    maxStreak: 5,
    categoryName: 'Asah Otak & Logika',
    date: '4 hari lalu',
  },
  {
    id: 'seed-5',
    playerName: 'Rafi Ramadhan',
    avatar: '🚀',
    avatarBg: 'bg-blue-500',
    score: 7410,
    accuracy: 80,
    correctAnswers: 8,
    totalQuestions: 10,
    maxStreak: 4,
    categoryName: 'Pop Culture & Musik',
    date: 'Minggu lalu',
  },
];

export function getStoredLeaderboard(): LeaderboardRecord[] {
  try {
    const raw = localStorage.getItem(LEADERBOARD_KEY);
    if (!raw) {
      localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(INITIAL_LEADERBOARD_SEEDS));
      return INITIAL_LEADERBOARD_SEEDS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : INITIAL_LEADERBOARD_SEEDS;
  } catch {
    return INITIAL_LEADERBOARD_SEEDS;
  }
}

export function saveLeaderboardRecord(record: LeaderboardRecord): LeaderboardRecord[] {
  const current = getStoredLeaderboard();
  const updated = [record, ...current]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50); // Keep top 50 records
  try {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota error
  }
  return updated;
}

export function clearStoredLeaderboard(): LeaderboardRecord[] {
  try {
    localStorage.removeItem(LEADERBOARD_KEY);
  } catch {
    // Ignore
  }
  return [];
}

export function getStoredCustomQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUIZZES_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveCustomQuestion(q: Question): Question[] {
  const current = getStoredCustomQuestions();
  const updated = [q, ...current];
  try {
    localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function deleteCustomQuestion(id: string): Question[] {
  const current = getStoredCustomQuestions();
  const updated = current.filter((q) => q.id !== id);
  try {
    localStorage.setItem(CUSTOM_QUIZZES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function getSavedProfile(): PlayerProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return {
    name: 'Bintang Kuis',
    avatar: '🦊',
    avatarBg: 'bg-orange-500',
  };
}

export function savePlayerProfile(profile: PlayerProfile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Ignore
  }
}
