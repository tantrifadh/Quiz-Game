import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Question } from '../types';
import { sound } from '../utils/audio';

interface AnswerFeedbackModalProps {
  isCorrect: boolean;
  question: Question;
  selectedOptionIndex: number | null;
  pointsEarned: number;
  basePoints: number;
  speedBonus: number;
  streakBonus: number;
  multiplierBonus: number;
  currentStreak: number;
  currentRank: number;
  previousRank: number;
  totalScore: number;
  onNextQuestion: () => void;
  isLastQuestion: boolean;
}

export const AnswerFeedbackModal: React.FC<AnswerFeedbackModalProps> = ({
  isCorrect,
  question,
  selectedOptionIndex,
  pointsEarned,
  basePoints,
  speedBonus,
  streakBonus,
  multiplierBonus,
  currentStreak,
  currentRank,
  previousRank,
  totalScore,
  onNextQuestion,
  isLastQuestion,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onNextQuestion]);

  const rankDiff = previousRank - currentRank; // positive means moved up (e.g. from 4 to 2 => +2)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className={`w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl ${
          isCorrect
            ? 'border-emerald-500/50 bg-gradient-to-b from-emerald-950/90 via-slate-900 to-slate-950 shadow-emerald-500/20'
            : 'border-rose-500/50 bg-gradient-to-b from-rose-950/90 via-slate-900 to-slate-950 shadow-rose-500/20'
        }`}
      >
        {/* Header Ribbon */}
        <div
          className={`py-5 px-6 text-center ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600'
              : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {isCorrect ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-white animate-bounce" />
                <h2 className="text-2xl font-black text-white tracking-wide font-['Outfit']">
                  BENAR SEKALI! 🎉
                </h2>
              </>
            ) : (
              <>
                <XCircle className="h-8 w-8 text-white animate-pulse" />
                <h2 className="text-2xl font-black text-white tracking-wide font-['Outfit']">
                  {selectedOptionIndex === null ? 'WAKTU HABIS! ⏱️' : 'KURANG TEPAT! ❌'}
                </h2>
              </>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Points Breakdown if Correct */}
          {isCorrect ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-3"
            >
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-['Outfit']">
                  +{pointsEarned.toLocaleString('id-ID')}
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase">PTS</span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-emerald-500/20 pt-2 text-[11px] text-slate-300">
                <div>
                  <span className="block text-slate-400">Poin Dasar</span>
                  <span className="font-bold text-white">+{basePoints}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Bonus Kecepatan</span>
                  <span className="font-bold text-amber-300">+{speedBonus}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Streak Bonus</span>
                  <span className="font-bold text-purple-300">+{streakBonus + multiplierBonus}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
                <span>Jawaban yang Benar:</span>
                <span className="font-bold uppercase tracking-wider">Kunci Jawaban</span>
              </div>
              <p className="font-bold text-white text-sm bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                ✓ {question.options[question.correctIndex]}
              </p>
              {question.explanation && (
                <p className="text-xs text-slate-300 italic pt-1 leading-relaxed">
                  💡 {question.explanation}
                </p>
              )}
            </div>
          )}

          {/* Live Leaderboard Movement */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Posisi Saat Ini:</span>
              <span className="font-extrabold text-base text-amber-400">
                Peringkat #{currentRank}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold">
              {rankDiff > 0 ? (
                <span className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-2 py-1 text-emerald-400 border border-emerald-500/30">
                  <ArrowUp className="h-3.5 w-3.5" />
                  Naik {rankDiff}
                </span>
              ) : rankDiff < 0 ? (
                <span className="flex items-center gap-1 rounded-lg bg-rose-500/20 px-2 py-1 text-rose-400 border border-rose-500/30">
                  <ArrowDown className="h-3.5 w-3.5" />
                  Turun {Math.abs(rankDiff)}
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-slate-400">
                  <Minus className="h-3.5 w-3.5" />
                  Tetap
                </span>
              )}
            </div>
          </div>

          {/* Streak Indicator */}
          {currentStreak > 1 && (
            <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/30 py-2 text-xs font-bold text-amber-300">
              <Flame className="h-4 w-4 fill-amber-400 text-amber-400 animate-bounce" />
              <span>Streak Beruntun: {currentStreak}x berturut-turut! 🔥</span>
            </div>
          )}

          {/* Action Button */}
          <button
            id="btn-next-question-immediate"
            onClick={() => {
              sound.playClick();
              onNextQuestion();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition active:scale-98"
          >
            <span>{isLastQuestion ? 'Lihat Podium & Hasil' : 'Soal Berikutnya'}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs font-normal text-purple-200">
              ({secondsRemaining}s)
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
