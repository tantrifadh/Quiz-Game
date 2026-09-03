import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  PlusCircle,
  Trash2,
  HelpCircle,
  CheckCircle2,
  X,
  BookOpen,
} from 'lucide-react';
import { Question } from '../types';
import { sound } from '../utils/audio';

interface CustomQuizModalProps {
  customQuestions: Question[];
  onAddQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onClose: () => void;
  onPlayCustomQuiz: () => void;
}

export const CustomQuizModal: React.FC<CustomQuizModalProps> = ({
  customQuestions,
  onAddQuestion,
  onDeleteQuestion,
  onClose,
  onPlayCustomQuiz,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [formError, setFormError] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setFormError('Teks pertanyaan wajib diisi!');
      return;
    }
    if (!opt0.trim() || !opt1.trim() || !opt2.trim() || !opt3.trim()) {
      setFormError('Keempat opsi jawaban wajib diisi!');
      return;
    }

    setFormError('');
    const newQ: Question = {
      id: `custom-${Date.now()}`,
      category: 'custom',
      question: questionText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctIndex,
      explanation: explanation.trim() || undefined,
      difficulty: 'sedang',
    };

    sound.playCorrect();
    onAddQuestion(newQ);

    // Reset inputs
    setQuestionText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    setCorrectIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-pink-500/30 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-slate-900 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-['Outfit']">
                Pembuat Kuis Kustom
              </h2>
              <p className="text-xs text-slate-400">
                Buat pertanyaanmu sendiri dan mainkan bersama teman
              </p>
            </div>
          </div>
          <button
            id="btn-close-custom-quiz-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Create Question Form */}
          <form onSubmit={handleSave} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
              <PlusCircle className="h-4 w-4 text-pink-400" />
              Tambah Soal Baru
            </h3>

            {formError && (
              <div className="rounded-xl bg-rose-500/20 border border-rose-500/40 p-2.5 text-xs text-rose-300 font-semibold">
                {formError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Teks Pertanyaan
              </label>
              <textarea
                id="input-custom-question"
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Contoh: Apa nama galaksi tempat tata surya kita berada?"
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Pilihan Jawaban (Pilih bulatan untuk menandai KUNCI BENAR):
              </label>

              {[
                { val: opt0, set: setOpt0, label: 'Opsi A', idx: 0, color: 'text-rose-400' },
                { val: opt1, set: setOpt1, label: 'Opsi B', idx: 1, color: 'text-cyan-400' },
                { val: opt2, set: setOpt2, label: 'Opsi C', idx: 2, color: 'text-amber-400' },
                { val: opt3, set: setOpt3, label: 'Opsi D', idx: 3, color: 'text-emerald-400' },
              ].map((opt) => (
                <div key={opt.idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    id={`btn-mark-correct-${opt.idx}`}
                    onClick={() => {
                      sound.playClick();
                      setCorrectIndex(opt.idx);
                    }}
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl border transition ${
                      correctIndex === opt.idx
                        ? 'border-emerald-500 bg-emerald-500/30 text-emerald-300 ring-2 ring-emerald-500'
                        : 'border-slate-800 bg-slate-900 text-slate-500 hover:text-white'
                    }`}
                    title="Tandai sebagai jawaban benar"
                  >
                    {correctIndex === opt.idx ? '✓' : ''}
                  </button>

                  <input
                    id={`input-opt-${opt.idx}`}
                    type="text"
                    value={opt.val}
                    onChange={(e) => opt.set(e.target.value)}
                    placeholder={`${opt.label}...`}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Penjelasan Tambahan (Opsional)
              </label>
              <input
                id="input-custom-explanation"
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Fakta menarik atau alasan kenapa jawaban tersebut benar..."
                className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              id="btn-save-custom-question"
              className="w-full rounded-xl bg-pink-600 py-2.5 text-xs font-extrabold text-white shadow-lg shadow-pink-600/30 hover:bg-pink-500 transition"
            >
              + Simpan Soal Ini
            </button>
          </form>

          {/* List of Existing Custom Questions */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white flex items-center justify-between">
              <span>Daftar Soal Kustom ({customQuestions.length})</span>
              {customQuestions.length > 0 && (
                <button
                  id="btn-play-custom-now"
                  onClick={() => {
                    sound.playStreak();
                    onPlayCustomQuiz();
                  }}
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  ▶ Mainkan Kuis Ini!
                </button>
              )}
            </h3>

            {customQuestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-4">
                Belum ada soal kustom tersimpan. Tambahkan soal pertamamu di atas!
              </p>
            ) : (
              customQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-white">
                      #{index + 1}. {q.question}
                    </span>
                    <button
                      id={`btn-delete-q-${q.id}`}
                      onClick={() => {
                        sound.playClick();
                        onDeleteQuestion(q.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="Hapus soal"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`rounded-lg px-2 py-1 border ${
                          oIdx === q.correctIndex
                            ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 font-bold'
                            : 'border-slate-800 bg-slate-900 text-slate-400'
                        }`}
                      >
                        {oIdx === q.correctIndex && '✓ '} {opt}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4 flex gap-3">
          <button
            id="btn-close-custom-modal"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700 transition"
          >
            Tutup
          </button>
          {customQuestions.length > 0 && (
            <button
              id="btn-play-custom-bottom"
              onClick={() => {
                sound.playStreak();
                onPlayCustomQuiz();
              }}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
            >
              Mulai Kuis Kustom ({customQuestions.length} Soal)
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
