import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Palette,
  Flame,
  BookOpen,
  ArrowRight,
  Sparkles,
  Target,
  Edit2,
  Clock,
  Layers,
  GraduationCap,
  MessageSquare,
  Heart,
  Star,
  Send,
  X,
  Trophy,
  Share2,
  Trash2,
  Gamepad2,
  BookMarked,
  Calculator,
} from 'lucide-react';
import {
  BackgroundConfig,
  DashboardWidget,
  ExamCountdownConfig,
  MicroUIConfig,
  WishNote,
} from '../types';
import { calculateCountdown } from '../utils/timer';
import { THPTQG_SUBJECTS, VACT_PARTS } from '../data/initialData';
import { StorageService } from '../services/storage';
import { DailyTasksWidget } from './DailyTasksWidget';
import { FlashcardsWidget } from './FlashcardsWidget';

interface Props {
  widgets: DashboardWidget[];
  isAdmin: boolean;
  countdownConfig: ExamCountdownConfig;
  microUIConfig: MicroUIConfig;
  onOpenWidgetEditor: (widget?: DashboardWidget) => void;
  onNavigateToTab: (tab: any) => void;
  bgConfig: BackgroundConfig;
  onOpenBgEditor: () => void;
  onOpenAdminStudio?: () => void;
  onOpenPomodoro?: () => void;
  onOpenExamOMR?: (title?: string, mode?: 'thptqg' | 'vact') => void;
  onOpenArcade?: () => void;
  onOpenPersonalization?: () => void;
  onOpenMistakeNotebook?: (tab?: 'mistakes' | 'bookmarks') => void;
  onOpenScoreCalculator?: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardView: React.FC<Props> = ({
  widgets,
  isAdmin,
  countdownConfig,
  microUIConfig,
  onOpenWidgetEditor,
  onNavigateToTab,
  bgConfig,
  onOpenBgEditor,
  onOpenAdminStudio,
  onOpenPomodoro,
  onOpenExamOMR,
  onOpenArcade,
  onOpenPersonalization,
  onOpenMistakeNotebook,
  onOpenScoreCalculator,
  theme = 'dark',
}) => {
  const [wishNotes, setWishNotes] = useState<WishNote[]>(() => StorageService.getWishNotes());
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState('');
  const [newGoal, setNewGoal] = useState('');
  const [newUni, setNewUni] = useState('');
  const [newScore, setNewScore] = useState('');
  const [newColor, setNewColor] = useState<WishNote['color']>('amber');

  React.useEffect(() => {
    const unsub = StorageService.subscribe((type) => {
      if (type === 'WISH_NOTES_CHANGED') {
        setWishNotes(StorageService.getWishNotes());
      }
    });
    return unsub;
  }, []);
  const bgStyle: React.CSSProperties = {
    background:
      bgConfig.type === 'solid' || bgConfig.type === 'gradient'
        ? bgConfig.value
        : `url('${bgConfig.value}') center/cover no-repeat fixed`,
  };

  const thptCountdown = calculateCountdown(countdownConfig.thptqgDate);
  const vactCountdown = calculateCountdown(countdownConfig.vactDate);

  const cardCustomStyle: React.CSSProperties = {
    borderRadius: `${microUIConfig.borderRadius}px`,
    borderWidth: `${microUIConfig.borderWidth}px`,
    backgroundColor: microUIConfig.cardBgColor,
    backdropFilter: `blur(${microUIConfig.blurAmount}px)`,
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] pt-6 pb-24 px-4 sm:px-8 transition-colors duration-500 relative"
      style={bgStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: bgConfig.overlayOpacity ?? 0.1,
          backdropFilter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : 'none',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header & Admin bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Bàn học & Tổng quan Luyện thi</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v5.0 Coin & Arcade
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Chiến lược phân bổ thời gian, tài liệu cập nhật, tích lũy S-Coin và mục tiêu kỳ thi THPTQG & V-ACT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenArcade && (
              <button
                type="button"
                onClick={onOpenArcade}
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-400 hover:to-pink-400 text-slate-950 flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>🎁 Điểm Danh & Săn Coin (Minigame)</span>
              </button>
            )}
            {onOpenPomodoro && (
              <button
                type="button"
                onClick={onOpenPomodoro}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition shadow"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏱️ Pomodoro & Âm Thanh Trắng</span>
              </button>
            )}
            {onOpenExamOMR && (
              <button
                type="button"
                onClick={() => onOpenExamOMR('Đề thi thử Toán THPTQG 2026 - Chuẩn cấu trúc mới', 'thptqg')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1.5 transition shadow"
              >
                <Target className="w-3.5 h-3.5" />
                <span>🎯 Làm bài bấm giờ (Mở phiếu trả lời)</span>
              </button>
            )}
            {onOpenMistakeNotebook && (
              <button
                type="button"
                onClick={() => onOpenMistakeNotebook('mistakes')}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 transition shadow"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>📓 Sổ Tay Lỗi Sai & Tủ Đề Riêng Tư</span>
              </button>
            )}
            {onOpenScoreCalculator && (
              <button
                type="button"
                onClick={onOpenScoreCalculator}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition shadow"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>🧮 Máy Tính Điểm Xét Tuyển ĐH</span>
              </button>
            )}
            {onOpenPersonalization && (
              <button
                type="button"
                onClick={onOpenPersonalization}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ Cá Nhân Hóa Giao Diện</span>
              </button>
            )}
            {isAdmin && (
              <>
                {onOpenAdminStudio && (
                  <button
                    type="button"
                    onClick={onOpenAdminStudio}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 flex items-center gap-1.5 transition shadow"
                  >
                    👑 Admin Studio
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenBgEditor}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                >
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>🎨 Đổi nền</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenWidgetEditor()}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm mục</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Exam Countdowns Grid (THPTQG & V-ACT) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* THPTQG Countdown Card */}
          <div
            className="rounded-2xl p-5 border border-indigo-500/30 bg-indigo-950/20 shadow-lg relative"
            style={cardCustomStyle}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{countdownConfig.thptqgTitle}</h3>
                  <span className="text-[10px] text-slate-400 block">{countdownConfig.thptqgDesc}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mt-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-indigo-400">
                  {thptCountdown.days}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ngày</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">
                  {thptCountdown.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Giờ</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-pink-400">
                  {thptCountdown.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Phút</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                  {thptCountdown.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Giây</span>
              </div>
            </div>
          </div>

          {/* V-ACT Countdown Card */}
          <div
            className="rounded-2xl p-5 border border-violet-500/30 bg-violet-950/20 shadow-lg relative"
            style={cardCustomStyle}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{countdownConfig.vactTitle}</h3>
                  <span className="text-[10px] text-slate-400 block">{countdownConfig.vactDesc}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center mt-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-violet-400">
                  {vactCountdown.days}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Ngày</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-fuchsia-400">
                  {vactCountdown.hours.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Giờ</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-pink-400">
                  {vactCountdown.minutes.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Phút</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                  {vactCountdown.seconds.toString().padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Giây</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= 4 TÍNH NĂNG EDTECH ĐỘT PHÁ (v4.1) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 5 Cols: Daily Study Tasks & Streak */}
          <div className="lg:col-span-5">
            <DailyTasksWidget />
          </div>

          {/* Right 7 Cols: 3D Flip Flashcards */}
          <div className="lg:col-span-7">
            <FlashcardsWidget />
          </div>
        </div>

        {/* Q&A Forum Highlight Banner Card */}
        <div
          onClick={() => onNavigateToTab('forum')}
          className="rounded-2xl p-5 border border-purple-500/30 bg-gradient-to-r from-purple-950/30 via-indigo-950/30 to-pink-950/20 shadow-xl cursor-pointer hover:border-purple-400/60 transition group flex flex-col sm:flex-row items-center justify-between gap-4"
          style={cardCustomStyle}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/25 group-hover:scale-105 transition">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition">
                  💬 Góc Hỏi Bài & Giải Đáp Sĩ Tử 2026
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  Mới
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Đăng bài tập khó kèm ảnh, xem lời giải được Admin ghim và bình luận thả kho Sticker dễ thương.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition"
          >
            <span>Vào góc hỏi bài</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Other Custom Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.filter((w) => w.type !== 'countdown').map((widget) => (
            <div
              key={widget.id}
              className={`relative rounded-2xl p-5 border transition-all duration-300 shadow-lg ${
                widget.gridSpan === 'full' ? 'md:col-span-2' : 'col-span-1'
              } ${widget.color || 'glass-panel'}`}
              style={cardCustomStyle}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    {widget.type === 'announcement' ? (
                      <Flame className="w-5 h-5 text-amber-400" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">{widget.title}</h3>
                    {widget.badge && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {widget.badge}
                      </span>
                    )}
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenWidgetEditor(widget);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition"
                      title="Sửa mục này"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        StorageService.deleteWidget(widget.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-900/60 hover:bg-rose-500/30 text-rose-400 hover:text-rose-200 transition"
                      title="Xóa mục này ngay"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2 whitespace-pre-line">
                {widget.content}
              </p>
            </div>
          ))}
        </div>

        {/* ================= 🌈 BẢNG QUYẾT TÂM & NGUYỆN ƯỚC ĐA SẮC ================= */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Góc Nguyện Ước Sĩ Tử 2026</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white flex items-center gap-2">
                <span>🌈 Bảng Quyết Tâm & Nguyện Ước Đa Sắc</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {wishNotes.length} Lời hứa
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Mỗi mảnh giấy là một lời hứa với chính mình. Dán mục tiêu trường ĐH mơ ước và cùng nhau tiếp thêm động lực!
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsWishModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-extrabold text-xs shadow-lg shadow-pink-500/25 flex items-center gap-2 transition self-start sm:self-auto hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>+ Dán giấy ước nguyện</span>
            </button>
          </div>

          {/* Sticky Notes Masonry/Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {wishNotes.map((note, index) => {
              const rotationClasses = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', 'rotate-0'];
              const rotation = rotationClasses[index % rotationClasses.length];

              const colorStyles: Record<WishNote['color'], { bg: string; border: string; text: string; badge: string; heart: string }> = {
                yellow: {
                  bg: 'bg-gradient-to-br from-amber-100 to-yellow-200 text-slate-900',
                  border: 'border-amber-300',
                  text: 'text-amber-950',
                  badge: 'bg-amber-300/80 text-amber-950 font-bold',
                  heart: 'text-amber-700 hover:text-rose-600',
                },
                pink: {
                  bg: 'bg-gradient-to-br from-pink-100 to-rose-200 text-slate-900',
                  border: 'border-pink-300',
                  text: 'text-pink-950',
                  badge: 'bg-pink-300/80 text-pink-950 font-bold',
                  heart: 'text-rose-700 hover:text-rose-600',
                },
                emerald: {
                  bg: 'bg-gradient-to-br from-emerald-100 to-teal-200 text-slate-900',
                  border: 'border-emerald-300',
                  text: 'text-emerald-950',
                  badge: 'bg-emerald-300/80 text-emerald-950 font-bold',
                  heart: 'text-emerald-800 hover:text-rose-600',
                },
                purple: {
                  bg: 'bg-gradient-to-br from-purple-100 to-indigo-200 text-slate-900',
                  border: 'border-purple-300',
                  text: 'text-purple-950',
                  badge: 'bg-purple-300/80 text-purple-950 font-bold',
                  heart: 'text-purple-800 hover:text-rose-600',
                },
                cyan: {
                  bg: 'bg-gradient-to-br from-cyan-100 to-sky-200 text-slate-900',
                  border: 'border-cyan-300',
                  text: 'text-cyan-950',
                  badge: 'bg-cyan-300/80 text-cyan-950 font-bold',
                  heart: 'text-cyan-800 hover:text-rose-600',
                },
                amber: {
                  bg: 'bg-gradient-to-br from-orange-100 to-amber-200 text-slate-900',
                  border: 'border-orange-300',
                  text: 'text-orange-950',
                  badge: 'bg-orange-300/80 text-orange-950 font-bold',
                  heart: 'text-orange-800 hover:text-rose-600',
                },
              };

              const style = colorStyles[note.color] || colorStyles.yellow;

              return (
                <div
                  key={note.id}
                  className={`p-5 rounded-3xl border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:rotate-0 hover:scale-102 ${rotation} ${style.bg} ${style.border}`}
                >
                  {/* Decorative Pin / Tape effect */}
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-8 h-4 bg-white/70 backdrop-blur-sm rounded-sm shadow-sm border border-white/40 opacity-80" />

                  <div>
                    {/* Header: Author & Score Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={note.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                          alt={note.author || note.authorName || 'Sĩ tử'}
                          className="w-7 h-7 rounded-full object-cover border border-white shadow-sm"
                        />
                        <div>
                          <span className="font-bold text-xs block text-slate-900 leading-tight">
                            {note.author || note.authorName || 'Sĩ tử 2k8'}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {typeof note.createdAt === 'number' ? '2026' : note.createdAt}
                          </span>
                        </div>
                      </div>

                      {(note.targetScore || note.targetSchool) && (
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono shadow-sm ${style.badge}`}>
                          🎯 {note.targetScore || 'Mục tiêu đỗ'}
                        </span>
                      )}
                    </div>

                    {/* Target University */}
                    {(note.targetUniversity || note.targetSchool) && (
                      <div className="mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                          Mục tiêu đỗ:
                        </span>
                        <span className="text-xs font-black text-slate-900 leading-tight block">
                          {note.targetUniversity || note.targetSchool}
                        </span>
                      </div>
                    )}

                    {/* Resolution / Wish content */}
                    <p className="text-xs font-medium text-slate-800 leading-relaxed italic my-2">
                      "{note.goal || note.content}"
                    </p>
                  </div>

                  {/* Footer: Like Button & Admin delete */}
                  <div className="flex items-center justify-between pt-3 mt-2 border-t border-black/10">
                    <button
                      type="button"
                      onClick={() => {
                        StorageService.toggleLikeWishNote(note.id);
                        setWishNotes(StorageService.getWishNotes());
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold transition ${style.heart}`}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                      <span>{note.likes ?? note.likesCount ?? 0} Thả tim</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        StorageService.deleteWishNote(note.id);
                        setWishNotes(StorageService.getWishNotes());
                      }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-800 flex items-center gap-1 transition"
                      title="Gỡ mảnh giấy nguyện ước này"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Gỡ note</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Navigation Cards to THPTQG and V-ACT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* THPTQG Zone Card */}
          <div
            className="rounded-2xl p-6 border border-white/10 hover:border-indigo-500/40 transition group"
            style={cardCustomStyle}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                    Phân vùng Ôn thi THPT Quốc Gia
                  </h2>
                  <p className="text-xs text-slate-400">9 Môn học trọng tâm • Cấu trúc đề 2026 mới</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('thptqg')}
                className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 my-4">
              {THPTQG_SUBJECTS.slice(0, 6).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => onNavigateToTab('thptqg')}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-left text-xs transition"
                >
                  <span className="font-semibold text-slate-200 block truncate">{sub.name}</span>
                  <span className="text-[10px] text-slate-400">{sub.code}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('thptqg')}
              className="w-full py-2.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Vào toàn bộ 9 môn THPTQG</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* V-ACT Zone Card */}
          <div
            className="rounded-2xl p-6 border border-white/10 hover:border-violet-500/40 transition group"
            style={cardCustomStyle}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center">
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white group-hover:text-violet-300 transition">
                    Phân vùng ĐGNL ĐHQG TP.HCM
                  </h2>
                  <p className="text-xs text-slate-400">Chuẩn cấu trúc V-ACT: 3 Phần thi & Kho đề 120 câu</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToTab('vact')}
                className="p-2 rounded-xl bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 my-4">
              {VACT_PARTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onNavigateToTab('vact')}
                  className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 text-left text-xs flex items-center justify-between transition"
                >
                  <span className="font-semibold text-slate-200">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{p.code}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigateToTab('vact')}
              className="w-full py-2.5 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-300 border border-violet-500/20 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Vào khu vực luyện thi V-ACT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dán Giấy Ước Nguyện */}
      {isWishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-white/20">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌈</span>
                <h3 className="font-extrabold text-base text-white">Dán Giấy Ước Nguyện 2026</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsWishModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGoal.trim()) return;
                const newNote: WishNote = {
                  id: `wish-${Date.now()}`,
                  author: newAuthor.trim() || 'Sĩ tử 2k8',
                  authorName: newAuthor.trim() || 'Sĩ tử 2k8',
                  authorAvatar: `https://images.unsplash.com/photo-${1535713875002 + Math.floor(Math.random() * 50)}?q=80&w=200&auto=format&fit=crop`,
                  goal: newGoal.trim(),
                  content: newGoal.trim(),
                  targetUniversity: newUni.trim() || 'Đại Học Mơ Ước',
                  targetSchool: `${newUni.trim() || 'Đại Học Mơ Ước'} - ${newScore.trim() || '27+'}`,
                  targetScore: newScore.trim() || '27+',
                  color: newColor,
                  likes: 1,
                  likesCount: 1,
                  likedBy: [],
                  createdAt: Date.now(),
                };
                StorageService.saveWishNote(newNote);
                setWishNotes(StorageService.getWishNotes());
                setIsWishModalOpen(false);
                setNewAuthor('');
                setNewGoal('');
                setNewUni('');
                setNewScore('');
              }}
              className="mt-4 space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên của bạn hoặc biệt danh:</label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="VD: Minh Đức (Thủ Khoa 2026)"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Trường ĐH & Ngành ước mơ:</label>
                <input
                  type="text"
                  value={newUni}
                  onChange={(e) => setNewUni(e.target.value)}
                  placeholder="VD: ĐH Y Dược TP.HCM - Y Đa Khoa"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Điểm mục tiêu (THPTQG hoặc V-ACT):</label>
                <input
                  type="text"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  placeholder="VD: 28.5+ THPTQG / 1050+ V-ACT"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Lời hứa / Khẩu hiệu quyết tâm:</label>
                <textarea
                  rows={3}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="VD: Mỗi ngày cố gắng hơn 1%, không bao giờ bỏ cuộc. Hẹn gặp tại cổng trường đại học!"
                  className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Chọn màu sắc giấy note:</label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { id: 'yellow', label: 'Vàng', bg: 'bg-yellow-300' },
                    { id: 'pink', label: 'Hồng', bg: 'bg-pink-300' },
                    { id: 'emerald', label: 'Xanh ngọc', bg: 'bg-emerald-300' },
                    { id: 'purple', label: 'Tím', bg: 'bg-purple-300' },
                    { id: 'cyan', label: 'Xanh dương', bg: 'bg-cyan-300' },
                    { id: 'amber', label: 'Cam', bg: 'bg-orange-300' },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewColor(c.id as any)}
                      className={`h-9 rounded-xl border-2 transition ${c.bg} ${
                        newColor === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsWishModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold shadow-lg"
                >
                  Dán lên bảng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
