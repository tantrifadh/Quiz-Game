import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { QuizScreen } from './components/QuizScreen';
import { AnswerFeedbackModal } from './components/AnswerFeedbackModal';
import { PodiumScreen } from './components/PodiumScreen';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CustomQuizModal } from './components/CustomQuizModal';
import {
  Question,
  QuestionCategory,
  PlayerProfile,
  Competitor,
  PowerUp,
  AnswerLog,
  GamePhase,
  LeaderboardRecord,
} from './types';
import {
  DEFAULT_QUESTIONS,
  BOT_PLAYERS,
  CATEGORIES,
} from './data/quizData';
import {
  getStoredLeaderboard,
  saveLeaderboardRecord,
  clearStoredLeaderboard,
  getStoredCustomQuestions,
  saveCustomQuestion,
  deleteCustomQuestion,
  getSavedProfile,
  savePlayerProfile,
} from './utils/storage';
import { sound } from './utils/audio';

export default function App() {
  // Global Audio & Modals State
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showCustomQuizModal, setShowCustomQuizModal] = useState<boolean>(false);

  // Persistent Player Profile & Data
  const [profile, setProfile] = useState<PlayerProfile>(getSavedProfile);
  const [leaderboardRecords, setLeaderboardRecords] = useState<LeaderboardRecord[]>(getStoredLeaderboard);
  const [customQuestions, setCustomQuestions] = useState<Question[]>(getStoredCustomQuestions);

  // Active Game State
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string>('Pengetahuan Umum');
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [previousRank, setPreviousRank] = useState<number>(1);
  const [currentRank, setCurrentRank] = useState<number>(1);
  const [answerLogs, setAnswerLogs] = useState<AnswerLog[]>([]);

  // Power-ups state for current match
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: 'extraTime',
      name: '+10s Waktu',
      description: 'Tambah waktu berpikir 10 detik',
      icon: '⏱️',
      count: 2,
      used: false,
    },
    {
      id: 'fiftyFifty',
      name: '50:50',
      description: 'Hilangkan 2 pilihan salah',
      icon: '✂️',
      count: 2,
      used: false,
    },
    {
      id: 'doubleScore',
      name: '2X Poin',
      description: 'Lipatgandakan perolehan poin soal ini',
      icon: '💥',
      count: 1,
      used: false,
    },
    {
      id: 'streakShield',
      name: 'Shield',
      description: 'Streak tidak hilang meski salah menjawab',
      icon: '🛡️',
      count: 1,
      used: false,
    },
  ]);

  // Active power-up buffs for the current question
  const [isDoubleScoreActive, setIsDoubleScoreActive] = useState<boolean>(false);
  const [isStreakShieldActive, setIsStreakShieldActive] = useState<boolean>(false);

  // Last Answer Feedback State
  const [lastFeedback, setLastFeedback] = useState<{
    isCorrect: boolean;
    question: Question;
    selectedOptionIndex: number | null;
    pointsEarned: number;
    basePoints: number;
    speedBonus: number;
    streakBonus: number;
    multiplierBonus: number;
    newStreak: number;
  } | null>(null);

  // Sync profile edits
  const handleUpdateProfile = (newProfile: PlayerProfile) => {
    setProfile(newProfile);
    savePlayerProfile(newProfile);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  // Start a new game match
  const handleStartGame = ({
    category,
    questionCount,
    timePerQuestion: timeLimit,
    opponentCount,
  }: {
    category: QuestionCategory | 'all';
    questionCount: number;
    timePerQuestion: number;
    opponentCount: number;
  }) => {
    // Filter questions
    let pool: Question[] = [];
    let title = 'Campuran Semua Topik';

    if (category === 'custom') {
      pool = [...customQuestions];
      title = 'Soal Buatan Sendiri';
    } else if (category === 'all') {
      pool = [...DEFAULT_QUESTIONS, ...customQuestions];
      title = 'Semua Kategori (Acak)';
    } else {
      pool = DEFAULT_QUESTIONS.filter((q) => q.category === category);
      const meta = CATEGORIES.find((c) => c.id === category);
      if (meta) title = meta.name;
    }

    if (pool.length === 0) {
      pool = [...DEFAULT_QUESTIONS];
      title = 'Pengetahuan Umum';
    }

    // Shuffle pool
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));

    // Setup Competitors: Human + selected bots
    const shuffledBots = [...BOT_PLAYERS].sort(() => 0.5 - Math.random()).slice(0, opponentCount);
    const initialCompetitors: Competitor[] = [
      {
        id: 'player-human',
        name: profile.name,
        avatar: profile.avatar,
        avatarBg: profile.avatarBg,
        score: 0,
        streak: 0,
        isHuman: true,
        accuracyRate: 1.0,
        speedWeight: 1.0,
      },
      ...shuffledBots.map((bot, idx) => ({
        id: `bot-${idx}`,
        name: bot.name,
        avatar: bot.avatar,
        avatarBg: bot.avatarBg,
        score: 0,
        streak: 0,
        isHuman: false,
        accuracyRate: bot.accuracyRate,
        speedWeight: bot.speedWeight,
      })),
    ];

    // Reset power-ups
    setPowerUps([
      { id: 'extraTime', name: '+10s Waktu', description: 'Tambah 10 detik', icon: '⏱️', count: 2, used: false },
      { id: 'fiftyFifty', name: '50:50', description: 'Hilangkan 2 opsi salah', icon: '✂️', count: 2, used: false },
      { id: 'doubleScore', name: '2X Poin', description: 'Gandakan poin', icon: '💥', count: 1, used: false },
      { id: 'streakShield', name: 'Shield', description: 'Lindungi streak', icon: '🛡️', count: 1, used: false },
    ]);
    setIsDoubleScoreActive(false);
    setIsStreakShieldActive(false);

    setActiveCategoryTitle(title);
    setGameQuestions(selectedQuestions);
    setCurrentQuestionIndex(0);
    setTimePerQuestion(timeLimit);
    setScore(0);
    setStreak(0);
    setCompetitors(initialCompetitors);
    setPreviousRank(1);
    setCurrentRank(1);
    setAnswerLogs([]);
    setLastFeedback(null);
    setGamePhase('playing');
  };

  // Use a power-up
  const handleUsePowerUp = (id: PowerUp['id']) => {
    setPowerUps((prev) =>
      prev.map((pu) => (pu.id === id ? { ...pu, count: Math.max(0, pu.count - 1) } : pu))
    );
    if (id === 'doubleScore') {
      setIsDoubleScoreActive(true);
    } else if (id === 'streakShield') {
      setIsStreakShieldActive(true);
    }
  };

  // Handle Player Answer Selection
  const handleSelectAnswer = (optionIndex: number | null, timeSpentMs: number) => {
    const question = gameQuestions[currentQuestionIndex];
    if (!question) return;

    const isCorrect = optionIndex !== null && optionIndex === question.correctIndex;

    // Calculate points:
    // Base: 600
    // Speed Bonus: (remaining time fraction) * 350
    // Streak Bonus: streak * 60
    let basePts = 0;
    let speedPts = 0;
    let streakPts = 0;
    let multiplierPts = 0;
    let totalPts = 0;
    let newStreak = streak;

    if (isCorrect) {
      sound.playCorrect();
      basePts = 600;
      const timeFraction = Math.max(0, 1 - timeSpentMs / (timePerQuestion * 1000));
      speedPts = Math.round(timeFraction * 350);
      streakPts = streak * 80;

      let subtotal = basePts + speedPts + streakPts;
      if (isDoubleScoreActive) {
        multiplierPts = subtotal; // 2x
        subtotal *= 2;
      }
      totalPts = subtotal;
      newStreak = streak + 1;
      if (newStreak >= 3) {
        sound.playStreak();
      }
    } else {
      sound.playWrong();
      if (isStreakShieldActive) {
        // Shield preserves streak
        newStreak = streak;
      } else {
        newStreak = 0;
      }
    }

    const newScore = score + totalPts;
    setScore(newScore);
    setStreak(newStreak);

    // Reset single-turn power-up buffs
    setIsDoubleScoreActive(false);
    setIsStreakShieldActive(false);

    // Simulate competitor bots' answers for this question
    const updatedCompetitors = competitors.map((c) => {
      if (c.isHuman) {
        return {
          ...c,
          score: newScore,
          streak: newStreak,
        };
      }

      // Bot logic
      const willBeCorrect = Math.random() < c.accuracyRate;
      if (willBeCorrect) {
        const botTimeSpent = (timePerQuestion * 0.2 + Math.random() * timePerQuestion * 0.6) * c.speedWeight;
        const botFraction = Math.max(0, 1 - botTimeSpent / timePerQuestion);
        const botBase = 600;
        const botSpeed = Math.round(botFraction * 320);
        const botStreakPts = c.streak * 70;
        const botGained = botBase + botSpeed + botStreakPts;
        return {
          ...c,
          score: c.score + botGained,
          streak: c.streak + 1,
        };
      } else {
        return {
          ...c,
          streak: 0,
        };
      }
    });

    // Determine rankings
    const prevRankIndex = [...competitors].sort((a, b) => b.score - a.score).findIndex((c) => c.isHuman) + 1;
    const newRankIndex = [...updatedCompetitors].sort((a, b) => b.score - a.score).findIndex((c) => c.isHuman) + 1;

    setPreviousRank(prevRankIndex);
    setCurrentRank(newRankIndex);
    setCompetitors(updatedCompetitors);

    // Save log
    const log: AnswerLog = {
      question,
      selectedOptionIndex: optionIndex,
      isCorrect,
      timeSpentMs,
      pointsEarned: totalPts,
    };
    setAnswerLogs((prev) => [...prev, log]);

    // Show feedback interstitial
    setLastFeedback({
      isCorrect,
      question,
      selectedOptionIndex: optionIndex,
      pointsEarned: totalPts,
      basePoints: basePts,
      speedBonus: speedPts,
      streakBonus: streakPts,
      multiplierBonus: multiplierPts,
      newStreak,
    });
    setGamePhase('feedback');
  };

  // Advance to next question or show podium finish
  const handleNextQuestion = () => {
    setLastFeedback(null);
    const nextIdx = currentQuestionIndex + 1;

    if (nextIdx < gameQuestions.length) {
      setCurrentQuestionIndex(nextIdx);
      setGamePhase('playing');
    } else {
      // Game Over -> Save to persistent leaderboard
      finishGameAndSaveRecord();
    }
  };

  const finishGameAndSaveRecord = () => {
    const totalQ = answerLogs.length;
    const correctQ = answerLogs.filter((l) => l.isCorrect).length;
    const acc = totalQ > 0 ? Math.round((correctQ / totalQ) * 100) : 0;
    const maxS = Math.max(...answerLogs.map((_, i) => {
      let count = 0;
      for (let j = 0; j <= i; j++) {
        if (answerLogs[j].isCorrect) count++;
        else count = 0;
      }
      return count;
    }), 0);

    const record: LeaderboardRecord = {
      id: `record-${Date.now()}`,
      playerName: profile.name,
      avatar: profile.avatar,
      avatarBg: profile.avatarBg,
      score: score,
      accuracy: acc,
      correctAnswers: correctQ,
      totalQuestions: totalQ,
      maxStreak: maxS,
      categoryName: activeCategoryTitle,
      date: 'Baru Saja',
    };

    const updated = saveLeaderboardRecord(record);
    setLeaderboardRecords(updated);
    setGamePhase('podium');
  };

  const handleQuitGame = () => {
    setGamePhase('lobby');
  };

  const handleClearRecords = () => {
    clearStoredLeaderboard();
    setLeaderboardRecords([]);
  };

  const handleAddCustomQuestion = (q: Question) => {
    const updated = saveCustomQuestion(q);
    setCustomQuestions(updated);
  };

  const handleDeleteCustomQuestion = (id: string) => {
    const updated = deleteCustomQuestion(id);
    setCustomQuestions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onOpenLeaderboard={() => setShowLeaderboardModal(true)}
        onOpenCustomQuiz={() => setShowCustomQuizModal(true)}
        onGoHome={() => setGamePhase('lobby')}
        inGame={gamePhase === 'playing' || gamePhase === 'feedback'}
      />

      {/* Main Container */}
      <main className="flex-1">
        {gamePhase === 'lobby' && (
          <Lobby
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onStartGame={handleStartGame}
            customQuestionsCount={customQuestions.length}
            onOpenCustomQuiz={() => setShowCustomQuizModal(true)}
          />
        )}

        {gamePhase === 'playing' && gameQuestions[currentQuestionIndex] && (
          <QuizScreen
            currentQuestion={gameQuestions[currentQuestionIndex]}
            questionIndex={currentQuestionIndex}
            totalQuestions={gameQuestions.length}
            timePerQuestion={timePerQuestion}
            score={score}
            streak={streak}
            competitors={competitors}
            powerUps={powerUps}
            onUsePowerUp={handleUsePowerUp}
            onSelectAnswer={handleSelectAnswer}
            onQuitGame={handleQuitGame}
          />
        )}

        {gamePhase === 'feedback' && lastFeedback && (
          <AnswerFeedbackModal
            isCorrect={lastFeedback.isCorrect}
            question={lastFeedback.question}
            selectedOptionIndex={lastFeedback.selectedOptionIndex}
            pointsEarned={lastFeedback.pointsEarned}
            basePoints={lastFeedback.basePoints}
            speedBonus={lastFeedback.speedBonus}
            streakBonus={lastFeedback.streakBonus}
            multiplierBonus={lastFeedback.multiplierBonus}
            currentStreak={lastFeedback.newStreak}
            currentRank={currentRank}
            previousRank={previousRank}
            totalScore={score}
            onNextQuestion={handleNextQuestion}
            isLastQuestion={currentQuestionIndex >= gameQuestions.length - 1}
          />
        )}

        {gamePhase === 'podium' && (
          <PodiumScreen
            competitors={competitors}
            answerLogs={answerLogs}
            categoryTitle={activeCategoryTitle}
            onPlayAgain={() => {
              handleStartGame({
                category: 'all',
                questionCount: gameQuestions.length,
                timePerQuestion,
                opponentCount: competitors.filter((c) => !c.isHuman).length,
              });
            }}
            onGoHome={() => setGamePhase('lobby')}
            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
          />
        )}
      </main>

      {/* Leaderboard Modal */}
      {showLeaderboardModal && (
        <LeaderboardModal
          records={leaderboardRecords}
          onClose={() => setShowLeaderboardModal(false)}
          onClearRecords={handleClearRecords}
        />
      )}

      {/* Custom Quiz Creator Modal */}
      {showCustomQuizModal && (
        <CustomQuizModal
          customQuestions={customQuestions}
          onAddQuestion={handleAddCustomQuestion}
          onDeleteQuestion={handleDeleteCustomQuestion}
          onClose={() => setShowCustomQuizModal(false)}
          onPlayCustomQuiz={() => {
            setShowCustomQuizModal(false);
            handleStartGame({
              category: 'custom',
              questionCount: customQuestions.length,
              timePerQuestion: 15,
              opponentCount: 5,
            });
          }}
        />
      )}
    </div>
  );
}
