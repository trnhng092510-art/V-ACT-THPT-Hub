import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  Send,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Maximize2,
  BookOpen,
} from 'lucide-react';
import { ExamOMRSubmission } from '../types';
import { StorageService } from '../services/storage';
import { formatTime } from '../utils/timer';
import confetti from 'canvas-confetti';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examTitle?: string;
  defaultMode?: 'thptqg' | 'vact';
  examDocumentUrl?: string;
}

export const ExamSplitScreenOMRModal: React.FC<Props> = ({
  isOpen,
  onClose,
  examTitle = 'Đề Thi Thử Tốt Nghiệp THPTQG 2026 (Cấu Trúc 3 Phần Mới)',
  defaultMode = 'thptqg',
  examDocumentUrl,
}) => {
  const [examMode, setExamMode] = useState<'thptqg' | 'vact'>(defaultMode);
  const [timeLeft, setTimeLeft] = useState(examMode === 'thptqg' ? 50 * 60 : 150 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(1);

  // --- Answers State ---
  // Part I: Question number -> 'A' | 'B' | 'C' | 'D'
  const [part1Answers, setPart1Answers] = useState<Record<number, string>>({});

  // Part II (THPTQG): Question number -> { a: 'true'|'false', b: ..., c: ..., d: ... }
  const [part2Answers, setPart2Answers] = useState<
    Record<number, Record<'a' | 'b' | 'c' | 'd', 'true' | 'false' | null>>
  >({
    1: { a: null, b: null, c: null, d: null },
    2: { a: null, b: null, c: null, d: null },
    3: { a: null, b: null, c: null, d: null },
    4: { a: null, b: null, c: null, d: null },
  });

  // Part III (THPTQG): Question number -> string
  const [part3Answers, setPart3Answers] = useState<Record<number, string>>({
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
    6: '',
  });

  // V-ACT answers: 120 questions ABCD
  const [vactAnswers, setVactAnswers] = useState<Record<number, string>>({});

  // Submission results modal
  const [resultModal, setResultModal] = useState<ExamOMRSubmission | null>(null);

  // Reset / switch mode
  const handleSwitchMode = (mode: 'thptqg' | 'vact') => {
    setExamMode(mode);
    setTimeLeft(mode === 'thptqg' ? 50 * 60 : 150 * 60);
    setIsTimerRunning(true);
    setActiveQuestion(1);
  };

  // Timer loop
  useEffect(() => {
    if (!isOpen || !isTimerRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning]);

  if (!isOpen) return null;

  const totalPart1Questions = examMode === 'thptqg' ? 24 : 120;

  const handleSelectPart1 = (qNum: number, choice: string) => {
    if (examMode === 'thptqg') {
      setPart1Answers((prev) => ({
        ...prev,
        [qNum]: prev[qNum] === choice ? '' : choice,
      }));
    } else {
      setVactAnswers((prev) => ({
        ...prev,
        [qNum]: prev[qNum] === choice ? '' : choice,
      }));
    }
  };

  const handleSelectPart2Item = (qNum: number, item: 'a' | 'b' | 'c' | 'd', val: 'true' | 'false') => {
    setPart2Answers((prev) => {
      const current = prev[qNum] || { a: null, b: null, c: null, d: null };
      return {
        ...prev,
        [qNum]: {
          ...current,
          [item]: current[item] === val ? null : val,
        },
      };
    });
  };

  const handlePart3Change = (qNum: number, val: string) => {
    setPart3Answers((prev) => ({
      ...prev,
      [qNum]: val,
    }));
  };

  // Count answered questions
  const answeredCount =
    examMode === 'thptqg'
      ? Object.values(part1Answers).filter(Boolean).length +
        Object.values(part2Answers).filter((q) => q.a !== null || q.b !== null || q.c !== null || q.d !== null).length +
        Object.values(part3Answers).filter((v) => v.trim().length > 0).length
      : Object.values(vactAnswers).filter(Boolean).length;

  const totalExamQuestions = examMode === 'thptqg' ? 24 + 4 + 6 : 120;

  // Grade & Submit
  const handleSubmitExam = () => {
    setIsTimerRunning(false);

    // Calculate score
    let calculatedScore = 0;
    const maxScore = examMode === 'thptqg' ? 10.0 : 1200;

    if (examMode === 'thptqg') {
      // Part I: 24 questions x 0.25 = 6.0 pts
      const p1Answered = Object.keys(part1Answers).length;
      calculatedScore += Math.min(6.0, p1Answered * 0.25);

      // Part II: 4 questions x 0.5 = 2.0 pts
      const p2Count = Object.values(part2Answers).filter((q) => q.a && q.b && q.c && q.d).length;
      calculatedScore += p2Count * 0.5;

      // Part III: 6 questions x 0.33 = 2.0 pts
      const p3Count = Object.values(part3Answers).filter((v) => v.trim().length > 0).length;
      calculatedScore += p3Count * (2.0 / 6);
      calculatedScore = Math.min(10, Math.round(calculatedScore * 10) / 10);
    } else {
      // V-ACT: 120 questions
      const ansCount = Object.keys(vactAnswers).length;
      calculatedScore = Math.round((ansCount / 120) * 1200);
    }

    const initialDuration = examMode === 'thptqg' ? 50 * 60 : 150 * 60;
    const submission: ExamOMRSubmission = {
      id: `omr-${Date.now()}`,
      examTitle,
      mode: examMode,
      totalQuestions: totalExamQuestions,
      score: calculatedScore,
      maxScore,
      answers: examMode === 'thptqg' ? part1Answers : vactAnswers,
      part2Answers: examMode === 'thptqg' ? part2Answers : undefined,
      part3Answers: examMode === 'thptqg' ? part3Answers : undefined,
      timeSpentSeconds: initialDuration - timeLeft,
      submittedAt: Date.now(),
    };

    StorageService.saveExamSubmission(submission);
    setResultModal(submission);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-200 overflow-hidden">
      {/* Top Split-Screen Control Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/95 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 shrink-0">
            🎯
          </div>
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
              <span>{examTitle}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {examMode === 'thptqg' ? 'THPTQG 2026' : 'V-ACT 120 CÂU'}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>Đã làm: <b className="text-white font-mono">{answeredCount}</b>/{totalExamQuestions} câu</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Phiếu OMR Tự Động Lưu</span>
            </div>
          </div>
        </div>

        {/* Center: Switch mode pills */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 text-xs font-semibold">
          <button
            type="button"
            onClick={() => handleSwitchMode('thptqg')}
            className={`px-3 py-1.5 rounded-lg transition ${
              examMode === 'thptqg' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Chuẩn THPTQG 2026
          </button>
          <button
            type="button"
            onClick={() => handleSwitchMode('vact')}
            className={`px-3 py-1.5 rounded-lg transition ${
              examMode === 'vact' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ĐHQG V-ACT (120 câu)
          </button>
        </div>

        {/* Right: Live Countdown & Submit Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 font-mono font-bold text-sm shadow-inner">
            <Clock className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>{formatTime(timeLeft, false)}</span>
          </div>

          <button
            type="button"
            onClick={handleSubmitExam}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Nộp Bài</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT PANEL (55% width): Question Paper Viewer */}
        <div className="flex-1 lg:w-[55%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-950/80 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-indigo-400">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Đề Bài & Ngữ Liệu Trực Tiếp</span>
            </div>
            <span className="text-[11px] text-slate-400">Cuộn để đọc toàn bộ câu hỏi</span>
          </div>

          {/* Sample Exam Content Paper */}
          <div className="space-y-6 text-sm text-slate-200 leading-relaxed font-sans">
            {examMode === 'thptqg' ? (
              <>
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                  <span className="font-bold text-indigo-300 block mb-1">CẤU TRÚC ĐỀ THI TỐT NGHIỆP THPT TỪ NĂM 2026:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li><b>Phần I:</b> Câu hỏi trắc nghiệm nhiều phương án lựa chọn (24 câu, 4 đáp án A-B-C-D).</li>
                    <li><b>Phần II:</b> Câu hỏi trắc nghiệm Đúng/Sai (4 câu, mỗi câu có 4 ý a-b-c-d độc lập).</li>
                    <li><b>Phần III:</b> Câu hỏi trắc nghiệm dạng trả lời ngắn (6 câu, tự điền kết quả vào ô số).</li>
                  </ul>
                </div>

                {/* Section I sample questions */}
                <div className="space-y-4">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-rose-400 border-l-2 border-rose-500 pl-2">
                    PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn (Thí sinh trả lời từ câu 1 đến câu 24)
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <p className="font-semibold text-white">Câu 1: Cho hàm số y = f(x) có đạo hàm f'(x) = x(x - 1)(x + 2)². Số điểm cực trị của hàm số đã cho là:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>A. 3</div>
                      <div>B. 2</div>
                      <div>C. 1</div>
                      <div>D. 4</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <p className="font-semibold text-white">Câu 2: Trong không gian Oxyz, mặt cầu (S): (x - 1)² + (y + 2)² + (z - 3)² = 16 có bán kính là:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>A. R = 4</div>
                      <div>B. R = 16</div>
                      <div>C. R = 8</div>
                      <div>D. R = 2</div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <p className="font-semibold text-white">Câu 3: Một tổ có 6 học sinh nam và 4 học sinh nữ. Chọn ngẫu nhiên 3 học sinh. Xác suất để chọn được ít nhất một học sinh nữ là:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div>A. 5/6</div>
                      <div>B. 1/6</div>
                      <div>C. 4/5</div>
                      <div>D. 2/3</div>
                    </div>
                  </div>
                </div>

                {/* Section II sample questions */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 border-l-2 border-amber-500 pl-2">
                    PHẦN II. Câu trắc nghiệm Đúng/Sai (Thí sinh chọn Đúng hoặc Sai cho mỗi ý a, b, c, d)
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-3">
                    <p className="font-semibold text-white">Câu 1: Cho hàm số y = (2x + 1) / (x - 1). Xét tính đúng sai của các mệnh đề sau:</p>
                    <div className="space-y-1.5 text-xs text-slate-300">
                      <p>a) Đồ thị hàm số có tiệm cận đứng là đường thẳng x = 1.</p>
                      <p>b) Đồ thị hàm số có tiệm cận ngang là đường thẳng y = 2.</p>
                      <p>c) Hàm số đồng biến trên từng khoảng xác định (-∞; 1) và (1; +∞).</p>
                      <p>d) Giao điểm của hai đường tiệm cận là điểm I(1; 2).</p>
                    </div>
                  </div>
                </div>

                {/* Section III sample questions */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 border-l-2 border-emerald-500 pl-2">
                    PHẦN III. Câu trắc nghiệm trả lời ngắn (Thí sinh điền kết quả vào ô trả lời)
                  </h3>

                  <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                    <p className="font-semibold text-white">Câu 1: Một mảnh vườn hình chữ nhật có chu vi 100m. Diện tích lớn nhất của mảnh vườn đó bằng bao nhiêu mét vuông?</p>
                    <p className="text-xs text-slate-400 italic">Hướng dẫn: Điền số nguyên vào ô tương ứng ở phiếu trả lời bên phải.</p>
                  </div>
                </div>
              </>
            ) : (
              /* V-ACT 120 Questions Mode */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/20 text-xs">
                  <span className="font-bold text-blue-300 block mb-1">CẤU TRÚC BÀI THI ĐÁNH GIÁ NĂNG LỰC ĐHQG TP.HCM (V-ACT):</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    <li><b>Phần 1 (Câu 1 - 60):</b> Sử dụng ngôn ngữ (30 câu Tiếng Việt + 30 câu Tiếng Anh).</li>
                    <li><b>Phần 2 (Câu 61 - 90):</b> Toán học, tư duy logic và phân tích số liệu.</li>
                    <li><b>Phần 3 (Câu 91 - 120):</b> Giải quyết vấn đề (Hóa, Lý, Sinh, Sử, Địa, Môi trường).</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                  <p className="font-semibold text-white">Câu 1 (Tiếng Việt): Từ nào sau đây viết ĐÚNG chính tả?</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>A. Giành giật</div>
                    <div>B. Dành giật</div>
                    <div>C. Giành dật</div>
                    <div>D. Dành dật</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/5 space-y-2">
                  <p className="font-semibold text-white">Câu 61 (Logic suy luận): Trong một cuộc thi chạy có 5 bạn A, B, C, D, E. Biết A không về nhất, B về trước C, D về ngay sau E và C về trước E. Bạn nào về nhất?</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                    <div>A. Bạn B</div>
                    <div>B. Bạn A</div>
                    <div>C. Bạn D</div>
                    <div>D. Bạn E</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL (45% width): Interactive OMR Bubble Sheet */}
        <div className="flex-1 lg:w-[45%] flex flex-col bg-slate-900/90 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-emerald-400">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Phiếu Trả Lời Trắc Nghiệm Ảo</span>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              {answeredCount}/{totalExamQuestions} Hoàn thành
            </span>
          </div>

          {/* OMR Grid Render */}
          {examMode === 'thptqg' ? (
            <div className="space-y-6">
              {/* PHẦN I: ABCD */}
              <div>
                <h4 className="font-bold text-xs text-rose-300 uppercase tracking-wider mb-3">
                  PHẦN I: Trắc Nghiệm 4 Đáp Án (1 - 24)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((qNum) => {
                    const sel = part1Answers[qNum];
                    return (
                      <div
                        key={qNum}
                        className={`p-2 rounded-xl flex items-center justify-between border transition ${
                          sel ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-950/40 border-white/5'
                        }`}
                      >
                        <span className="font-bold text-slate-300 font-mono w-7">#{qNum}</span>
                        <div className="flex items-center gap-1.5">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectPart1(qNum, opt)}
                              className={`w-7 h-7 rounded-full text-xs font-bold transition flex items-center justify-center ${
                                sel === opt
                                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30 ring-2 ring-rose-400'
                                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PHẦN II: Đúng / Sai */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-wider mb-3">
                  PHẦN II: Trắc Nghiệm Đúng/Sai (4 Câu)
                </h4>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((qNum) => (
                    <div key={qNum} className="p-3 rounded-2xl bg-slate-950/50 border border-white/5 space-y-2 text-xs">
                      <span className="font-bold text-amber-400 font-mono">Câu {qNum}:</span>
                      <div className="grid grid-cols-2 gap-2">
                        {(['a', 'b', 'c', 'd'] as const).map((item) => {
                          const val = part2Answers[qNum]?.[item];
                          return (
                            <div key={item} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-white/5">
                              <span className="font-bold text-slate-300 uppercase pl-1">{item})</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSelectPart2Item(qNum, item, 'true')}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                    val === 'true' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  Đúng
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSelectPart2Item(qNum, item, 'false')}
                                  className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                                    val === 'false' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  Sai
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PHẦN III: Trả Lời Ngắn */}
              <div className="pt-4 border-t border-white/10">
                <h4 className="font-bold text-xs text-emerald-300 uppercase tracking-wider mb-3">
                  PHẦN III: Trả Lời Ngắn (6 Câu)
                </h4>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  {[1, 2, 3, 4, 5, 6].map((qNum) => (
                    <div key={qNum} className="p-2.5 rounded-xl bg-slate-950/50 border border-white/5 flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-400 font-mono">#{qNum}</span>
                      <input
                        type="text"
                        placeholder="Điền kết quả..."
                        value={part3Answers[qNum] || ''}
                        onChange={(e) => handlePart3Change(qNum, e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg glass-input text-white border border-white/10 font-mono text-center font-bold text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* V-ACT 120 Questions Grid */
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-blue-300 uppercase tracking-wider">
                120 CÂU TRẮC NGHIỆM ĐGNL V-ACT
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Array.from({ length: 120 }, (_, i) => i + 1).map((qNum) => {
                  const sel = vactAnswers[qNum];
                  return (
                    <div
                      key={qNum}
                      className={`p-1.5 px-2 rounded-xl flex items-center justify-between border transition ${
                        sel ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-950/40 border-white/5'
                      }`}
                    >
                      <span className="font-bold text-slate-300 font-mono w-7 text-[11px]">#{qNum}</span>
                      <div className="flex items-center gap-1">
                        {['A', 'B', 'C', 'D'].map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleSelectPart1(qNum, opt)}
                            className={`w-6 h-6 rounded-full text-[11px] font-bold transition flex items-center justify-center ${
                              sel === opt
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30 ring-1 ring-indigo-400'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pop-up Results Modal */}
      {resultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-center text-slate-100 shadow-2xl border border-white/15 relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-xl shadow-emerald-500/25">
              🏆
            </div>

            <h3 className="text-xl font-extrabold text-white mb-1">Chúc Mừng Bạn Đã Hoàn Thành!</h3>
            <p className="text-xs text-slate-400 mb-6">{resultModal.examTitle}</p>

            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 my-4 space-y-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-300">Điểm số ước tính:</span>
              <div className="font-mono text-4xl sm:text-5xl font-black text-emerald-400">
                {resultModal.score} <span className="text-sm text-slate-400">/ {resultModal.maxScore}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Thời gian làm bài: <b>{formatTime(resultModal.timeSpentSeconds, false)}</b>
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  setResultModal(null);
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
              >
                Trở Về Không Gian Học Tập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
