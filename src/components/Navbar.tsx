import React from 'react';
import { Volume2, VolumeX, Trophy, PlusCircle, Zap } from 'lucide-react';
import { sound } from '../utils/audio';

interface NavbarProps {
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenLeaderboard: () => void;
  onOpenCustomQuiz: () => void;
  onGoHome?: () => void;
  inGame?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMuted,
  onToggleSound,
  onOpenLeaderboard,
  onOpenCustomQuiz,
  onGoHome,
  inGame = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <button
          id="btn-brand-home"
          onClick={() => {
            sound.playClick();
            if (onGoHome) onGoHome();
          }}
          className="group flex items-center gap-2.5 text-left transition"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                Kuis<span className="text-purple-400">Arena</span>
              </span>
              <span className="hidden sm:inline-block rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30">
                QUIZIZZ STYLE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Tantang wawasan & raih peringkat puncak
            </p>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!inGame && (
            <button
              id="btn-create-quiz"
              onClick={() => {
                sound.playClick();
                onOpenCustomQuiz();
              }}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-200 shadow-sm transition hover:border-purple-500/50 hover:bg-slate-800 hover:text-white"
              title="Buat Kuis Sendiri"
            >
              <PlusCircle className="h-4 w-4 text-purple-400" />
              <span className="hidden md:inline">Buat Soal</span>
            </button>
          )}

          <button
            id="btn-open-leaderboard"
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs sm:text-sm font-bold text-amber-300 shadow-sm transition hover:bg-amber-500/20 hover:border-amber-500/50"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            id="btn-toggle-sound"
            onClick={() => {
              onToggleSound();
            }}
            aria-label={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
