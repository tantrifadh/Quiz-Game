import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Play,
  Globe,
  Sparkles,
  Cpu,
  Flame,
  Brain,
  Shuffle,
  Users,
  Clock,
  HelpCircle,
  Award,
  Sparkle,
} from 'lucide-react';
import {
  QuestionCategory,
  PlayerProfile,
} from '../types';
import {
  CATEGORIES,
  AVATAR_OPTIONS,
} from '../data/quizData';
import { sound } from '../utils/audio';

interface LobbyProps {
  profile: PlayerProfile;
  onUpdateProfile: (profile: PlayerProfile) => void;
  onStartGame: (config: {
    category: QuestionCategory | 'all';
    questionCount: number;
    timePerQuestion: number;
    opponentCount: number;
  }) => void;
  customQuestionsCount: number;
  onOpenCustomQuiz: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Cpu: <Cpu className="h-5 w-5" />,
  Flame: <Flame className="h-5 w-5" />,
  Brain: <Brain className="h-5 w-5" />,
};

export const Lobby: React.FC<LobbyProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  customQuestionsCount,
  onOpenCustomQuiz,
}) => {
  const [name, setName] = useState(profile.name);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar);
  const [selectedBg, setSelectedBg] = useState(profile.avatarBg);
  const [selectedCategory, setSelectedCategory] = useState<QuestionCategory | 'all'>('umum');
  const [questionCount, setQuestionCount] = useState<number>(8);
  const [timePerQuestion, setTimePerQuestion] = useState<number>(15);
  const [opponentCount, setOpponentCount] = useState<number>(7);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

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

  const handleStart = () => {
    sound.playStreak();
    onStartGame({
      category: selectedCategory,
      questionCount,
      timePerQuestion,
      opponentCount,
    });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top Banner / Game Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-900/40 via-slate-900/90 to-indigo-950/40 p-6 sm:p-8 backdrop-blur-md shadow-2xl relative"
      >
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
              <Sparkle className="h-3.5 w-3.5 text-purple-300 animate-pulse" />
              <span>Format Kuis Interaktif Cepat & Seru</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-['Outfit']">
              Uji Pengetahuan, Taklukkan <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Leaderboard</span>!
            </h1>
            <p className="max-w-xl text-sm sm:text-base text-slate-300">
              Jawab cepat untuk bonus poin, jaga streak kemenangan, gunakan power-up pintar, dan salip peringkat lawan secara live!
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
                Nama Panggilan
              </label>
              <input
                id="input-player-name"
                type="text"
                maxLength={18}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Masukkan namamu..."
                className="w-44 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-sm font-semibold text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Category Picker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-400" />
              Pilih Kategori Kuis
            </h2>
            <span className="text-xs text-slate-400">
              Pilih topik favorit atau uji semua
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Mixed All Categories Option */}
            <motion.button
              id="cat-btn-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playClick();
                setSelectedCategory('all');
              }}
              className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                selectedCategory === 'all'
                  ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white shadow">
                <Shuffle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm sm:text-base">
                    Campuran Semua Topik
                  </span>
                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                    Acak
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                  Kombinasi soal sains, umum, teknologi, pop culture, dan logika secara acak.
                </p>
              </div>
            </motion.button>

            {/* Standard Curated Categories */}
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    sound.playClick();
                    setSelectedCategory(cat.id);
                  }}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                    isSelected
                      ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${cat.badgeColor} border`}
                  >
                    {CATEGORY_ICONS[cat.icon] || <Globe className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm sm:text-base">
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {cat.questionsCount} soal
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}

            {/* Custom Created Quiz Option */}
            <motion.button
              id="cat-btn-custom"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                sound.playClick();
                if (customQuestionsCount > 0) {
                  setSelectedCategory('custom');
                } else {
                  onOpenCustomQuiz();
                }
              }}
              className={`flex items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                selectedCategory === 'custom'
                  ? 'border-purple-500 bg-purple-500/15 ring-2 ring-purple-500/40 shadow-lg shadow-purple-500/10'
                  : 'border-dashed border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900'
              }`}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-sm sm:text-base">
                    Soal Buatan Sendiri
                  </span>
                  <span className="rounded-full bg-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-300">
                    {customQuestionsCount} Soal
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {customQuestionsCount > 0
                    ? 'Mainkan kumpulan kuis yang kamu buat sendiri!'
                    : 'Belum ada soal kustom. Klik untuk membuat sekarang.'}
                </p>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Right Column: Game Match Settings & Start Button */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 backdrop-blur-md space-y-6 shadow-xl">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              Pengaturan Pertandingan
            </h3>

            {/* Question Count */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Jumlah Soal</span>
                <span className="text-purple-400 font-bold">{questionCount} Soal</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 8, 10].map((count) => (
                  <button
                    key={count}
                    id={`btn-count-${count}`}
                    onClick={() => {
                      sound.playClick();
                      setQuestionCount(count);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      questionCount === count
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {count} Soal
                  </button>
                ))}
              </div>
            </div>

            {/* Time per Question */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Timer Per Soal</span>
                <span className="text-amber-400 font-bold">{timePerQuestion} Detik</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map((seconds) => (
                  <button
                    key={seconds}
                    id={`btn-time-${seconds}`}
                    onClick={() => {
                      sound.playClick();
                      setTimePerQuestion(seconds);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      timePerQuestion === seconds
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {seconds}s
                  </button>
                ))}
              </div>
            </div>

            {/* Opponents Count */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-blue-400" />
                  Simulasi Lawan Kelas
                </span>
                <span className="text-blue-400 font-bold">{opponentCount} Pemain</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[3, 5, 7].map((num) => (
                  <button
                    key={num}
                    id={`btn-opponents-${num}`}
                    onClick={() => {
                      sound.playClick();
                      setOpponentCount(num);
                    }}
                    className={`rounded-xl py-2 text-xs font-bold transition ${
                      opponentCount === num
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    {num} Lawan
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Lawan bersaing live denganmu di papan peringkat saat kuis berjalan!
              </p>
            </div>

            {/* Quizizz Power-ups info strip */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-400 space-y-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                ⚡ Power-up Tersedia di Kuis:
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span>⏱️</span> Extra Time (+10s)
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span>✂️</span> 50:50 (Eliminasi)
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span>💥</span> 2X Multiplier
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span>🛡️</span> Streak Shield
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <motion.button
              id="btn-start-game"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 py-4 text-base font-extrabold text-white shadow-xl shadow-purple-600/30 transition hover:shadow-purple-600/50"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>MULAI PERTANDINGAN!</span>
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
                Pilih Avatar Favoritmu
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
    </div>
  );
};
