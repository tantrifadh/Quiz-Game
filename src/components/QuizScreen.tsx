import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  Flame,
  Trophy,
  Zap,
  Shield,
  Percent,
  ChevronRight,
  Sparkles,
  LogOut,
  Users,
  Swords,
  Mountain,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Question, Competitor, PowerUp, GameMode } from '../types';
import { sound } from '../utils/audio';
import { TugOfWarArena } from './TugOfWarArena';
import { MountainClimbArena } from './MountainClimbArena';

interface QuizScreenProps {
  currentQuestion: Question;
  questionIndex: number;
  totalQuestions: number;
  timePerQuestion: number;
  score: number;
  streak: number;
  competitors: Competitor[];
  powerUps: PowerUp[];
  gameMode?: GameMode;
  humanTeam?: 'left' | 'right';
  onUsePowerUp: (id: PowerUp['id']) => void;
  onSelectAnswer: (optionIndex: number | null, timeSpentMs: number) => void;
  onQuitGame: () => void;
}

const OPTION_STYLES = [
  {
    symbol: '▲',
    label: 'A',
    bg: 'from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600',
    border: 'border-rose-400/40',
    ring: 'focus:ring-rose-400',
    badgeBg: 'bg-rose-950/80 text-rose-200 border-rose-500/40',
  },
  {
    symbol: '◆',
    label: 'B',
    bg: 'from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600',
    border: 'border-cyan-400/40',
    ring: 'focus:ring-cyan-400',
    badgeBg: 'bg-blue-950/80 text-blue-200 border-cyan-500/40',
  },
  {
    symbol: '●',
    label: 'C',
    bg: 'from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500',
    border: 'border-amber-400/40',
    ring: 'focus:ring-amber-400',
    badgeBg: 'bg-amber-950/80 text-amber-200 border-amber-500/40',
  },
  {
    symbol: '■',
    label: 'D',
    bg: 'from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600',
    border: 'border-emerald-400/40',
    ring: 'focus:ring-emerald-400',
    badgeBg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40',
  },
];

