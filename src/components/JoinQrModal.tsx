import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Maximize2,
  X,
  Users,
  Smartphone,
  Sparkles,
  Play,
  Volume2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface JoinQrModalProps {
  gamePin: string;
  quizTitle: string;
  opponentCount: number;
  timePerQuestion: number;
  onClose: () => void;
  onStartGame: () => void;
}

export const JoinQrModal: React.FC<JoinQrModalProps> = ({
  gamePin,
  quizTitle,
  opponentCount,
  timePerQuestion,
  onClose,
  onStartGame,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [joinUrl, setJoinUrl] = useState<string>('');

  useEffect(() => {
    // Generate URL based on current browser location
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://kuis-kelas.app';
    const url = `${origin}/#join=${gamePin}`;
    setJoinUrl(url);

    QRCode.toDataURL(
      url,
      {
        width: 380,
        margin: 2,
        color: {
          dark: '#090d16',
          light: '#ffffff',
        },
      },
      (err, dataUrl) => {
        if (!err && dataUrl) {
          setQrDataUrl(dataUrl);
        }
      }
    );
  }, [gamePin]);

  const handleCopyLink = () => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 sm:p-6 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-purple-500/40 bg-slate-900 shadow-2xl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-purple-900/60 via-indigo-900/40 to-slate-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-purple-300 border border-purple-500/30">
                  Mode Proyektor Kelas
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
                  <Sparkles className="h-3 w-3" /> Siap Pindai
                </span>
              </div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                Gabung Kuis Siswa
              </h2>
            </div>
          </div>
          <button
            id="btn-close-qr-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Info Banner for Classroom */}
          <div className="text-center space-y-1">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-400">
              Paket Kuis Aktif:
            </p>
            <h3 className="text-lg sm:text-xl font-extrabold text-purple-300">
              {quizTitle}
            </h3>
            <p className="text-xs text-slate-400">
              Minta siswa membuka kamera HP untuk scan QR Code atau kunjungi link kuis
            </p>
          </div>

          {/* QR Code and Game PIN Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* QR Card */}
            <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-700/60 bg-slate-950 p-6 text-center shadow-inner relative group">
              <div className="relative overflow-hidden rounded-2xl bg-white p-3 shadow-xl ring-4 ring-purple-500/30">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`QR Code PIN ${gamePin}`}
                    className="h-52 w-52 sm:h-56 sm:w-56 object-contain"
                  />
                ) : (
                  <div className="h-52 w-52 flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-semibold">
                    Membuat QR Code...
                  </div>
                )}
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Smartphone className="h-4 w-4 text-purple-400" />
                Arahkan Kamera HP ke Sini
              </p>
            </div>

            {/* Game PIN and Link Instructions */}
            <div className="space-y-4">
              {/* Game PIN Big Box */}
              <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-slate-900 p-4 text-center shadow-lg">
                <span className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                  Game PIN Masuk Kuis:
                </span>
                <div className="mt-1 font-mono text-3xl sm:text-4xl font-black tracking-widest text-amber-400 font-['Outfit']">
                  {gamePin.slice(0, 3)} {gamePin.slice(3)}
                </div>
                <span className="mt-1 block text-[11px] text-slate-300">
                  Masukkan PIN jika membuka secara manual
                </span>
              </div>

              {/* Match Details pill */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Kapasitas Kelas
                  </span>
                  <span className="font-extrabold text-white text-sm">
                    {opponentCount + 1} Peserta
                  </span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Timer Soal
                  </span>
                  <span className="font-extrabold text-amber-400 text-sm">
                    {timePerQuestion} Detik/Soal
                  </span>
                </div>
              </div>

              {/* Copy Join Link Button */}
              <div className="space-y-1.5">
                <button
                  id="btn-copy-join-link"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 py-3 text-xs font-bold text-slate-200 hover:border-purple-500 hover:bg-slate-700 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300">Tautan Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-purple-400" />
                      <span>Salin Tautan Kuis Siswa</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-slate-400 text-center truncate px-2">
                  {joinUrl}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/80 p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="h-4 w-4 text-blue-400" />
            <span>Semua siswa di kelas siap bersaing di leaderboard live!</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              id="btn-close-qr-back"
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="flex-1 sm:flex-initial rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition"
            >
              Tutup
            </button>

            <button
              id="btn-start-from-qr"
              onClick={() => {
                sound.playStreak();
                onClose();
                onStartGame();
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-6 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 hover:opacity-95 transition"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Mulai Kuis Sekarang!</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
