import * as XLSX from 'xlsx';
import { Competitor, AnswerLog, Question, GameMode } from '../types';

interface ExportQuizResultsOptions {
  quizTitle: string;
  competitors: Competitor[];
  questions: Question[];
  humanAnswerLogs: AnswerLog[];
  timePerQuestion: number;
  gameMode?: GameMode;
}

export function exportQuizResultsToExcel({
  quizTitle,
  competitors,
  questions,
  humanAnswerLogs,
  timePerQuestion,
  gameMode = 'classic',
}: ExportQuizResultsOptions) {
  // 1. Sort all competitors by score descending to get accurate ranking
  const rankedCompetitors = [...competitors].sort((a, b) => b.score - a.score);
  const totalQuestions = questions.length;
  const maxScore = Math.max(...competitors.map((c) => c.score), 1000);

  // Process data for each student
  const studentRows = rankedCompetitors.map((comp, idx) => {
    const rank = idx + 1;
    let correct = 0;
    let wrong = 0;
    let avgTimeSec = 0;

    if (comp.isHuman) {
      correct = humanAnswerLogs.filter((l) => l.isCorrect).length;
      wrong = totalQuestions - correct;
      const totalTimeMs = humanAnswerLogs.reduce((acc, curr) => acc + curr.timeSpentMs, 0);
      avgTimeSec = totalQuestions > 0 ? Number((totalTimeMs / (totalQuestions * 1000)).toFixed(1)) : 0;
    } else {
      if (comp.answers && comp.answers.length > 0) {
        correct = comp.answers.filter((a) => a.isCorrect).length;
        wrong = totalQuestions - correct;
        const totalTime = comp.answers.reduce((acc, a) => acc + a.timeSpentMs, 0);
        avgTimeSec = Number((totalTime / (comp.answers.length * 1000)).toFixed(1));
      } else {
        correct = Math.round(comp.accuracyRate * totalQuestions);
        wrong = totalQuestions - correct;
        avgTimeSec = Number((timePerQuestion * 0.6 * comp.speedWeight).toFixed(1));
      }
    }

    const accuracyPercent = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const score100 = totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;
    const isPassed = score100 >= 75; // KKM Standar 75
    const predikat =
      score100 >= 90
        ? 'A (Sangat Baik)'
        : score100 >= 80
        ? 'B (Baik)'
        : score100 >= 70
        ? 'C (Cukup)'
        : 'D (Perlu Bimbingan)';

    const teamLabel =
      comp.team === 'left'
        ? 'Tim Kiri (Garuda)'
        : comp.team === 'right'
        ? 'Tim Kanan (Harimau)'
        : idx % 2 === 0
        ? 'Tim Kiri (Garuda)'
        : 'Tim Kanan (Harimau)';

    const altitudeMeters =
      comp.altitudeMeters ||
      Math.min(3676, Math.round((comp.score / (maxScore || 1)) * 3676));

    return {
      no: idx + 1,
      name: comp.name,
      rank,
      score100,
      totalScore: comp.score,
      correct,
      wrong,
      accuracyPercent,
      avgTimeSec,
      status: isPassed ? 'TUNTAS' : 'BELUM TUNTAS',
      predikat,
      isHuman: comp.isHuman,
      answers: comp.answers || [],
      teamLabel,
      altitudeMeters,
    };
  });

  // Calculate classroom aggregates
  const totalStudents = studentRows.length;
  const avgClassScore100 =
    totalStudents > 0
      ? Number((studentRows.reduce((acc, s) => acc + s.score100, 0) / totalStudents).toFixed(1))
      : 0;
  const avgClassScorePts =
    totalStudents > 0
      ? Math.round(studentRows.reduce((acc, s) => acc + s.totalScore, 0) / totalStudents)
      : 0;
  const passedCount = studentRows.filter((s) => s.status === 'TUNTAS').length;
  const passedPercent = totalStudents > 0 ? Math.round((passedCount / totalStudents) * 100) : 0;
  const highestScore = Math.max(...studentRows.map((s) => s.totalScore));
  const lowestScore = Math.min(...studentRows.map((s) => s.totalScore));

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // -------------------------------------------------------------
  // SHEET 1: REKAP NILAI SISWA
  // -------------------------------------------------------------
  const sheet1Data: (string | number)[][] = [
    ['LAPORAN HASIL ASESMEN KUIS KELAS INTERAKTIF'],
    ['Sistem Papan Peringkat & Evaluasi Pembelajaran Siswa'],
    [''],
    ['Informasi Asesmen:', ''],
    ['Nama Paket Kuis', quizTitle],
    ['Tanggal Pelaksanaan', `${dateStr}, Pukul ${timeStr} WIB`],
    ['Jumlah Peserta Didik', `${totalStudents} Siswa`],
    ['Jumlah Soal', `${totalQuestions} Butir Soal`],
    ['Standar Ketuntasan Minimal (KKM)', '75 (Skala 100)'],
    [''],
    ['Ringkasan Statistik Kelas:', ''],
    ['Mode Kuis Dimainkan', gameMode === 'tug_of_war' ? 'Tarik Tambang (2 Tim Kiri vs Kanan)' : gameMode === 'mountain_climb' ? 'Naik Gunung Mahameru 3.676m' : 'Klasik Leaderboard'],
    ['Rata-rata Nilai (Skala 100)', avgClassScore100],
    ['Rata-rata Skor Poin Kuis', `${avgClassScorePts.toLocaleString('id-ID')} pts`],
    ['Jumlah Siswa Tuntas', `${passedCount} dari ${totalStudents} Siswa (${passedPercent}%)`],
    ['Jumlah Siswa Belum Tuntas', `${totalStudents - passedCount} Siswa`],
    ['Skor Tertinggi Kelas', `${highestScore.toLocaleString('id-ID')} pts`],
    ['Skor Terendah Kelas', `${lowestScore.toLocaleString('id-ID')} pts`],
    [''],
    [
      'No',
      'Peringkat',
      'Nama Siswa',
      'Tim (Tarik Tambang)',
      'Ketinggian (MDPL)',
      'Nilai (Skala 100)',
      'Total Poin Kuis (pts)',
      'Jawaban Benar',
      'Jawaban Salah',
      'Akurasi (%)',
      'Waktu Rata-rata (Detik)',
      'Status KKM (75)',
      'Predikat Capaian',
      'Keterangan Peserta',
    ],
  ];

  studentRows.forEach((s) => {
    sheet1Data.push([
      s.no,
      `#${s.rank}`,
      s.name,
      s.teamLabel,
      `${s.altitudeMeters} MDPL`,
      s.score100,
      s.totalScore,
      s.correct,
      s.wrong,
      `${s.accuracyPercent}%`,
      s.avgTimeSec,
      s.status,
      s.predikat,
      s.isHuman ? 'Pemain Utama' : 'Siswa Kelas',
    ]);
  });

  // -------------------------------------------------------------
  // SHEET 2: ANALISIS BUTIR SOAL
  // -------------------------------------------------------------
  const sheet2Data: (string | number)[][] = [
    ['ANALISIS BUTIR SOAL & TINGKAT KETERCAPAIAN MATERI'],
    ['Kuis: ' + quizTitle + ' - ' + dateStr],
    [''],
    [
      'No Soal',
      'Pertanyaan',
      'Kunci Jawaban Benar',
      'Jumlah Siswa Menjawab Benar',
      'Jumlah Siswa Menjawab Salah',
      'Persentase Menjawab Benar (%)',
      'Tingkat Kesulitan',
      'Rekomendasi Tindak Lanjut Guru',
    ],
  ];

  questions.forEach((q, qIdx) => {
    let correctCountForQ = 0;

    studentRows.forEach((s) => {
      if (s.isHuman) {
        const log = humanAnswerLogs[qIdx];
        if (log && log.isCorrect) correctCountForQ++;
      } else {
        const ans = s.answers.find((a) => a.questionId === q.id);
        if (ans ? ans.isCorrect : Math.random() < 0.75) {
          correctCountForQ++;
        }
      }
    });

    const wrongCountForQ = totalStudents - correctCountForQ;
    const correctPct = totalStudents > 0 ? Math.round((correctCountForQ / totalStudents) * 100) : 0;

    let difficultyLabel = 'Sedang';
    let recommendation = 'Tingkat ketercapaian memadai, pertahankan pemahaman materi.';
    if (correctPct >= 80) {
      difficultyLabel = 'Mudah';
      recommendation = 'Materi telah dikuasai dengan sangat baik oleh mayoritas siswa kelas.';
    } else if (correctPct < 50) {
      difficultyLabel = 'Sulit';
      recommendation = 'Materi perlu dilakukan pembahasan ulang (remedial teaching) di kelas.';
    }

    sheet2Data.push([
      `Soal #${qIdx + 1}`,
      q.question,
      q.options[q.correctIndex] || '-',
      correctCountForQ,
      wrongCountForQ,
      `${correctPct}%`,
      difficultyLabel,
      recommendation,
    ]);
  });

  // -------------------------------------------------------------
  // SHEET 3: MATRIKS JAWABAN SISWA
  // -------------------------------------------------------------
  const matrixHeader: (string | number)[] = [
    'No',
    'Nama Siswa',
    'Peringkat',
    'Nilai (100)',
    ...questions.map((_, i) => `Soal #${i + 1}`),
  ];

  const sheet3Data: (string | number)[][] = [
    ['MATRIKS DETAIL JAWABAN SISWA PER BUTIR SOAL'],
    ['Keterangan: [V] = Jawaban Benar, [X] = Jawaban Salah / Waktu Habis'],
    [''],
    matrixHeader,
  ];

  studentRows.forEach((s) => {
    const rowAnswers: string[] = questions.map((q, qIdx) => {
      if (s.isHuman) {
        const log = humanAnswerLogs[qIdx];
        if (!log) return '-';
        return log.isCorrect ? 'V (Benar)' : 'X (Salah)';
      } else {
        const ans = s.answers.find((a) => a.questionId === q.id);
        if (ans) {
          return ans.isCorrect ? 'V (Benar)' : 'X (Salah)';
        }
        return 'V (Benar)';
      }
    });

    sheet3Data.push([s.no, s.name, `#${s.rank}`, s.score100, ...rowAnswers]);
  });

  // Create Workbook
  const workbook = XLSX.utils.book_new();

  const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);

  // Set column widths for readability
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 12 },
    { wch: 26 },
    { wch: 16 },
    { wch: 22 },
    { wch: 15 },
    { wch: 15 },
    { wch: 14 },
    { wch: 22 },
    { wch: 18 },
    { wch: 20 },
    { wch: 18 },
  ];

  ws2['!cols'] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 25 },
    { wch: 18 },
    { wch: 55 },
  ];

  ws3['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 12 },
    { wch: 14 },
    ...questions.map(() => ({ wch: 14 })),
  ];

  XLSX.utils.book_append_sheet(workbook, ws1, 'Rekap Nilai Siswa');
  XLSX.utils.book_append_sheet(workbook, ws2, 'Analisis Butir Soal');
  XLSX.utils.book_append_sheet(workbook, ws3, 'Matriks Jawaban Siswa');

  // Format file name
  const cleanTitle = quizTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const safeDate = now.toISOString().split('T')[0];
  const fileName = `Laporan_Hasil_Kuis_${cleanTitle}_${safeDate}.xlsx`;

  XLSX.writeFile(workbook, fileName);
  return fileName;
}
