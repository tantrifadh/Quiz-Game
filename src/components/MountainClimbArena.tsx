import React from 'react';
import { motion } from 'motion/react';
import { Mountain, Flag, Cloud, Compass, Sparkles, ChevronUp } from 'lucide-react';
import { Competitor } from '../types';

interface MountainClimbArenaProps {
  competitors: Competitor[];
  compact?: boolean;
}

const PEAK_ALTITUDE_METERS = 3676; // Puncak Mahameru

const CHECKPOINTS = [
  { name: 'Basecamp', altitude: 0, label: '0m' },
  { name: 'Pos 1 Lembah', altitude: 900, label: '900m' },
  { name: 'Pos 2 Tebing', altitude: 1800, label: '1.800m' },
  { name: 'Pos 3 Sabana', altitude: 2700, label: '2.700m' },
  { name: 'Puncak', altitude: 3676, label: '3.676m' },
];

export const MountainClimbArena: React.FC<MountainClimbArenaProps> = ({
  competitors,
  compact = false,
}) => {
  // Sort climbers by score descending (closest to summit)
  const rankedClimbers = [...competitors].sort((a, b) => b.score - a.score);
  const highestScore = Math.max(...competitors.map((c) => c.score), 1000);
  const humanClimber = competitors.find((c) => c.isHuman) || competitors[0];
  const leader = rankedClimbers[0];

  // Helper to get altitude in meters (0 to 3676 MDPL)
  const getClimberAltitude = (score: number) => {
    const ratio = Math.min(1, score / (highestScore * 1.15 || 1));
    return Math.round(ratio * PEAK_ALTITUDE_METERS);
  };

  // Helper to get percentage along the mountain slope (4% to 94%)
  const getClimberProgressPercent = (score: number) => {
    const ratio = Math.min(1, score / (highestScore * 1.15 || 1));
    return 6 + ratio * 88;
  };

  const humanAltitude = getClimberAltitude(humanClimber.score);
  const leaderAltitude = getClimberAltitude(leader ? leader.score : 0);

  // Take top 6 climbers to render on the active slope to avoid clutter
  const slopeClimbers = rankedClimbers.slice(0, compact ? 5 : 7);

  return (
    <div
      id="mountain-climb-arena"
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-indigo-950/80 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-md ${
        compact ? 'p-3 sm:p-4' : 'p-5 sm:p-6'
      }`}
    >
      {/* Mountain Sky and Ambient Clouds */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-900/20 via-transparent to-slate-950 pointer-events-none" />
      <div className="absolute top-2 left-10 text-slate-400/20 animate-pulse pointer-events-none">
        <Cloud className="h-12 w-12" />
      </div>
      <div className="absolute top-4 right-1/4 text-slate-400/15 pointer-events-none">
        <Cloud className="h-8 w-8" />
      </div>

      {/* Header Info: Peak Target and Leader */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 text-lg">
            <Mountain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-indigo-300 font-['Outfit']">
                EKSPEDISI PUNCAK MAHAMERU
              </span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.2 text-[9px] font-bold text-indigo-300 border border-indigo-500/30">
                3.676 MDPL
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Balapan mendaki puncak lereng gunung ala Quizizz!
            </p>
          </div>
        </div>

        {/* Human Elevation Meter & Leader Status */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-purple-500/40 bg-purple-500/15 px-3 py-1.5 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block">
              Ketinggian Kamu:
            </span>
            <div className="flex items-center justify-end gap-1 font-mono text-sm sm:text-base font-black text-white">
              <Compass className="h-3.5 w-3.5 text-purple-400" />
              <span>{humanAltitude.toLocaleString('id-ID')} MDPL</span>
            </div>
          </div>

          <div className="hidden sm:block rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Pemimpin Jalur:
            </span>
            <div className="flex items-center justify-end gap-1 font-bold text-xs text-amber-300">
              <span>{leader ? leader.name : 'Siswa'}</span>
              <span className="text-[10px] text-slate-400">({leaderAltitude}m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Mountain Trail Landscape */}
      <div className={`relative z-10 ${compact ? 'py-2' : 'py-4'}`}>
        <div className="relative h-28 sm:h-36 w-full rounded-2xl border border-slate-800/80 bg-slate-950/90 overflow-hidden px-4 flex items-end">
          {/* Mountain Silhouette SVG Background */}
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
            preserveAspectRatio="none"
            viewBox="0 0 1000 300"
          >
            {/* Distant Mountain Peak */}
            <polygon
              points="0,300 150,220 380,140 650,70 920,20 1000,0 1000,300"
              fill="url(#mountainGrad)"
            />
            {/* Trail Line */}
            <path
              d="M 50 280 Q 200 240 400 170 T 750 80 T 960 35"
              fill="none"
              stroke="#818cf8"
              strokeWidth="4"
              strokeDasharray="8 6"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="mountainGrad" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="60%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#312e81" />
              </linearGradient>
            </defs>
          </svg>

          {/* Summit Flag at the top right */}
          <div className="absolute top-2 right-4 sm:right-6 flex flex-col items-center z-10">
            <div className="flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-400/50 px-2 py-0.5 text-[9px] font-black text-amber-300 shadow">
              <Flag className="h-3 w-3 fill-amber-400 text-amber-400 animate-bounce" />
              <span>Puncak 3.676m</span>
            </div>
          </div>

          {/* Checkpoint Posts Along the Route */}
          <div className="absolute inset-x-4 sm:inset-x-8 bottom-1 flex justify-between text-[9px] font-bold text-slate-400 z-0">
            {CHECKPOINTS.map((cp, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 mb-0.5" />
                <span className="hidden sm:inline text-slate-400">{cp.name}</span>
                <span className="text-[8px] text-slate-500">{cp.label}</span>
              </div>
            ))}
          </div>

          {/* Climber Avatars Ascending the Mountain Trail */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {slopeClimbers.map((climber, idx) => {
              const progressX = getClimberProgressPercent(climber.score);
              // Calculate Y position along the inclined slope (lower at left, higher at right)
              // 0% progress -> Y ~ 80%, 100% progress -> Y ~ 15%
              const progressY = 82 - (progressX / 100) * 62;
              const altitude = getClimberAltitude(climber.score);

              return (
                <motion.div
                  key={climber.id}
                  animate={{
                    left: `${progressX}%`,
                    top: `${progressY}%`,
                  }}
                  transition={{ type: 'spring', damping: 20, stiffness: 90 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
                >
                  {/* Climber Height Tag */}
                  <div
                    className={`rounded px-1.5 py-0.2 text-[8px] font-black shadow flex items-center gap-0.5 mb-0.5 ${
                      climber.isHuman
                        ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                        : idx === 0
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {idx === 0 && <span>👑</span>}
                    <span>{altitude}m</span>
                  </div>

                  {/* Climber Avatar Badge */}
                  <div
                    className={`relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl ${climber.avatarBg} text-lg shadow-lg border transition ${
                      climber.isHuman
                        ? 'border-white ring-4 ring-purple-500 shadow-purple-500/50 scale-110'
                        : idx === 0
                        ? 'border-amber-400 ring-2 ring-amber-400/50'
                        : 'border-slate-700'
                    }`}
                    title={`${climber.name} (${altitude} MDPL)`}
                  >
                    {climber.avatar}
                    {climber.isHuman && (
                      <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 text-[8px] text-white">
                        ★
                      </span>
                    )}
                  </div>

                  {/* Name Label */}
                  <span className="mt-0.5 max-w-[55px] truncate text-[9px] font-bold text-slate-200">
                    {climber.isHuman ? 'Kamu' : climber.name.split(' ')[0]}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Subtext */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 pt-1">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>Jawab benar untuk mendaki lereng lebih cepat menuju puncak!</span>
        </span>
        <span className="font-semibold text-slate-300 flex items-center gap-1">
          <ChevronUp className="h-3.5 w-3.5 text-indigo-400 animate-bounce" />
          <span>Total {competitors.length} Pendaki Aktif di Jalur</span>
        </span>
      </div>
    </div>
  );
};
