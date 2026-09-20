import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import {
  Play,
  Users,
  Clock,
  Sparkle,
  QrCode,
  Copy,
  Check,
  PlusCircle,
  BookOpen,
  Maximize2,
  Trash2,
  GraduationCap,
  Compass,
  Atom,
  ChevronDown,
  ChevronUp,
  FolderPlus,
  FileQuestion,
  Sparkles,
  Swords,
  Mountain,
  Trophy,
} from 'lucide-react';
import {
  PlayerProfile,
  Question,
  QuizPackage,
  GameMode,
} from '../types';
import { AVATAR_OPTIONS } from '../data/quizData';
import { BUILTIN_QUIZ_PACKAGES } from '../data/quizPackages';
import { sound } from '../utils/audio';
import { JoinQrModal } from './JoinQrModal';

interface LobbyProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onStartGame: (config: {
    category: string;
    questionCount: number;
    timePerQuestion: number;
    opponentCount: number;
    selectedQuestions: Question[];
    quizTitle: string;
    gameMode: GameMode;
    humanTeam?: 'left' | 'right';
  }) => void;
  customQuestions: Question[];
  onOpenCustomQuiz: () => void;
  onDeleteCustomQuestion?: (id: string) => void;
  onAddCustomQuestion?: (q: Question) => void;
}

