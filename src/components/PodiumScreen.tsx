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
  FileSpreadsheet,
  Download,
  Users,
  Check,
  Award,
  GraduationCap,
  Swords,
  Mountain,
  Flag,
} from 'lucide-react';
import { Competitor, AnswerLog, Question, GameMode } from '../types';
import { sound } from '../utils/audio';
import { exportQuizResultsToExcel } from '../utils/excelExport';
import { TugOfWarArena } from './TugOfWarArena';
import { MountainClimbArena } from './MountainClimbArena';

interface PodiumScreenProps {
  competitors: Competitor[];
  answerLogs: AnswerLog[];
  categoryTitle: string;
  gameQuestions?: Question[];
  timePerQuestion?: number;
  gameMode?: GameMode;
  humanTeam?: 'left' | 'right';
  onPlayAgain: () => void;
  onGoHome: () => void;
  onOpenLeaderboard: () => void;
}

export const PodiumScreen: React.FC<PodiumScreenProps> = ({
  competitors,
  answerLogs,
  categoryTitle,
  gameQuestions = [],
  timePerQuestion = 15,
  gameMode = 'classic',
  humanTeam = 'left',
  onPlayAgain,
  onGoHome,
  onOpenLeaderboard,
}) => {
  const [showReview, setShowReview] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [excelDownloaded, setExcelDownloaded] = useState<string | null>(null);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState<boolean>(false);

  // Sort competitors by score descending
  const ranked = [...competitors].sort((a, b) => b.score - a.score);
  const first = ranked[0];
  const second = ranked[1];
  const third = ranked[2];

  const humanPlayer = ranked.find((c) => c.isHuman) || ranked[0];
  const humanRank = ranked.findIndex((c) => c.isHuman) + 1;

  // Derive questions array if not directly passed
  const effectiveQuestions =
    gameQuestions.length > 0 ? gameQuestions : answerLogs.map((l) => l.question);

  // Human Stats calculation
  const totalQuestions = answerLogs.length;
  const correctCount = answerLogs.filter((log) => log.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const maxStreak = Math.max(
    ...answerLogs.map((_, i) => {
      let s = 0;
      for (let j = 0; j <= i; j++) {
        if (answerLogs[j].isCorrect) s++;
        else s = 0;
      }
      return s;
    }),
    0
  );

  // Classroom stats calculation across all students
  const totalClassStudents = ranked.length;
  const classAvgScorePts =
    totalClassStudents > 0
      ? Math.round(ranked.reduce((acc, c) => acc + c.score, 0) / totalClassStudents)
      : 0;

  // Approximate passing students based on accuracy
  const passingStudents = ranked.filter((c) => {
    if (c.isHuman) return accuracy >= 75;
    return (c.accuracyRate || 0.75) >= 0.75;
  }).length;
  const passingPercent =
    totalClassStudents > 0 ? Math.round((passingStudents / totalClassStudents) * 100) : 0;

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
    const text = `🏆 Saya meraih skor ${humanPlayer.score.toLocaleString(
      'id-ID'
    )} pts (Peringkat #${humanRank} dari ${
      ranked.length
    } siswa) dalam kuis "${categoryTitle}"! Bisa kalahkan skorku?`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
  };

  const handleExportExcel = () => {
    sound.playStreak();
    try {
      const fileName = exportQuizResultsToExcel({
        quizTitle: categoryTitle,
        competitors: ranked,
        questions: effectiveQuestions,
        humanAnswerLogs: answerLogs,
        timePerQuestion,
        gameMode: gameMode as GameMode,
      });
      setExcelDownloaded(fileName);
      setTimeout(() => setExcelDownloaded(null), 6000);
    } catch (err) {
      console.error('Failed to export excel:', err);
    }
  };

  // Limit displayed leaderboard rows if not expanded
  const displayedRanked = showAllLeaderboard ? ranked : ranked.slice(0, 10);

  // Mode Tug of War calculations
  const leftTeam = competitors.filter((c) => c.team === 'left');
  const rightTeam = competitors.filter((c) => c.team === 'right');
  const leftScore = leftTeam.reduce((acc, c) => acc + c.score, 0);
  const rightScore = rightTeam.reduce((acc, c) => acc + c.score, 0);
  const isLeftWinner = leftScore > rightScore;
  const isRightWinner = rightScore > leftScore;
  const isTie = leftScore === rightScore;
  const leftMVP = [...leftTeam].sort((a, b) => b.score - a.score)[0];
  const rightMVP = [...rightTeam].sort((a, b) => b.score - a.score)[0];

  // Mode Mountain Climb calculations
  const summitReachCount = competitors.filter(
    (c) => (c.altitudeMeters || 0) >= 3676 || (c.climbProgress || 0) >= 100
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
      {/* Top Banner / Celebration Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-4 py-1 text-xs font-extrabold text-amber-300 shadow">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin" />
          <span>Pertandingan Kuis Selesai!</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-['Outfit']">
          {gameMode === 'tug_of_war'
            ? 'Hasil Kemenangan Tarik Tambang'
            : gameMode === 'mountain_climb'
            ? 'Hasil Ekspedisi Puncak Gunung'
            : 'Podium Juara & Rekapitulasi Nilai'}
        </h1>
        <p className="text-sm sm:text-base text-slate-300">
          Paket Kuis:{' '}
          <span className="font-extrabold text-purple-300">{categoryTitle}</span>
          {gameMode === 'tug_of_war' && (
            <span className="ml-2 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-300 border border-rose-500/30">
              🪢 Mode Tarik Tambang
            </span>
          )}
          {gameMode === 'mountain_climb' && (
            <span className="ml-2 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-xs font-bold text-indigo-300 border border-indigo-500/30">
              🏔️ Mode Naik Gunung
            </span>
          )}
        </p>
      </motion.div>

      {/* Mode Tug-of-War Showcase Banner */}
      {gameMode === 'tug_of_war' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Victory Card */}
          <div
            className={`rounded-3xl border p-6 text-center shadow-2xl relative overflow-hidden ${
              isLeftWinner
                ? 'border-rose-500/50 bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-950 ring-1 ring-rose-500/30'
                : isRightWinner
                ? 'border-cyan-500/50 bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 ring-1 ring-cyan-500/30'
                : 'border-amber-500/50 bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950'
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-extrabold text-white mb-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>TIM JUARA TARIK TAMBANG KELAS</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit']">
              {isLeftWinner
                ? '🦅 TIM KIRI (GARUDA) JUARA TARIK TAMBANG!'
                : isRightWinner
                ? '🐅 TIM KANAN (HARIMAU) JUARA TARIK TAMBANG!'
                : '🤝 PERTANDINGAN BERAKHIR IMBANG!'}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {isLeftWinner
                ? `Tim Kiri mengungguli dengan total ${leftScore.toLocaleString('id-ID')} pts vs ${rightScore.toLocaleString('id-ID')} pts!`
                : isRightWinner
                ? `Tim Kanan mengungguli dengan total ${rightScore.toLocaleString('id-ID')} pts vs ${leftScore.toLocaleString('id-ID')} pts!`
                : `Kedua tim sama-sama tangguh dengan total ${leftScore.toLocaleString('id-ID')} poin!`}
            </p>

            {/* Team Score Comparison Pills */}
            <div className="grid grid-cols-2 gap-3 mt-4 max-w-lg mx-auto">
              <div
                className={`rounded-2xl border p-3 ${
                  isLeftWinner
                    ? 'border-rose-400 bg-rose-950/40 text-rose-100 shadow-md shadow-rose-950/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">🦅 Tim Kiri</span>
                  {isLeftWinner && (
                    <span className="text-[10px] font-black uppercase text-amber-300">
                      🏆 WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black mt-1">
                  {leftScore.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-semibold">pts</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {leftTeam.length} Murid
                  {leftMVP && ` • MVP: ${leftMVP.name}`}
                </div>
              </div>

              <div
                className={`rounded-2xl border p-3 ${
                  isRightWinner
                    ? 'border-cyan-400 bg-blue-950/40 text-cyan-100 shadow-md shadow-blue-950/40'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">🐅 Tim Kanan</span>
                  {isRightWinner && (
                    <span className="text-[10px] font-black uppercase text-amber-300">
                      🏆 WINNER
                    </span>
                  )}
                </div>
                <div className="text-2xl font-black mt-1">
                  {rightScore.toLocaleString('id-ID')}{' '}
                  <span className="text-xs font-semibold">pts</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {rightTeam.length} Murid
                  {rightMVP && ` • MVP: ${rightMVP.name}`}
                </div>
              </div>
            </div>
          </div>

          {/* Full Tug of War Arena Display */}
          <TugOfWarArena
            competitors={competitors}
            humanTeam={humanTeam}
            compact={false}
          />
        </motion.div>
      )}

      {/* Mode Mountain-Climb Showcase Banner */}
      {gameMode === 'mountain_climb' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="rounded-3xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-950 p-6 text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 px-4 py-1 text-xs font-extrabold text-indigo-300 mb-2">
              <Mountain className="h-4 w-4 text-indigo-300" />
              <span>EKSPEDISI PUNCAK MAHAMERU 3.676 MDPL</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white font-['Outfit']">
              🏔️ Pendakian Gunung Tuntas!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              {summitReachCount > 0
                ? `Selamat! Sebanyak ${summitReachCount} pendaki berhasil menancapkan bendera di puncak tertinggi!`
                : `Seluruh peserta berhasil menembus pos pendakian lereng Mahameru!`}
            </p>
          </div>

          {/* Full Mountain Climb Arena Display */}
          <MountainClimbArena
            competitors={competitors}
            compact={false}
          />
        </motion.div>
      )}

      {/* 3D Olympic-style Podium Visual (Top 3) */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 pt-12 pb-4">
        {/* 2nd Place */}
        {second && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center w-28 sm:w-36"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <div
                className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${second.avatarBg} text-3xl shadow-lg ring-4 ring-slate-400/30`}
              >
                {second.avatar}
              </div>
              <span className="mt-1 max-w-[110px] truncate text-xs sm:text-sm font-bold text-slate-200">
                {second.name}
              </span>
              <span className="text-[11px] font-semibold text-purple-400">
                {second.score.toLocaleString('id-ID')} pts
              </span>
              {second.isHuman && (
                <span className="rounded-full bg-purple-500/30 px-2 py-0.2 text-[9px] font-bold text-purple-200">
                  (Kamu)
                </span>
              )}
            </div>

            <div className="flex h-32 sm:h-36 w-full flex-col items-center justify-start rounded-t-3xl border-t-2 border-l-2 border-r-2 border-slate-400/40 bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 pt-3 shadow-2xl">
              <Medal className="h-7 w-7 text-slate-300 drop-shadow" />
              <span className="text-2xl sm:text-3xl font-black text-slate-200 font-['Outfit']">
                2
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Perak
              </span>
            </div>
          </motion.div>
        )}

        {/* 1st Place (Center Champion) */}
        {first && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center w-32 sm:w-44 z-10"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <div className="absolute -top-6 text-amber-400 animate-bounce">
                <Trophy className="h-7 w-7 fill-amber-400 drop-shadow-md" />
              </div>
              <div
                className={`flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-3xl ${first.avatarBg} text-4xl shadow-xl ring-4 ring-amber-400/50`}
              >
                {first.avatar}
              </div>
              <span className="mt-1 max-w-[130px] truncate text-sm sm:text-base font-extrabold text-white">
                {first.name}
              </span>
              <span className="text-xs sm:text-sm font-black text-amber-400">
                {first.score.toLocaleString('id-ID')} pts
              </span>
              {first.isHuman && (
                <span className="rounded-full bg-amber-500/30 px-2 py-0.2 text-[9px] font-bold text-amber-200">
                  (Kamu)
                </span>
              )}
            </div>

            <div className="flex h-44 sm:h-48 w-full flex-col items-center justify-start rounded-t-3xl border-t-2 border-l-2 border-r-2 border-amber-400/60 bg-gradient-to-b from-amber-500/30 via-slate-800 to-slate-950 pt-4 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-amber-400/5 pointer-events-none" />
              <Trophy className="h-9 w-9 text-amber-400 fill-amber-400 drop-shadow" />
              <span className="text-3xl sm:text-4xl font-black text-amber-300 font-['Outfit']">
                1
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                Emas
              </span>
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {third && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center w-28 sm:w-36"
          >
            <div className="relative mb-2 flex flex-col items-center">
              <div
                className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl ${third.avatarBg} text-3xl shadow-lg ring-4 ring-amber-700/40`}
              >
                {third.avatar}
              </div>
              <span className="mt-1 max-w-[110px] truncate text-xs sm:text-sm font-bold text-slate-200">
                {third.name}
              </span>
              <span className="text-[11px] font-semibold text-purple-400">
                {third.score.toLocaleString('id-ID')} pts
              </span>
              {third.isHuman && (
                <span className="rounded-full bg-purple-500/30 px-2 py-0.2 text-[9px] font-bold text-purple-200">
                  (Kamu)
                </span>
              )}
            </div>

            <div className="flex h-28 sm:h-32 w-full flex-col items-center justify-start rounded-t-3xl border-t-2 border-l-2 border-r-2 border-amber-800/40 bg-gradient-to-b from-amber-900/40 via-slate-800 to-slate-900 pt-3 shadow-2xl">
              <Medal className="h-6 w-6 text-amber-600 drop-shadow" />
              <span className="text-2xl sm:text-3xl font-black text-amber-500 font-['Outfit']">
                3
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Perunggu
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* TEACHER CLASSROOM ANALYTICS & EXCEL EXPORT CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-950 p-6 shadow-2xl space-y-5"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow">
                <FileSpreadsheet className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                Laporan Hasil Kuis Siswa (Format Excel Guru)
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-xl">
              Unduh rekap nilai lengkap seluruh {totalClassStudents} siswa dengan 3 lembar kerja: Rekap Nilai Siswa, Analisis Butir Soal, dan Matriks Jawaban.
            </p>
          </div>

          {/* Primary Excel Download Button */}
          <button
            id="btn-download-excel-report"
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 px-6 py-3.5 text-sm font-extrabold text-white shadow-xl shadow-emerald-600/30 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition flex-shrink-0"
          >
            <Download className="h-4 w-4 stroke-[2.5]" />
            <span>Download Laporan Excel (.xlsx)</span>
          </button>
        </div>

        {/* Download Success Confirmation Banner */}
        {excelDownloaded && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 p-3 text-xs text-emerald-200 font-bold"
          >
            <Check className="h-4 w-4 text-emerald-300 flex-shrink-0" />
            <span>
              File berhasil diunduh: <span className="underline">{excelDownloaded}</span>. Anda dapat langsung membukanya di Microsoft Excel atau Google Sheets!
            </span>
          </motion.div>
        )}

        {/* Classroom Summary Grid for Teachers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Total Peserta Didik
            </span>
            <div className="mt-1 text-xl font-black text-white font-['Outfit']">
              {totalClassStudents} Siswa
            </div>
            <span className="text-[10px] text-slate-400">Kelas Penuh</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Rata-rata Poin Kelas
            </span>
            <div className="mt-1 text-xl font-black text-purple-300 font-['Outfit']">
              {classAvgScorePts.toLocaleString('id-ID')}
            </div>
            <span className="text-[10px] text-slate-400">pts / siswa</span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Kelulusan KKM 75%
            </span>
            <div className="mt-1 text-xl font-black text-emerald-400 font-['Outfit']">
              {passingPercent}%
            </div>
            <span className="text-[10px] text-emerald-400/80">
              {passingStudents} dari {totalClassStudents} Tuntas
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Skor Puncak Kelas
            </span>
            <div className="mt-1 text-xl font-black text-amber-300 font-['Outfit']">
              {first ? first.score.toLocaleString('id-ID') : 0}
            </div>
            <span className="text-[10px] text-amber-300/80 truncate block">
              {first ? first.name : '-'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Human Player Individual Performance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md shadow-xl space-y-6"
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
                  Peringkat #{humanRank} dari {ranked.length} Siswa
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {humanRank === 1
                  ? '🏆 Luar biasa! Kamu berhasil menjadi juara pertama di kelas!'
                  : humanRank <= 3
                  ? '🥈 Keren sekali! Kamu sukses menempati podium juara!'
                  : 'Pertahankan prestasimu, kamu berada di posisi ' + humanRank + '!'}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
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
            <span className="text-[10px] text-slate-400">
              ({correctCount}/{totalQuestions} Soal Benar)
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

      {/* Full Match Leaderboard Table (All Class Students) */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-400" />
              Papan Peringkat Kelas ({ranked.length} Siswa)
            </h3>
            <span className="text-xs text-slate-400">
              Hasil urutan skor kompetisi kuis interaktif
            </span>
          </div>

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
          {displayedRanked.map((player, index) => {
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
                      {player.isHuman ? `${correctCount}/${totalQuestions} Benar` : 'Siswa Kelas'}
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

        {/* Toggle to view all 36+ students or collapse to Top 10 */}
        {ranked.length > 10 && (
          <button
            id="btn-toggle-all-ranks"
            onClick={() => {
              sound.playClick();
              setShowAllLeaderboard(!showAllLeaderboard);
            }}
            className="w-full text-center py-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {showAllLeaderboard
              ? 'Tampilkan 10 Teratas Saja'
              : `Tampilkan Seluruh ${ranked.length} Siswa Kelas ↓`}
          </button>
        )}
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
                      #{idx + 1}. {log.question.question}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 flex-shrink-0">
                    +{log.pointsEarned} pts
                  </span>
                </div>

                <div className="text-xs space-y-1 pl-7">
                  <p className="text-slate-300">
                    <span className="font-semibold text-slate-400">Jawabanmu: </span>
                    <span
                      className={
                        log.isCorrect
                          ? 'text-emerald-300 font-bold'
                          : 'text-rose-400 font-bold line-through'
                      }
                    >
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
