import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { Competitor, AnswerLog } from '../types';
import { sound } from '../utils/audio';

interface PodiumScreenProps {
  competitors: Competitor[];
  answerLogs: AnswerLog[];
  categoryTitle: string;
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const PodiumScreen: React.FC<PodiumScreenProps> = ({
  competitors,
  answerLogs,
  categoryTitle,
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard,
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // Sort competitors by score descending
  const ranked = [...competitors].sort((a, b) => b.score - a.score);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  const humanPlayer = ranked.find((c) => c.isHuman) || ranked[0];
  const humanRank = ranked.findIndex((c) => c.isHuman) + 1;

  // Stats calculation
  const totalQuestions = answerLogs.length;
  const correctCount = answerLogs.filter((log) => log.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const maxStreak = Math.max(...answerLogs.map((_, i) => {
    let s = 0;
    for (let j = 0; j <= i; j++) {
      if (answerLogs[j].isCorrect) s++;
      else s = 0;
    }
    return s;
  }), 0);

  // Trigger celebration on mount
  useEffect(() => {
    sound.playPodiumFanfare();

    // Fire confetti bursts
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#eab308', '#38bdf8'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#a855f7', '#ec4899', '#eab308', '#38bdf8'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const handleShareScore = () => {
    sound.playClick();
    const text = `🏆 Saya meraih Juara #${humanRank} dengan skor ${humanPlayer.score.toLocaleString('id-ID')} pts (Akurasi ${accuracy}%) di Kuis Quizizz Arena topik ${categoryTitle}!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Title Banner */}
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-300"
        >
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>Pertandingan Selesai!</span>
        </motion.div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-['Outfit']">
          Panggung Kejuaraan Podium
        </h1>
        <p className="text-sm text-slate-300">
          Kategori: <span className="font-semibold text-purple-300">{categoryTitle}</span>
        </p>
      </div>

      {/* The 3-Step Olympic Podium */}
      <div className="relative pt-8 pb-4">
        <div className="flex items-end justify-center gap-3 sm:gap-6 max-w-xl mx-auto">
          {/* 2nd Place (Silver) */}
          {second && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-2 flex flex-col items-center">
                <div
                  className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${second.avatarBg} text-3xl shadow-lg ring-4 ring-slate-400/30`}
                >
                  {second.avatar}
                </div>
                <span className="mt-1 max-w-[90px] truncate text-center text-xs font-bold text-white">
                  {second.name} {second.isHuman && '(Kamu)'}
                </span>
                <span className="font-mono text-xs font-extrabold text-slate-300">
                  {second.score.toLocaleString('id-ID')} pts
                </span>
              </div>
              {/* Podium Block */}
              <div className="w-full h-28 sm:h-36 rounded-t-2xl border-t-2 border-x-2 border-slate-400/40 bg-gradient-to-b from-slate-700 to-slate-900 flex flex-col items-center justify-start pt-3 shadow-xl">
                <span className="text-2xl sm:text-3xl font-black text-slate-300 font-['Outfit']">
                  2
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Silver
                </span>
              </div>
            </motion.div>
          )}

          {/* 1st Place (Gold) - Elevated */}
          {first && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex-1 flex flex-col items-center z-10"
            >
              <div className="relative mb-2 flex flex-col items-center">
                <div className="absolute -top-6 animate-bounce">
                  <span className="text-2xl">👑</span>
                </div>
                <div
                  className={`flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-2xl ${first.avatarBg} text-4xl shadow-xl ring-4 ring-amber-400/60 shadow-amber-500/20`}
                >
                  {first.avatar}
                </div>
                <span className="mt-1.5 max-w-[110px] truncate text-center text-sm font-extrabold text-amber-300">
                  {first.name} {first.isHuman && '(Kamu)'}
                </span>
                <span className="font-mono text-xs sm:text-sm font-black text-amber-400">
                  {first.score.toLocaleString('id-ID')} pts
                </span>
              </div>
              {/* Podium Block */}
              <div className="w-full h-36 sm:h-48 rounded-t-2xl border-t-2 border-x-2 border-amber-400/50 bg-gradient-to-b from-amber-600/80 via-yellow-700/60 to-slate-900 flex flex-col items-center justify-start pt-3 shadow-2xl shadow-amber-500/10">
                <span className="text-3xl sm:text-4xl font-black text-amber-200 font-['Outfit']">
                  1
                </span>
                <span className="text-[11px] uppercase font-black tracking-wider text-amber-300">
                  Juara 1
                </span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place (Bronze) */}
          {third && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-2 flex flex-col items-center">
                <div
                  className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${third.avatarBg} text-3xl shadow-lg ring-4 ring-amber-700/30`}
                >
                  {third.avatar}
                </div>
                <span className="mt-1 max-w-[90px] truncate text-center text-xs font-bold text-white">
                  {third.name} {third.isHuman && '(Kamu)'}
                </span>
                <span className="font-mono text-xs font-extrabold text-amber-600">
                  {third.score.toLocaleString('id-ID')} pts
                </span>
              </div>
              {/* Podium Block */}
              <div className="w-full h-24 sm:h-28 rounded-t-2xl border-t-2 border-x-2 border-amber-700/40 bg-gradient-to-b from-amber-900/60 to-slate-900 flex flex-col items-center justify-start pt-3 shadow-xl">
                <span className="text-2xl sm:text-3xl font-black text-amber-600 font-['Outfit']">
                  3
                </span>
                <span className="text-[10px] uppercase font-bold text-amber-600">
                  Bronze
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Human Player Performance Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/90 to-indigo-950/40 p-6 backdrop-blur-md shadow-xl"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${humanPlayer.avatarBg} text-2xl shadow`}
            >
              {humanPlayer.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{humanPlayer.name}</h3>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-extrabold text-purple-300 border border-purple-500/30">
                  Peringkat #{humanRank} dari {ranked.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {humanRank === 1
                  ? '🏆 Luar biasa! Kamu berhasil menjadi juara pertama!'
                  : humanRank <= 3
                  ? '🥈 Keren sekali! Kamu sukses naik ke atas podium!'
                  : 'Tetap semangat, asah lagi kemampuanmu untuk merebut podium!'}
              </p>
            </div>
          </div>

          <button
            id="btn-share-score"
            onClick={handleShareScore}
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 hover:border-purple-500 hover:text-white transition"
          >
            <Share2 className="h-4 w-4 text-purple-400" />
            <span>{copiedToast ? 'Tersalin ke Clipboard! ✓' : 'Bagikan Skor'}</span>
          </button>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Total Skor</span>
            <div className="mt-1 text-xl sm:text-2xl font-black text-purple-300 font-['Outfit']">
              {humanPlayer.score.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Akurasi Jawaban</span>
            <div className="mt-1 text-xl sm:text-2xl font-black text-emerald-400 font-['Outfit']">
              {accuracy}%
            </div>
            <span className="text-[10px] text-slate-500">
              ({correctCount}/{totalQuestions} Soal)
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Rekor Streak</span>
            <div className="mt-1 flex items-center justify-center gap-1 text-xl sm:text-2xl font-black text-amber-400 font-['Outfit']">
              <Flame className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span>{maxStreak}x</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3.5 text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Peringkat Akhir</span>
            <div className="mt-1 text-xl sm:text-2xl font-black text-amber-300 font-['Outfit']">
              #{humanRank}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Full Match Leaderboard Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" />
            Klasemen Akhir Pertandingan Ini
          </h3>
          <button
            id="btn-view-all-time"
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 transition"
          >
            Lihat Rekor Abadi &rarr;
          </button>
        </div>

        <div className="space-y-2">
          {ranked.map((player, index) => {
            const rank = index + 1;
            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-2xl border p-3 transition ${
                  player.isHuman
                    ? 'border-purple-500 bg-purple-500/20 ring-1 ring-purple-500 shadow-md shadow-purple-500/20'
                    : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg font-black text-xs ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 shadow'
                        : rank === 3
                        ? 'bg-amber-700 text-white shadow'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{rank}
                  </div>
                  <div
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${player.avatarBg} text-lg shadow`}
                  >
                    {player.avatar}
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">
                      {player.name} {player.isHuman && '(Kamu)'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {player.isHuman ? `${correctCount}/${totalQuestions} Benar` : 'Simulasi Peserta'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-sm sm:text-base font-black text-purple-300">
                    {player.score.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-slate-400">POIN</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Answers Accordion */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl space-y-4">
        <button
          id="btn-toggle-review"
          onClick={() => {
            sound.playClick();
            setShowReview(!showReview);
          }}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span className="font-extrabold text-base text-white">
              Tinjau Pembahasan Soal ({correctCount}/{totalQuestions} Benar)
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-purple-400">
            <span>{showReview ? 'Sembunyikan' : 'Buka Rincian'}</span>
            {showReview ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showReview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-3 pt-2"
          >
            {answerLogs.map((log, idx) => (
              <div
                key={idx}
                className={`rounded-2xl border p-4 space-y-2 ${
                  log.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-950/20'
                    : 'border-rose-500/30 bg-rose-950/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {log.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-5 w-5 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-bold text-sm text-white">
                      Soal #{idx + 1}: {log.question.question}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400 flex-shrink-0">
                    +{log.pointsEarned} pts
                  </span>
                </div>

                <div className="text-xs space-y-1 pl-7">
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-400">Jawabanmu: </span>
                    <span className={log.isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-400 font-bold line-through'}>
                      {log.selectedOptionIndex !== null
                        ? log.question.options[log.selectedOptionIndex]
                        : 'Waktu Habis (Tidak menjawab)'}
                    </span>
                  </p>
                  {!log.isCorrect && (
                    <p className="text-slate-300">
                      <span className="font-semibold text-slate-400">Kunci Benar: </span>
                      <span className="text-emerald-400 font-bold">
                        {log.question.options[log.question.correctIndex]}
                      </span>
                    </p>
                  )}
                  {log.question.explanation && (
                    <p className="text-slate-400 italic pt-1">
                      💡 {log.question.explanation}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          id="btn-play-again"
          onClick={() => {
            sound.playClick();
            onPlayAgain();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-purple-600/30 hover:opacity-95 transition"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Main Lagi Sekarang</span>
        </button>

        <button
          id="btn-go-lobby"
          onClick={() => {
            sound.playClick();
            onGoHome();
          }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:text-white transition"
        >
          <Home className="h-4 w-4" />
          <span>Kembali ke Menu Utama</span>
        </button>
      </div>
    </div>
  );
};