export const Lobby: React.FC<LobbyProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  customQuestions,
  onOpenCustomQuiz,
  onDeleteCustomQuestion,
  onAddCustomQuestion,
}) => {
  // Player state
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [selectedBg, setSelectedBg] = useState(profile.avatarBg);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Active Quiz Selection State (Default: Custom or Builtin)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('cerdas-cermat');
  const [showQuestionBankPreview, setShowQuestionBankPreview] = useState<boolean>(false);

  // Match Configuration State
  // Default Opponent Count is 36 (Standar Kelas Indonesia)
  const [opponentCount, setOpponentCount] = useState<number>(36);
  const [customOpponentInput, setCustomOpponentInput] = useState<number>(36);
  const [isCustomOpponentActive, setIsCustomOpponentActive] = useState<boolean>(false);

  // Timer Configuration State (Default 15s)
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [customTimeInput, setCustomTimeInput] = useState<number>(15);
  const [isCustomTimeActive, setIsCustomTimeActive] = useState<boolean>(false);

  // Game Mode Selection State (Default: Tarik Tambang as requested)
  const [gameMode, setGameMode] = useState<GameMode>('tug_of_war');
  const [humanTeam, setHumanTeam] = useState<'left' | 'right'>('left');

  // Question Count
  const [questionCount, setQuestionCount] = useState<number>(10);

  // QR Code & Classroom Join State
  const [gamePin, setGamePin] = useState<string>('482915');
  const [lobbyQrUrl, setLobbyQrUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showFullQrModal, setShowFullQrModal] = useState<boolean>(false);

  // Initialize randomized or persistent 6-digit Game PIN and QR Code
  useEffect(() => {
    // Generate stable 6-digit PIN for session
    const randomPin = Math.floor(100000 + Math.random() * 900000).toString();
    setGamePin(randomPin);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kuis-kelas.app';
    const joinLink = `${origin}/#join=${randomPin}`;

    QRCode.toDataURL(
      joinLink,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setLobbyQrUrl(url);
        }
      }
    );
  }, []);

  // Compute Active Question Set based on selected Package
  const currentPackage =
    selectedPackageId === 'custom-my'
      ? {
          id: 'custom-my',
          title: 'Kuis Kustom Saya / Bank Soal Guru',
          description: 'Koleksi soal kustom yang dibuat dan dikelola langsung oleh guru.',
          icon: 'BookOpen',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
          questions: customQuestions,
        }
      : BUILTIN_QUIZ_PACKAGES.find((p) => p.id === selectedPackageId) || BUILTIN_QUIZ_PACKAGES[0];

  const availableQuestions =
    selectedPackageId === 'custom-my' ? customQuestions : currentPackage.questions;

  // Sync question count slider/preset when package changes
  useEffect(() => {
    if (availableQuestions.length > 0) {
      setQuestionCount((prev) => Math.min(prev, availableQuestions.length) || availableQuestions.length);
    }
  }, [availableQuestions.length]);

  const handleNameChange = (val: string) => {
    setName(val);
    onUpdateProfile({
      name: val.trim() || 'Pemain Kuis',
      avatar: selectedAvatar,
      avatarBg: selectedBg,
    });
  };

  const selectAvatar = (avatar: string, bg: string) => {
    sound.playClick();
    setSelectedAvatar(avatar);
    setSelectedBg(bg);
    onUpdateProfile({
      name: name.trim() || 'Pemain Kuis',
      avatar,
      avatarBg: bg,
    });
    setShowAvatarModal(false);
  };

  const handleCopyLobbyLink = () => {
    sound.playClick();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kuis-kelas.app';
    const joinLink = `${origin}/#join=${gamePin}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleStart = () => {
    if (availableQuestions.length === 0) {
      sound.playWrong();
      onOpenCustomQuiz();
      return;
    }

    sound.playStreak();
    onStartGame({
      category: selectedPackageId,
      questionCount: Math.min(questionCount, availableQuestions.length),
      timePerQuestion,
      opponentCount,
      selectedQuestions: availableQuestions,
      quizTitle: currentPackage.title,
      gameMode,
      humanTeam,
    });
  };

  // Copy sample questions to user's custom quiz bank
  const handleCloneToCustom = (pkg: QuizPackage) => {
    sound.playClick();
    if (onAddCustomQuestion) {
      pkg.questions.forEach((q) => {
        onAddCustomQuestion({
          ...q,
          id: `custom-clone-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          category: 'custom',
        });
      });
      setSelectedPackageId('custom-my');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Banner / Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-slate-900/95 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative"
      >
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300">
              <Sparkle className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
              <span>Platform Kuis Interaktif Kelas & Papan Skor Live</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit']">
              Arena Kuis Kelas &{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                Leaderboard Siswa
              </span>
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-300">
              Atur kuis kustom, bagikan QR code ke proyektor kelas, mainkan simulasi hingga 36+ siswa, dan dapatkan laporan analisis lengkap di Excel!
            </p>
          </div>

          {/* Player Profile Quick Card */}
          <div className="w-full md:w-auto flex-shrink-0 flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl">
            <button
              id="btn-choose-avatar"
              onClick={() => {
                sound.playClick();
                setShowAvatarModal(true);
              }}
              className={`relative flex h-16 w-16 items-center justify-center rounded-2xl ${selectedBg} text-3xl shadow-lg ring-4 ring-purple-500/20 hover:scale-105 transition active:scale-95`}
              title="Klik untuk ganti avatar"
            >
              <span>{selectedAvatar}</span>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-950 px-1.5 py-0.5 text-[9px] font-bold text-slate-300 border border-slate-700">
                Ganti
              </span>
            </button>

            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nama Siswa / Guru
              </label>
              <input
                id="input-player-name"
                type="text"
                maxLength={18}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Masukkan nama..."
                className="w-44 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Classroom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: AREA CUSTOM KUIS (Replaced Category Selection) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header of Custom Quiz Area */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  <h2 className="text-xl font-black text-white font-['Outfit']">
                    Area Custom Kuis & Bank Soal Kelas
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Pilih paket kuis yang ingin digunakan, kelola butir soal, atau buat soal baru untuk kelas.
                </p>
              </div>

              {/* Button to Create New Custom Question */}
              <button
                id="btn-open-add-custom"
                onClick={() => {
                  sound.playClick();
                  onOpenCustomQuiz();
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-pink-600/20 hover:opacity-95 transition flex-shrink-0"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Buat Soal Kuis Baru</span>
              </button>
            </div>

            {/* Quiz Packages Selection Grid */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Pilih Paket Kuis Aktif:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Custom Questions Created by User */}
                <motion.div
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedPackageId('custom-my');
                  }}
                  className={`cursor-pointer rounded-2xl border p-4 transition text-left flex flex-col justify-between ${
                    selectedPackageId === 'custom-my'
                      ? 'border-pink-500 bg-pink-500/15 ring-2 ring-pink-500/40 shadow-lg shadow-pink-500/10'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                      <FolderPlus className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white text-sm">
                          Kuis Kustom Saya
                        </span>
                        <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                          {customQuestions.length} Soal
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                        {customQuestions.length > 0
                          ? 'Kumpulan soal buatanmu yang tersimpan di memori kuis.'
                          : 'Belum ada soal kustom. Klik tombol "+ Buat Soal Kuis Baru" di atas!'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <span className="text-slate-400 font-semibold">
                      {selectedPackageId === 'custom-my' ? '✓ Sedang Dipilih' : 'Klik untuk pilih'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sound.playClick();
                        onOpenCustomQuiz();
                      }}
                      className="text-pink-400 font-bold hover:underline"
                    >
                      Kelola Soal →
                    </button>
                  </div>
                </motion.div>

                {/* 2. Built-in Classroom Assessment Packages */}
                {BUILTIN_QUIZ_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <motion.div
                      key={pkg.id}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      onClick={() => {
                        sound.playClick();
                        setSelectedPackageId(pkg.id);
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${pkg.badgeColor} border`}
                        >
                          {pkg.id === 'cerdas-cermat' ? (
                            <GraduationCap className="h-5 w-5" />
                          ) : pkg.id === 'wawasan-nusantara' ? (
                            <Compass className="h-5 w-5" />
                          ) : (
                            <Atom className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-white text-sm">
                              {pkg.title}
                            </span>
                            <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                              {pkg.questions.length} Soal
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                            {pkg.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                        <span className="text-slate-400 font-semibold">
                          {isSelected ? '✓ Sedang Dipilih' : 'Klik untuk pilih'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneToCustom(pkg);
                          }}
                          className="text-purple-400 font-bold hover:underline"
                          title="Gandakan paket ini ke Kuis Kustom untuk diedit"
                        >
                          Salin ke Kustom 📋
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Active Quiz Preview & Question Inspector */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <FileQuestion className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">
                    Paket Terpilih:{' '}
                    <span className="text-purple-300">{currentPackage.title}</span>
                  </span>
                  <span className="rounded-md bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold text-purple-300 border border-purple-500/30">
                    {availableQuestions.length} Butir Soal Tersedia
                  </span>
                </div>

                <button
                  id="btn-toggle-preview-questions"
                  onClick={() => {
                    sound.playClick();
                    setShowQuestionBankPreview(!showQuestionBankPreview);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white transition"
                >
                  <span>{showQuestionBankPreview ? 'Tutup Pratinjau' : 'Lihat Butir Soal'}</span>
                  {showQuestionBankPreview ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Question list accordion preview */}
              <AnimatePresence>
                {showQuestionBankPreview && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2 pt-2 border-t border-slate-800"
                  >
                    {availableQuestions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">
                        Belum ada soal pada paket ini. Buat soal baru dengan tombol di atas!
                      </p>
                    ) : (
                      availableQuestions.map((q, qIndex) => (
                        <div
                          key={q.id || qIndex}
                          className="rounded-xl border border-slate-800/80 bg-slate-900/70 p-3 text-xs space-y-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-200">
                              #{qIndex + 1}. {q.question}
                            </span>
                            {selectedPackageId === 'custom-my' && onDeleteCustomQuestion && (
                              <button
                                onClick={() => {
                                  sound.playClick();
                                  onDeleteCustomQuestion(q.id);
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1 transition flex-shrink-0"
                                title="Hapus soal"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            {q.options.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`rounded-lg px-2 py-1 border ${
                                  oIdx === q.correctIndex
                                    ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold'
                                    : 'border-slate-800 bg-slate-950 text-slate-400'
                                }`}
                              >
                                {oIdx === q.correctIndex && '✓ '}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* QR CODE DISPLAY BEFORE QUIZ STARTS (Classroom Joining Area) */}
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-purple-900/20 p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <QrCode className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Kode QR & PIN Kuis Siswa
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tampilkan di depan kelas agar siswa dapat memindai dari ponsel mereka
                  </p>
                </div>
              </div>

              {/* Fullscreen Projector Mode Button */}
              <button
                id="btn-open-projector-mode"
                onClick={() => {
                  sound.playClick();
                  setShowFullQrModal(true);
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/30 px-3.5 py-2 text-xs font-bold text-purple-200 hover:bg-purple-600/50 transition"
              >
                <Maximize2 className="h-4 w-4 text-purple-300" />
                <span>Mode Proyektor Layar Penuh</span>
              </button>
            </div>

            {/* QR Code and Instructions Widget */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
              {/* QR Image */}
              <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-white p-3 shadow-xl">
                {lobbyQrUrl ? (
                  <img
                    src={lobbyQrUrl}
                    alt="QR Code Kuis"
                    className="h-32 w-32 object-contain"
                  />
                ) : (
                  <div className="h-32 w-32 flex items-center justify-center bg-slate-100 text-slate-500 text-[10px]">
                    Memuat QR...
                  </div>
                )}
                <span className="mt-1 text-[10px] font-bold text-slate-900">
                  Pindai Kamera HP
                </span>
              </div>

              {/* Game PIN & Join Details */}
              <div className="space-y-2.5 flex-1 w-full text-center sm:text-left">
                <div>
                  <span className="text-[11px] uppercase font-bold tracking-wider text-amber-300">
                    Game PIN Masuk Kuis:
                  </span>
                  <div className="font-mono text-3xl font-black tracking-widest text-amber-400 font-['Outfit']">
                    {gamePin.slice(0, 3)} {gamePin.slice(3)}
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  Siswa dapat membuka kamera ponsel untuk langsung diarahkan ke arena kuis, atau memasukkan 6 digit PIN.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    id="btn-copy-link-lobby"
                    onClick={handleCopyLobbyLink}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Tautan Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-purple-400" />
                        <span>Salin Link Gabung Kuis</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    Siap dimulai sebelum tombol main diklik
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Game Match Settings & Customization */}
        <div className="space-y-6">
          {/* MODE PERMAINAN KUIS (Tarik Tambang / Naik Gunung / Klasik) */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Swords className="h-4 w-4" />
                </span>
                <h3 className="font-bold text-white text-base">
                  Mode Permainan Kuis
                </h3>
              </div>
              <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold text-purple-300 border border-purple-500/30 uppercase">
                Pilih Mode
              </span>
            </div>

            {/* 3 Mode Selection Cards */}
            <div className="space-y-2.5">
              {/* Option 1: Mode Tarik Tambang */}
              <div
                id="btn-mode-tug-of-war"
                role="button"
                tabIndex={0}
                onClick={() => {
                  sound.playClick();
                  setGameMode('tug_of_war');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sound.playClick();
                    setGameMode('tug_of_war');
                  }
                }}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer select-none ${
                  gameMode === 'tug_of_war'
                    ? 'border-rose-500 bg-gradient-to-r from-rose-950/40 via-slate-900 to-cyan-950/40 shadow-lg shadow-rose-500/20 ring-1 ring-rose-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-lg">
                      🪢
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white font-['Outfit']">
                          Mode Tarik Tambang
                        </span>
                        <span className="rounded-md bg-rose-500/30 px-1.5 py-0.2 text-[9px] font-black text-rose-300 uppercase">
                          Favorit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Murid dibagi 2 tim (Kanan & Kiri), saling tarik tambang live!
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      gameMode === 'tug_of_war'
                        ? 'border-rose-400 bg-rose-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {gameMode === 'tug_of_war' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {/* Sub-options for Tarik Tambang: Team Selection & Split Preview */}
                {gameMode === 'tug_of_war' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300">
                      <span>Total {opponentCount + 1} Murid dibagi 2:</span>
                      <span className="text-amber-400 font-bold">
                        {Math.ceil((opponentCount + 1) / 2)} Kiri vs {Math.floor((opponentCount + 1) / 2)} Kanan
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        id="btn-team-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setHumanTeam('left');
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                          humanTeam === 'left'
                            ? 'border-rose-400 bg-rose-600 text-white shadow-md shadow-rose-600/30'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🦅</span>
                        <span>Tim Kiri (Garuda)</span>
                      </button>

                      <button
                        type="button"
                        id="btn-team-right"
                        onClick={(e) => {
                          e.stopPropagation();
                          sound.playClick();
                          setHumanTeam('right');
                        }}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition ${
                          humanTeam === 'right'
                            ? 'border-cyan-400 bg-blue-600 text-white shadow-md shadow-blue-600/30'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>🐅</span>
                        <span>Tim Kanan (Harimau)</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Option 2: Mode Naik Gunung */}
              <div
                id="btn-mode-mountain-climb"
                role="button"
                tabIndex={0}
                onClick={() => {
                  sound.playClick();
                  setGameMode('mountain_climb');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sound.playClick();
                    setGameMode('mountain_climb');
                  }
                }}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer select-none ${
                  gameMode === 'mountain_climb'
                    ? 'border-indigo-500 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-purple-950/40 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-lg">
                      🏔️
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-sm text-white font-['Outfit']">
                          Mode Naik Gunung
                        </span>
                        <span className="rounded-md bg-indigo-500/30 px-1.5 py-0.2 text-[9px] font-black text-indigo-300 uppercase">
                          Ala Quizizz
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Balapan mendaki lereng gunung Mahameru 3.676m ke puncak!
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      gameMode === 'mountain_climb'
                        ? 'border-indigo-400 bg-indigo-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {gameMode === 'mountain_climb' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                {gameMode === 'mountain_climb' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300"
                  >
                    <span className="text-indigo-300 font-semibold flex items-center gap-1">
                      <Mountain className="h-3.5 w-3.5" /> Puncak Mahameru
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      Target: 3.676 MDPL 🚩
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Option 3: Mode Klasik Leaderboard */}
              <div
                id="btn-mode-classic"
                role="button"
                tabIndex={0}
                onClick={() => {
                  sound.playClick();
                  setGameMode('classic');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    sound.playClick();
                    setGameMode('classic');
                  }
                }}
                className={`w-full text-left rounded-2xl border p-3.5 transition-all cursor-pointer select-none ${
                  gameMode === 'classic'
                    ? 'border-purple-500 bg-purple-950/30 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-lg">
                      🏆
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white font-['Outfit'] block">
                        Mode Klasik Leaderboard
                      </span>
                      <p className="text-[11px] text-slate-400">
                        Papan skor live peringkat individu standar kelas.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      gameMode === 'classic'
                        ? 'border-purple-400 bg-purple-500'
                        : 'border-slate-600'
                    }`}
                  >
                    {gameMode === 'classic' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-md space-y-6 shadow-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Clock className="h-4 w-4 text-purple-400" />
              Pengaturan Pertandingan Kelas
            </h3>

            {/* Question Count Selector */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Jumlah Butir Soal</span>
                <span className="text-purple-400 font-bold">{questionCount} Soal</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 8, 10].map((count) => {
                  const isAvailable = availableQuestions.length >= count;
                  return (
                    <button
                      key={count}
                      id={`btn-count-${count}`}
                      disabled={!isAvailable && availableQuestions.length > 0}
                      onClick={() => {
                        sound.playClick();
                        setQuestionCount(count);
                      }}
                      className={`rounded-xl py-2 text-xs font-bold transition ${
                        questionCount === count
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : isAvailable
                          ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                          : 'bg-slate-950 text-slate-600 cursor-not-allowed'
                      }`}
                    >
                      {count} Soal
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOMIZABLE TIMER SECTION */}
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Timer Per Soal (Bisa Custom)
                </span>
                <span className="text-amber-400 font-bold">{timePerQuestion} Detik</span>
              </label>

              {/* Preset Quick Chips */}
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 15, 20, 30].map((sec) => (
                  <button
                    key={sec}
                    id={`btn-timer-${sec}`}
                    onClick={() => {
                      sound.playClick();
                      setTimePerQuestion(sec);
                      setCustomTimeInput(sec);
                      setIsCustomTimeActive(false);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      timePerQuestion === sec && !isCustomTimeActive
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>

              {/* Custom Input Box for Timer */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                  Custom Detik:
                </span>
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    id="btn-time-minus"
                    onClick={() => {
                      sound.playClick();
                      const next = Math.max(5, timePerQuestion - 5);
                      setTimePerQuestion(next);
                      setCustomTimeInput(next);
                      setIsCustomTimeActive(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    -5
                  </button>
                  <input
                    id="input-custom-timer"
                    type="number"
                    min={5}
                    max={180}
                    value={customTimeInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setCustomTimeInput(val);
                        setTimePerQuestion(Math.min(180, Math.max(5, val)));
                        setIsCustomTimeActive(true);
                      }
                    }}
                    className="w-full text-center rounded-lg border border-slate-700 bg-slate-950 py-1 text-xs font-bold text-amber-300 focus:border-amber-500 focus:outline-none"
                  />
                  <button
                    id="btn-time-plus"
                    onClick={() => {
                      sound.playClick();
                      const next = Math.min(180, timePerQuestion + 5);
                      setTimePerQuestion(next);
                      setCustomTimeInput(next);
                      setIsCustomTimeActive(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    +5
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Atur bebas dari 5 s/d 180 detik sesuai panjang soal.
              </p>
            </div>

            {/* CUSTOMIZABLE OPPONENT / CLASSROOM SIMULATION SECTION */}
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  Simulasi Lawan Kelas
                </span>
                <span className="text-blue-400 font-bold">{opponentCount} Siswa</span>
              </label>

              {/* Preset Quick Buttons: includes 36 as requested! */}
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 36, 40].map((num) => (
                  <button
                    key={num}
                    id={`btn-opponents-${num}`}
                    onClick={() => {
                      sound.playClick();
                      setOpponentCount(num);
                      setCustomOpponentInput(num);
                      setIsCustomOpponentActive(false);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      opponentCount === num && !isCustomOpponentActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {num === 36 ? '36 (Kelas)' : `${num}`}
                  </button>
                ))}
              </div>

              {/* Custom Input Box for Opponent Count */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                  Custom Siswa:
                </span>
                <div className="flex items-center gap-1.5 flex-1">
                  <button
                    id="btn-opp-minus"
                    onClick={() => {
                      sound.playClick();
                      const next = Math.max(2, opponentCount - 2);
                      setOpponentCount(next);
                      setCustomOpponentInput(next);
                      setIsCustomOpponentActive(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    -2
                  </button>
                  <input
                    id="input-custom-opponents"
                    type="number"
                    min={2}
                    max={50}
                    value={customOpponentInput}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        setCustomOpponentInput(val);
                        setOpponentCount(Math.min(50, Math.max(2, val)));
                        setIsCustomOpponentActive(true);
                      }
                    }}
                    className="w-full text-center rounded-lg border border-slate-700 bg-slate-950 py-1 text-xs font-bold text-blue-300 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    id="btn-opp-plus"
                    onClick={() => {
                      sound.playClick();
                      const next = Math.min(50, opponentCount + 2);
                      setOpponentCount(next);
                      setCustomOpponentInput(next);
                      setIsCustomOpponentActive(true);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-xs font-bold text-slate-300 hover:bg-slate-700"
                  >
                    +2
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Standar kelas Indonesia = 36 siswa. Semua siswa memiliki nama dan avatar unik.
              </p>
            </div>

            {/* Launch Game Match Button */}
            <motion.button
              id="btn-start-game"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 py-4 text-base font-extrabold text-white shadow-xl shadow-purple-600/30 transition hover:shadow-purple-600/50"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>MULAI KUIS KELAS SEKARANG!</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-white">
                Pilih Avatar Siswa / Guru
              </h3>
              <button
                id="btn-close-avatar-modal"
                onClick={() => setShowAvatarModal(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 py-2">
              {AVATAR_OPTIONS.map((opt, idx) => (
                <button
                  key={idx}
                  id={`btn-avatar-opt-${idx}`}
                  onClick={() => selectAvatar(opt.icon, opt.bg)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 border transition ${
                    selectedAvatar === opt.icon
                      ? 'border-purple-500 bg-purple-500/20 ring-2 ring-purple-500'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${opt.bg} text-2xl shadow`}
                  >
                    {opt.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-slate-300 text-center truncate w-full">
                    {opt.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            <button
              id="btn-done-avatar"
              onClick={() => setShowAvatarModal(false)}
              className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500 transition"
            >
              Simpan Pilihan
            </button>
          </motion.div>
        </div>
      )}

      {/* Fullscreen Classroom Projector QR Code Modal */}
      {showFullQrModal && (
        <JoinQrModal
          gamePin={gamePin}
          quizTitle={currentPackage.title}
          opponentCount={opponentCount}
          timePerQuestion={timePerQuestion}
          onClose={() => setShowFullQrModal(false)}
          onStartGame={handleStart}
        />
      )}
    </div>
  );
};
