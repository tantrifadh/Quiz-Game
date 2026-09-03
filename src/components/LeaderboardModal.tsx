import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Medal,
  Flame,
  Calendar,
  Trash2,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';
import { LeaderboardRecord } from '../types';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  records: LeaderboardRecord[];
  onClose: () => void;
  onClearRecords: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  records,
  onClose,
  onClearRecords,
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const categories = ['all', ...Array.from(new Set(records.map((r) => r.categoryName)))];

  const filteredRecords =
    selectedCategoryFilter === 'all'
      ? records
      : records.filter((r) => r.categoryName === selectedCategoryFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900 shadow-2xl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-slate-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                Papan Peringkat Abadi
              </h2>
              <p className="text-xs text-slate-400">
                Skor tertinggi dari seluruh sesi pertandingan
              </p>
            </div>
          </div>
          <button
            id="btn-close-leaderboard-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-950/60 px-5 py-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            <Filter className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat}
                id={`btn-filter-${cat}`}
                onClick={() => {
                  sound.playClick();
                  setSelectedCategoryFilter(cat);
                }}
                className={`rounded-lg px-2.5 py-1 font-semibold whitespace-nowrap transition ${
                  selectedCategoryFilter === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'Semua Topik' : cat}
              </button>
            ))}
          </div>

          {records.length > 0 && (
            <button
              id="btn-clear-leaderboard"
              onClick={() => setShowClearConfirm(true)}
              className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition"
            >
              <Trash2 className="h-3 w-3" />
              Reset Skor
            </button>
          )}
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Trophy className="mx-auto h-12 w-12 text-slate-600" />
              <p className="text-sm font-semibold">Belum ada catatan skor di kategori ini.</p>
              <p className="text-xs text-slate-500">Mulai pertandingan untuk mencatatkan namamu di puncak!</p>
            </div>
          ) : (
            filteredRecords.map((record, index) => {
              const rank = index + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={record.id}
                  className={`flex items-center justify-between rounded-2xl border p-3 sm:p-3.5 transition ${
                    isTop1
                      ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/15 via-slate-900 to-slate-900 shadow-md shadow-amber-500/10'
                      : isTop2
                      ? 'border-slate-400/40 bg-slate-900/90'
                      : isTop3
                      ? 'border-amber-700/40 bg-slate-900/80'
                      : 'border-slate-800/80 bg-slate-950/60'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    {/* Rank Badge */}
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl font-black text-xs ${
                        isTop1
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/40'
                          : isTop2
                          ? 'bg-slate-300 text-slate-950'
                          : isTop3
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isTop1 ? '👑' : `#${rank}`}
                    </div>

                    {/* Avatar */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${record.avatarBg} text-xl shadow`}
                    >
                      {record.avatar}
                    </div>

                    {/* Name & Details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm sm:text-base font-extrabold text-white">
                          {record.playerName}
                        </span>
                        {isTop1 && (
                          <span className="hidden sm:inline-block rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-black text-amber-300 border border-amber-400/30">
                            LEADER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="text-purple-300 font-medium">
                          {record.categoryName}
                        </span>
                        <span>•</span>
                        <span>Akurasi {record.accuracy}%</span>
                        {record.maxStreak > 1 && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-semibold flex items-center gap-0.5">
                              <Flame className="h-3 w-3 fill-amber-400" />
                              {record.maxStreak}x
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score & Date */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <div className="font-mono text-base sm:text-lg font-black text-purple-300">
                      {record.score.toLocaleString('id-ID')}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {record.date}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Clear Confirmation Popup */}
        {showClearConfirm && (
          <div className="p-4 border-t border-slate-800 bg-rose-950/30 flex items-center justify-between gap-4">
            <p className="text-xs text-rose-300">
              Apakah kamu yakin ingin menghapus semua rekor leaderboard?
            </p>
            <div className="flex gap-2">
              <button
                id="btn-cancel-clear-lb"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg bg-slate-800 px-3 py-1 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                id="btn-confirm-clear-lb"
                onClick={() => {
                  sound.playClick();
                  onClearRecords();
                  setShowClearConfirm(false);
                }}
                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-500"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4">
          <button
            id="btn-close-lb-footer"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full rounded-xl bg-purple-600 py-2.5 text-sm font-bold text-white hover:bg-purple-500 transition"
          >
            Tutup Papan Peringkat
          </button>
        </div>
      </motion.div>
    </div>
  );
};
