import React from 'react';
import { motion } from 'motion/react';
import { Swords, Flame, Sparkles, ArrowLeft, ArrowRight, Trophy } from 'lucide-react';
import { Competitor } from '../types';

interface TugOfWarArenaProps {
  competitors: Competitor[];
  humanTeam?: 'left' | 'right';
  compact?: boolean;
}

export const TugOfWarArena: React.FC<TugOfWarArenaProps> = ({
  competitors,
  humanTeam = 'left',
  compact = false,
}) => {
  // Separate competitors into Left Team and Right Team
  const leftTeam = competitors.filter((c) => c.team === 'left');
  const rightTeam = competitors.filter((c) => c.team === 'right');

  // If team isn't assigned yet, split evenly by index (e.g. 18 and 18 for 36 students)
  const effectiveLeftTeam =
    leftTeam.length > 0
      ? leftTeam
      : competitors.filter((_, idx) => idx % 2 === 0);
  const effectiveRightTeam =
    rightTeam.length > 0
      ? rightTeam
      : competitors.filter((_, idx) => idx % 2 !== 0);

  const leftScore = effectiveLeftTeam.reduce((acc, c) => acc + c.score, 0);
  const rightScore = effectiveRightTeam.reduce((acc, c) => acc + c.score, 0);

  const scoreDiff = leftScore - rightScore; // positive means left is leading
  const totalScore = leftScore + rightScore;

  // Calculate rope offset in percentage (-38% to +38% so rope doesn't fly off-screen)
  // Scaling with logarithmic sensitivity for dynamic tension
  const maxDiffThreshold = Math.max(1500, totalScore * 0.35);
  const rawRatio = maxDiffThreshold > 0 ? scoreDiff / maxDiffThreshold : 0;
  const ropeOffset = Math.max(-38, Math.min(38, rawRatio * 38));

  // Determine current match state
  const isLeftWinning = scoreDiff > 100;
  const isRightWinning = scoreDiff < -100;
  const isTied = Math.abs(scoreDiff) <= 100;

  // Visible pulling avatars on each side (show up to 5 on each side + counter chip)
  const visibleLeftMembers = effectiveLeftTeam.slice(0, compact ? 4 : 5);
  const visibleRightMembers = effectiveRightTeam.slice(0, compact ? 4 : 5);

  return (
    <div
      id="tug-of-war-arena"
      className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-950 to-slate-900 shadow-2xl backdrop-blur-md ${
        compact ? 'p-3 sm:p-4' : 'p-5 sm:p-6'
      }`}
    >
      {/* Ambient background glow depending on which team leads */}
      <div
        className={`absolute -left-12 -top-12 h-36 w-36 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isLeftWinning ? 'bg-rose-500/25 opacity-100' : 'bg-rose-500/10 opacity-50'
        }`}
      />
      <div
        className={`absolute -right-12 -top-12 h-36 w-36 rounded-full blur-3xl transition-opacity duration-700 pointer-events-none ${
          isRightWinning ? 'bg-blue-500/25 opacity-100' : 'bg-blue-500/10 opacity-50'
        }`}
      />

      {/* Top Banner: Team Score & Status */}
      <div className="relative z-10 flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        {/* Left Team Header */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-600/30 text-lg">
            🦅
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-rose-300 font-['Outfit']">
                TIM KIRI (GARUDA)
              </span>
              {humanTeam === 'left' && (
                <span className="rounded-full bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-bold text-rose-300 border border-rose-500/40">
                  Tim Kamu
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-base sm:text-xl font-black text-white">
                {leftScore.toLocaleString('id-ID')}
              </span>
              <span className="text-[10px] font-bold text-slate-400">
                ({effectiveLeftTeam.length} Siswa)
              </span>
            </div>
          </div>
        </div>

        {/* Center Tension Ribbon Badge */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] font-extrabold text-slate-300 shadow">
            <Swords className="h-3.5 w-3.5 text-amber-400" />
            <span>
              {isLeftWinning
                ? `← Kiri Unggul +${Math.abs(scoreDiff).toLocaleString('id-ID')} pts!`
                : isRightWinning
                ? `Kanan Unggul +${Math.abs(scoreDiff).toLocaleString('id-ID')} pts! →`
                : 'Skor Seimbang! Tarik!'}
            </span>
          </div>
          <span className="text-[9px] text-slate-400 mt-0.5">
            Total {competitors.length} Siswa (Dibagi 2 Tim Kanan-Kiri)
          </span>
        </div>

        {/* Right Team Header */}
        <div className="flex items-center gap-2.5 text-right">
          <div>
            <div className="flex items-center justify-end gap-1.5">
              {humanTeam === 'right' && (
                <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[9px] font-bold text-blue-300 border border-blue-500/40">
                  Tim Kamu
                </span>
              )}
              <span className="text-xs sm:text-sm font-black text-cyan-300 font-['Outfit']">
                TIM KANAN (HARIMAU)
              </span>
            </div>
            <div className="flex items-baseline justify-end gap-1.5">
              <span className="text-[10px] font-bold text-slate-400">
                ({effectiveRightTeam.length} Siswa)
              </span>
              <span className="font-mono text-base sm:text-xl font-black text-white">
                {rightScore.toLocaleString('id-ID')}
              </span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-lg shadow-blue-600/30 text-lg">
            🐅
          </div>
        </div>
      </div>

      {/* Main Interactive Tug of War Stage */}
      <div className={`relative z-10 ${compact ? 'py-3' : 'py-5'}`}>
        {/* Field Markings: Boundary Lines and Center Line */}
        <div className="relative h-20 sm:h-24 w-full rounded-2xl border border-slate-800/80 bg-slate-950/80 overflow-hidden flex items-center justify-between px-2 sm:px-6">
          {/* Ground texture & dirt markings */}
          <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-amber-950/20 to-transparent pointer-events-none" />

          {/* Left Limit Danger Line */}
          <div className="absolute left-[15%] top-0 bottom-0 w-0.5 border-r border-dashed border-rose-500/40 z-0">
            <span className="absolute -top-1 -left-2 text-[8px] font-bold text-rose-500/70 uppercase">
              Batas Kiri
            </span>
          </div>

          {/* Center Mark Line (Titik Tengah) */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-amber-400/40 z-0 flex flex-col items-center justify-between py-1">
            <span className="text-[9px] font-extrabold text-amber-400">0</span>
            <span className="text-[9px] font-extrabold text-amber-400">0</span>
          </div>

          {/* Right Limit Danger Line */}
          <div className="absolute right-[15%] top-0 bottom-0 w-0.5 border-r border-dashed border-cyan-500/40 z-0">
            <span className="absolute -top-1 -right-2 text-[8px] font-bold text-cyan-500/70 uppercase">
              Batas Kanan
            </span>
          </div>

          {/* LEFT PULLERS (Team Left Avatars) */}
          <div className="relative z-10 flex items-center -space-x-2 sm:-space-x-1">
            {visibleLeftMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                animate={{
                  x: isLeftWinning ? [-3, 0, -3] : [0, 2, 0],
                  rotate: isLeftWinning ? [-12, -8, -12] : [-6, -4, -6],
                }}
                transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.1 }}
                className={`relative flex flex-col items-center ${
                  member.isHuman ? 'z-20' : 'z-10'
                }`}
              >
                <div
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl ${member.avatarBg} text-xl shadow-md border-2 transition ${
                    member.isHuman
                      ? 'border-white ring-4 ring-rose-500 shadow-rose-500/50 scale-110'
                      : 'border-rose-400/40'
                  }`}
                  title={`${member.name} (${member.score} pts)`}
                >
                  {member.avatar}
                </div>
                <span className="mt-0.5 max-w-[48px] truncate text-[9px] font-bold text-slate-300">
                  {member.isHuman ? 'Kamu' : member.name.split(' ')[0]}
                </span>
              </motion.div>
            ))}
            {effectiveLeftTeam.length > visibleLeftMembers.length && (
              <span className="z-10 ml-1 rounded-full bg-rose-500/20 px-2 py-0.5 text-[9px] font-bold text-rose-300 border border-rose-500/40">
                +{effectiveLeftTeam.length - visibleLeftMembers.length}
              </span>
            )}
          </div>

          {/* THE ROPE AND THE MOVING CENTER RIBBON */}
          <div className="absolute inset-x-12 sm:inset-x-28 top-1/2 -translate-y-1/2 h-4 flex items-center">
            {/* The Rope Body with realistic fiber twists */}
            <div className="h-3.5 w-full rounded-full bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 shadow-inner border border-amber-900/60 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(45deg, #78350f 0, #78350f 4px, #b45309 4px, #b45309 8px)',
                }}
              />
            </div>

            {/* Red Center Ribbon / Flag that moves with ropeOffset */}
            <motion.div
              animate={{ x: `${ropeOffset}%` }}
              transition={{ type: 'spring', damping: 18, stiffness: 120 }}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
            >
              {/* Ribbon Flag */}
              <div className="relative">
                <div className="h-7 w-6 bg-gradient-to-b from-rose-500 to-red-700 rounded-b-md shadow-xl border-2 border-white flex items-center justify-center animate-pulse">
                  <Flame className="h-3.5 w-3.5 text-white fill-white" />
                </div>
                {/* Knot Indicator */}
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 w-4 rounded-full bg-amber-900 border border-amber-500" />
              </div>

              {/* Offset Meter Marker */}
              <span
                className={`mt-1 rounded px-1.5 py-0.2 text-[9px] font-black shadow whitespace-nowrap ${
                  isLeftWinning
                    ? 'bg-rose-500 text-white'
                    : isRightWinning
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-amber-400 text-slate-950'
                }`}
              >
                {Math.abs(ropeOffset) < 1
                  ? 'SEIMBANG'
                  : isLeftWinning
                  ? `← ${(Math.abs(ropeOffset) / 8).toFixed(1)}m`
                  : `→ ${(Math.abs(ropeOffset) / 8).toFixed(1)}m`}
              </span>
            </motion.div>
          </div>

          {/* RIGHT PULLERS (Team Right Avatars) */}
          <div className="relative z-10 flex items-center -space-x-2 sm:-space-x-1 flex-row-reverse">
            {visibleRightMembers.map((member, idx) => (
              <motion.div
                key={member.id}
                animate={{
                  x: isRightWinning ? [3, 0, 3] : [0, -2, 0],
                  rotate: isRightWinning ? [12, 8, 12] : [6, 4, 6],
                }}
                transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.1 }}
                className={`relative flex flex-col items-center ${
                  member.isHuman ? 'z-20' : 'z-10'
                }`}
              >
                <div
                  className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl ${member.avatarBg} text-xl shadow-md border-2 transition ${
                    member.isHuman
                      ? 'border-white ring-4 ring-cyan-500 shadow-cyan-500/50 scale-110'
                      : 'border-cyan-400/40'
                  }`}
                  title={`${member.name} (${member.score} pts)`}
                >
                  {member.avatar}
                </div>
                <span className="mt-0.5 max-w-[48px] truncate text-[9px] font-bold text-slate-300">
                  {member.isHuman ? 'Kamu' : member.name.split(' ')[0]}
                </span>
              </motion.div>
            ))}
            {effectiveRightTeam.length > visibleRightMembers.length && (
              <span className="z-10 mr-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
                +{effectiveRightTeam.length - visibleRightMembers.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Subtext */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 pt-1">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span>Jawab benar & cepat untuk menarik tambang ke arah timmu!</span>
        </span>
        <span className="font-semibold text-slate-300">
          Status Tambang:{' '}
          <span
            className={
              isLeftWinning
                ? 'text-rose-400 font-bold'
                : isRightWinning
                ? 'text-cyan-400 font-bold'
                : 'text-amber-400 font-bold'
            }
          >
            {isLeftWinning
              ? 'Tim Kiri Sedang Menarik!'
              : isRightWinning
              ? 'Tim Kanan Sedang Menarik!'
              : 'Tarik-Menarik Seimbang'}
          </span>
        </span>
      </div>
    </div>
  );
};
