import React, { useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  Plus,
  X,
  Lightbulb,
  BookOpen,
  Trash2,
} from 'lucide-react';
import { Flashcard } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  onOpenCardCreator?: () => void;
}

export const FlashcardsWidget: React.FC<Props> = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => StorageService.getFlashcards());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Card Form
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newTip, setNewTip] = useState('');
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newTopic, setNewTopic] = useState('');
  const [newGradient, setNewGradient] = useState('from-indigo-600 to-blue-700');

  const filteredCards = selectedSubject === 'all'
    ? flashcards
    : flashcards.filter((c) => c.subject === selectedSubject);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    if (filteredCards.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (filteredCards.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    if (filteredCards.length <= 1) return;
    const rand = Math.floor(Math.random() * filteredCards.length);
    setCurrentIndex(rand);
  };

  const handleToggleMastered = () => {
    if (!currentCard) return;
    StorageService.toggleMasterFlashcard(currentCard.id);
    setFlashcards(StorageService.getFlashcards());
  };

  const handleSaveCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const user = StorageService.getCurrentUser();
    const card: Flashcard = {
      id: `fc-${Date.now()}`,
      subject: newSubject,
      topic: newTopic.trim() || 'Trọng tâm 2026',
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      tip: newTip.trim() || undefined,
      gradient: newGradient,
      difficulty: 'medium',
      contributedBy: user?.displayName || 'Sĩ tử StudyHub',
    };

    StorageService.saveFlashcard(card);
    const updated = StorageService.getFlashcards();
    setFlashcards(updated);
    setShowAddModal(false);
    setNewQuestion('');
    setNewAnswer('');
    setNewTip('');
    setNewTopic('');
  };

  const subjects = ['all', 'Toán học', 'Vật lý', 'Hóa học', 'Sinh học', 'Ngữ văn', 'Tiếng Anh', 'ĐGNL V-ACT'];

  return (
    <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-white/10 space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white flex items-center gap-2">
              <span>⚡ Kho Flashcard 3D Nhớ Nhanh</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                Formula & Vocabulary
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Lật thẻ 3D ghi nhớ công thức, từ vựng và phương pháp giải nhanh
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tạo Flashcard</span>
        </button>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setSelectedSubject(s);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition font-medium ${
              selectedSubject === s
                ? 'bg-white text-slate-950 font-bold shadow'
                : 'bg-slate-900/60 text-slate-300 hover:text-white border border-white/5'
            }`}
          >
            {s === 'all' ? 'Tất cả môn' : s}
          </button>
        ))}
      </div>

      {/* 3D Perspective Flip Container */}
      {currentCard ? (
        <div className="flex flex-col items-center justify-center py-2">
          <div
            className="w-full max-w-xl h-64 sm:h-72 cursor-pointer perspective-1000 select-none"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className={`relative w-full h-full duration-500 rounded-3xl transition-transform ${
                isFlipped ? '[transform:rotateY(180deg)]' : ''
              }`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRONT SIDE (Question) */}
              <div
                className={`absolute inset-0 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br ${currentCard.gradient} text-white shadow-2xl border border-white/20`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-white/20 text-white font-bold text-xs backdrop-blur-md">
                      {currentCard.subject}
                    </span>
                    <span className="text-xs text-white/80 font-medium">{currentCard.topic}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/70">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        StorageService.deleteFlashcard(currentCard.id);
                        setFlashcards(StorageService.getFlashcards());
                        setCurrentIndex(0);
                      }}
                      className="p-1.5 rounded-lg bg-black/25 hover:bg-rose-500/80 text-white/80 hover:text-white transition"
                      title="Xóa thẻ Flashcard này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="my-auto text-center px-2">
                  <span className="text-xs text-white/80 uppercase tracking-widest block mb-2 font-bold">
                    CÂU HỎI / CÔNG THỨC:
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold leading-snug drop-shadow-md">
                    {currentCard.question}
                  </h4>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nhấn để xem đáp án</span>
                  </span>
                  {currentCard.contributedBy && (
                    <span>Tạo bởi: {currentCard.contributedBy}</span>
                  )}
                </div>
              </div>

              {/* BACK SIDE (Answer & Tip) */}
              <div
                className="absolute inset-0 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-slate-900 text-white shadow-2xl border border-indigo-500/40 [transform:rotateY(180deg)]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30">
                    ĐÁP ÁN & GIẢI THÍCH
                  </span>
                  <span className="text-xs text-slate-400">
                    {currentIndex + 1} / {filteredCards.length}
                  </span>
                </div>

                <div className="my-auto text-center px-2 space-y-3">
                  <div className="text-base sm:text-lg font-bold text-emerald-300 leading-relaxed font-mono">
                    {currentCard.answer}
                  </div>
                  {currentCard.tip && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs text-left">
                      <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>{currentCard.tip}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Nhấn để lật lại câu hỏi</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMastered();
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                      currentCard.mastered
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-white/10 text-white hover:bg-white/15'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{currentCard.mastered ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10"
              title="Thẻ trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              className="px-4 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white transition border border-white/10 text-xs font-semibold flex items-center gap-1.5"
              title="Xáo trộn ngẫu nhiên"
            >
              <Shuffle className="w-4 h-4" />
              <span>Ngẫu nhiên</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow shadow-indigo-500/25"
              title="Thẻ tiếp theo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-slate-400">
          Chưa có thẻ flashcard nào trong mục này. Bấm "+ Tạo Flashcard" để thêm ngay!
        </div>
      )}

      {/* Pop-up Add Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-white/15 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>+ Thêm Flashcard Kiến Thức Mới</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCard} className="my-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Môn học:</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                  >
                    <option value="Toán học">Toán học</option>
                    <option value="Vật lý">Vật lý</option>
                    <option value="Hóa học">Hóa học</option>
                    <option value="Sinh học">Sinh học</option>
                    <option value="Ngữ văn">Ngữ văn</option>
                    <option value="Tiếng Anh">Tiếng Anh</option>
                    <option value="ĐGNL V-ACT">ĐGNL V-ACT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Chủ đề:</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="VD: Khảo sát hàm số, Từ vựng..."
                    className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mặt trước (Câu hỏi / Công thức): (*)</label>
                <textarea
                  rows={2}
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Nhập câu hỏi cần ôn tập..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mặt sau (Đáp án chính xác): (*)</label>
                <textarea
                  rows={2}
                  value={newAnswer}
                  onChange={(e) => setNewAnswer(e.target.value)}
                  placeholder="Nhập đáp án hoặc công thức đầy đủ..."
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mẹo nhớ nhanh (Tip ghi nhớ):</label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="Mẹo nhớ mẹo bấm máy hoặc ví dụ..."
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Màu sắc thẻ (Gradient):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Lam Tím', val: 'from-indigo-600 to-blue-700' },
                    { label: 'Cyan Xanh', val: 'from-cyan-600 to-teal-700' },
                    { label: 'Hổ Phách', val: 'from-amber-500 to-orange-600' },
                    { label: 'Hồng Tím', val: 'from-purple-600 to-pink-600' },
                  ].map((g) => (
                    <button
                      key={g.val}
                      type="button"
                      onClick={() => setNewGradient(g.val)}
                      className={`h-8 rounded-xl bg-gradient-to-r ${g.val} text-[10px] font-bold text-white transition border ${
                        newGradient === g.val ? 'ring-2 ring-white scale-105' : 'border-white/10 opacity-70'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 shadow"
                >
                  Lưu Flashcard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