export const QuizScreen: React.FC<QuizScreenProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  timePerQuestion,
  score,
  streak,
  competitors,
  powerUps,
  gameMode = 'classic',
  humanTeam = 'left',
  onUsePowerUp,
  onSelectAnswer,
  onQuitGame,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(timePerQuestion);
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [eliminatedIndices, setEliminatedIndices] = useState<number[]>([]);
  const [showLiveLeaderboard, setShowLiveLeaderboard] = useState<boolean>(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState<boolean>(false);
  const [showArenaWidget, setShowArenaWidget] = useState<boolean>(true);

  // Time calculation
  useEffect(() => {
    setTimeLeft(timePerQuestion);
    setAnswered(false);
    setSelectedIdx(null);
    setEliminatedIndices([]);
  }, [currentQuestion, timePerQuestion]);

  const handleTimeOut = useCallback(() => {
    if (answered) return;
    setAnswered(true);
    sound.playWrong();
    onSelectAnswer(null, timePerQuestion * 1000);
  }, [answered, onSelectAnswer, timePerQuestion]);

  // Main countdown timer
  useEffect(() => {
    if (answered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        if (next <= 4 && next > 0) {
          sound.playCountdownTick();
        }
        return next;
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [answered, timeLeft, handleTimeOut]);

  const handlePickOption = (index: number) => {
    if (answered || eliminatedIndices.includes(index)) return;
    setAnswered(true);
    setSelectedIdx(index);
    sound.playClick();
    const timeSpentMs = (timePerQuestion - timeLeft) * 1000;
    onSelectAnswer(index, timeSpentMs);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (answered) return;
      if (e.key === '1' || e.key === 'a' || e.key === 'A') handlePickOption(0);
      else if (e.key === '2' || e.key === 'b' || e.key === 'B') handlePickOption(1);
      else if (e.key === '3' || e.key === 'c' || e.key === 'C') handlePickOption(2);
      else if (e.key === '4' || e.key === 'd' || e.key === 'D') handlePickOption(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [answered, eliminatedIndices]);

  // Handle 50:50 power up locally for this question
  const applyFiftyFifty = () => {
    const wrongIndices = [0, 1, 2, 3].filter((idx) => idx !== currentQuestion.correctIndex);
    // Shuffle and pick 2 to eliminate
    const toEliminate = wrongIndices.sort(() => 0.5 - Math.random()).slice(0, 2);
    setEliminatedIndices(toEliminate);
  };

  const handlePowerUpClick = (pu: PowerUp) => {
    if (pu.count <= 0 || answered) return;
    sound.playPowerUp();
    if (pu.id === 'extraTime') {
      setTimeLeft((prev) => prev + 10);
    } else if (pu.id === 'fiftyFifty') {
      applyFiftyFifty();
    }
    onUsePowerUp(pu.id);
  };

  // Determine current player rank among competitors
  const sortedCompetitors = [...competitors].sort((a, b) => b.score - a.score);
  const playerRank = sortedCompetitors.findIndex((c) => c.isHuman) + 1;

  // Percentage for timer bar
  const timerPercentage = Math.max(0, Math.min(100, (timeLeft / timePerQuestion) * 100));
  const isTimeCritical = timeLeft <= 4;

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col justify-between px-4 py-6 sm:px-6">
      {/* Top HUD / Game Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          {/* Progress & Question Index */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-slate-200">
              <span className="text-purple-400">Soal</span>
              <span>
                {questionIndex + 1}/{totalQuestions}
              </span>
            </span>

            {/* Streak Multiplier */}
            {streak > 0 && (
              <div
                id="streak-counter-badge"
                key={streak}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition-all duration-300 ${
                  streak >= 3
                    ? 'border-amber-400 bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-rose-500/25 text-amber-200 animate-streak-active'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                }`}
              >
                <Flame
                  className={`h-4 w-4 ${
                    streak >= 3
                      ? 'fill-amber-400 text-orange-400 animate-bounce drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]'
                      : 'fill-amber-400 text-amber-400 animate-bounce'
                  }`}
                />
                <span>Streak {streak}x</span>
                {streak >= 3 && (
                  <span className="rounded-md border border-amber-400/40 bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-200">
                    ON FIRE!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Current Live Rank & Score */}
          <div className="flex items-center gap-2">
            {/* Game Mode Pill & Arena Toggle */}
            {gameMode !== 'classic' && (
              <button
                id="btn-toggle-arena-view"
                onClick={() => setShowArenaWidget(!showArenaWidget)}
                className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                  gameMode === 'tug_of_war'
                    ? 'border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25'
                    : 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25'
                }`}
                title={showArenaWidget ? 'Sembunyikan Arena Mode' : 'Tampilkan Arena Mode'}
              >
                <span>{gameMode === 'tug_of_war' ? '🪢' : '🏔️'}</span>
                <span className="hidden md:inline">
                  {gameMode === 'tug_of_war' ? 'Tarik Tambang' : 'Naik Gunung'}
                </span>
                {showArenaWidget ? (
                  <Eye className="h-3 w-3 opacity-60 ml-0.5" />
                ) : (
                  <EyeOff className="h-3 w-3 opacity-60 ml-0.5" />
                )}
              </button>
            )}

            <button
              id="btn-toggle-live-leaderboard"
              onClick={() => {
                sound.playClick();
                setShowLiveLeaderboard(!showLiveLeaderboard);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-xs font-bold text-purple-300 transition hover:bg-purple-500/25"
            >
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              <span>
                #{playerRank > 0 ? playerRank : 1}
              </span>
              <Users className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
            </button>

            <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-extrabold text-white">
              <Zap className="h-3.5 w-3.5 fill-purple-400 text-purple-400" />
              <span>{score.toLocaleString('id-ID')} pts</span>
            </div>

            <button
              id="btn-open-quit-modal"
              onClick={() => {
                sound.playClick();
                setShowQuitConfirm(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-rose-500/50 hover:bg-rose-500/10 hover:text-rose-300"
              title="Keluar dari Kuis"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Countdown Timer Bar */}
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-900 border border-slate-800">
          <motion.div
            className={`h-full transition-all duration-300 ${
              isTimeCritical
                ? 'bg-rose-500 shadow-lg shadow-rose-500/50'
                : timeLeft <= 7
                ? 'bg-amber-400 shadow-md shadow-amber-400/40'
                : 'bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400'
            }`}
            style={{ width: `${timerPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Waktu Tersisa:</span>
            <span
              className={`font-mono font-bold ${
                isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-slate-200'
              }`}
            >
              {timeLeft} detik
            </span>
          </div>
          <span className="text-[10px] text-slate-500 hidden sm:inline">
            Semakin cepat menjawab, semakin besar bonus poin!
          </span>
        </div>
      </div>

      {/* Mode Arena Widget (Tarik Tambang or Naik Gunung) */}
      {showArenaWidget && gameMode === 'tug_of_war' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <TugOfWarArena
            competitors={competitors}
            humanTeam={humanTeam}
            compact={true}
          />
        </motion.div>
      )}

      {showArenaWidget && gameMode === 'mountain_climb' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-2"
        >
          <MountainClimbArena
            competitors={competitors}
            compact={true}
          />
        </motion.div>
      )}

      {/* Center: Main Question Card */}
      <motion.div
        key={currentQuestion.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="my-auto py-4"
      >
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Category Pill */}
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-bold text-purple-300 border border-purple-500/30 uppercase tracking-wider">
              {currentQuestion.category.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Pilih 1 jawaban benar
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug font-['Outfit'] text-center">
            {currentQuestion.question}
          </h2>
        </div>
      </motion.div>

      {/* Answer Options Grid (Quizizz 4 Vibrant Cards) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {currentQuestion.options.map((option, idx) => {
            const style = OPTION_STYLES[idx % OPTION_STYLES.length];
            const isEliminated = eliminatedIndices.includes(idx);
            const isSelected = selectedIdx === idx;

            return (
              <motion.button
                key={idx}
                id={`btn-option-${idx}`}
                disabled={answered || isEliminated}
                whileHover={!answered && !isEliminated ? { scale: 1.015, y: -2 } : {}}
                whileTap={!answered && !isEliminated ? { scale: 0.98 } : {}}
                onClick={() => handlePickOption(idx)}
                className={`relative flex min-h-[4.5rem] items-center gap-4 rounded-2xl border p-4 text-left shadow-lg transition-all ${
                  isEliminated
                    ? 'opacity-20 cursor-not-allowed border-slate-800 bg-slate-900 line-through'
                    : isSelected
                    ? 'ring-4 ring-white border-white scale-[1.01]'
                    : ''
                } ${
                  isEliminated
                    ? ''
                    : `bg-gradient-to-r ${style.bg} ${style.border} text-white`
                }`}
              >
                {/* Shape / Key Badge */}
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl font-black text-base shadow border ${
                    isEliminated
                      ? 'bg-slate-800 text-slate-600 border-slate-700'
                      : style.badgeBg
                  }`}
                >
                  <span className="text-lg">{style.symbol}</span>
                </div>

                {/* Option Text */}
                <span className="flex-1 font-bold text-sm sm:text-base leading-tight">
                  {option}
                </span>

                {/* Keyboard hotkey hint */}
                <span className="hidden sm:inline-block rounded-md bg-black/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white/70">
                  {idx + 1}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Power-Ups Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>Gunakan Power-Up:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {powerUps.map((pu) => {
                const isAvailable = pu.count > 0 && !answered;
                return (
                  <button
                    key={pu.id}
                    id={`btn-powerup-${pu.id}`}
                    disabled={!isAvailable}
                    onClick={() => handlePowerUpClick(pu)}
                    className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
                      isAvailable
                        ? 'border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/30 hover:border-purple-500 active:scale-95'
                        : 'opacity-40 border-slate-800 bg-slate-950 text-slate-500 cursor-not-allowed'
                    }`}
                    title={pu.description}
                  >
                    <span>{pu.icon}</span>
                    <span className="hidden sm:inline">{pu.name}</span>
                    <span className="rounded-full bg-slate-950 px-1.5 py-0.2 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                      {pu.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Live Leaderboard Slide-in Drawer */}
      {showLiveLeaderboard && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm">
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="w-full max-w-sm border-l border-slate-800 bg-slate-900 p-6 shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <h3 className="font-extrabold text-base text-white">
                    Papan Skor Live
                  </h3>
                </div>
                <button
                  id="btn-close-live-leaderboard"
                  onClick={() => setShowLiveLeaderboard(false)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Posisi diperbarui live setelah setiap jawaban:
              </p>

              <div className="space-y-2">
                {sortedCompetitors.map((c, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center justify-between rounded-xl border p-2.5 transition ${
                        c.isHuman
                          ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500 shadow-md shadow-purple-500/20'
                          : 'border-slate-800 bg-slate-950'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-black text-xs w-5 text-center ${
                            rank === 1
                              ? 'text-amber-400'
                              : rank === 2
                              ? 'text-slate-300'
                              : rank === 3
                              ? 'text-amber-600'
                              : 'text-slate-500'
                          }`}
                        >
                          #{rank}
                        </span>
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${c.avatarBg} text-base shadow`}
                        >
                          {c.avatar}
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate text-xs font-bold text-white">
                            {c.name} {c.isHuman && '(Kamu)'}
                          </span>
                          {c.streak > 1 && (
                            <span className="text-[10px] font-semibold text-amber-400">
                              🔥 {c.streak}x streak
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono text-xs font-extrabold text-purple-300">
                        {c.score.toLocaleString('id-ID')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              id="btn-close-leaderboard-drawer"
              onClick={() => setShowLiveLeaderboard(false)}
              className="mt-6 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Tutup & Lanjutkan Kuis
            </button>
          </motion.div>
        </div>
      )}

      {/* Quit Game Confirmation Modal */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-extrabold text-lg text-white">
              Keluar dari Kuis?
            </h3>
            <p className="text-xs text-slate-300">
              Progres pertanyaan saat ini akan dihentikan dan skor tidak akan tercatat di papan peringkat abadi.
            </p>
            <div className="flex gap-2.5 pt-2">
              <button
                id="btn-cancel-quit"
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                Tetap Main
              </button>
              <button
                id="btn-confirm-quit"
                onClick={() => {
                  setShowQuitConfirm(false);
                  onQuitGame();
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
              >
                Ya, Keluar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
