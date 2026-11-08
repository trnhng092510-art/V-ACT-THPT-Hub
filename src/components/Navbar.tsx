import React from 'react';
import {
  GraduationCap,
  Trophy,
  Sun,
  Moon,
  Clock,
  Palette,
  LogIn,
  Sliders,
  MessageSquare,
  Flame,
  Timer,
  Compass,
  Target,
  BookOpen,
  ExternalLink,
  Coins,
  Gift,
  Sparkles,
  BookMarked,
  Calculator,
} from 'lucide-react';
import { BackgroundConfig, User, NavbarConfig, StudyStreakInfo } from '../types';
import { formatTime } from '../utils/timer';
import { StorageService } from '../services/storage';
import { DEFAULT_NAVBAR_CONFIG } from '../data/initialData';

interface Props {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  user: User | null;
  graceState: {
    isGraceActive: boolean;
    remainingGraceSeconds: number;
    effectiveStudySeconds: number;
  };
  navbarConfig?: NavbarConfig;
  streakDays?: number;
  streakInfo?: StudyStreakInfo;
  coins?: number;
  onOpenArcade?: (tab?: 'checkin' | 'wheel' | 'quiz' | 'memory' | 'catch10' | 'shop') => void;
  onOpenPomodoro?: () => void;
  onOpenPersonalization?: () => void;
  onOpenMistakeNotebook?: () => void;
  onOpenScoreCalculator?: () => void;
  onOpenNavbarCustomizer?: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenLeaderboard: () => void;
  onOpenFirebaseConfig: () => void;
  onOpenAdminStudio?: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  isAdmin: boolean;
  bgConfig: BackgroundConfig;
  onOpenBgEditor: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  user,
  graceState,
  navbarConfig,
  streakDays = 3,
  streakInfo,
  coins,
  onOpenArcade,
  onOpenPomodoro,
  onOpenPersonalization,
  onOpenMistakeNotebook,
  onOpenScoreCalculator,
  onOpenNavbarCustomizer,
  onOpenAuth,
  onOpenProfile,
  onOpenLeaderboard,
  onOpenAdminStudio,
  theme,
  onToggleTheme,
  isAdmin,
  bgConfig,
  onOpenBgEditor,
}) => {
  const safeNavConfig: NavbarConfig =
    navbarConfig && Array.isArray(navbarConfig.items)
      ? navbarConfig
      : StorageService.getNavbarConfig() || DEFAULT_NAVBAR_CONFIG;

  const effectiveStreak: StudyStreakInfo = streakInfo || StorageService.getStreakInfo();
  const effectiveCoins: number = typeof coins === 'number' ? coins : StorageService.getCoins();
  const remainingStreakSecs = Math.max(0, 300 - (effectiveStreak.todayStudySeconds || 0));
  const remMin = String(Math.floor(remainingStreakSecs / 60)).padStart(2, '0');
  const remSec = String(remainingStreakSecs % 60).padStart(2, '0');

  const bgStyle: React.CSSProperties = {
    background:
      bgConfig?.type === 'solid' || bgConfig?.type === 'gradient'
        ? bgConfig.value
        : bgConfig?.value
        ? `url('${bgConfig.value}') center/cover no-repeat`
        : 'rgba(15, 23, 42, 0.85)',
    backdropFilter: bgConfig?.blur ? `blur(${bgConfig.blur}px)` : 'blur(16px)',
  };

  const getNavIcon = (iconName: string) => {
    switch (iconName) {
      case 'Compass':
        return <Compass className="w-3.5 h-3.5" />;
      case 'Target':
        return <Target className="w-3.5 h-3.5" />;
      case 'BookOpen':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'MessageSquare':
        return <MessageSquare className="w-3.5 h-3.5 text-pink-400" />;
      case 'Flame':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Trophy':
        return <Trophy className="w-3.5 h-3.5 text-amber-400" />;
      case 'Timer':
        return <Timer className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5" />;
    }
  };

  const visibleNavItems = [...(safeNavConfig.items || [])]
    .filter((i) => i.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-white/10 transition-colors shadow-md"
      style={bgStyle}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white block leading-none">
                {safeNavConfig.brandName || 'StudyHub'}{' '}
                <span className="text-indigo-400">{safeNavConfig.brandYear || '2026'}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {safeNavConfig.brandSlogan || 'THPTQG & V-ACT Hub'}
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenBgEditor}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 transition"
                title="Đổi nền thanh điều hướng"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
              </button>
              {onOpenNavbarCustomizer && (
                <button
                  type="button"
                  onClick={onOpenNavbarCustomizer}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 transition"
                  title="Quản lý & Thêm mục Navbar"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Center Zone Switcher */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-900/60 border border-white/10 text-xs font-semibold overflow-x-auto scrollbar-none shrink-0">
          {visibleNavItems.map((item) => {
            const isTabActive = activeTab === (item.targetTab || item.id);
            if (item.type === 'external_link') {
              return (
                <a
                  key={item.id}
                  href={item.externalUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  {getNavIcon(item.icon)}
                  <span>{item.label}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              );
            }
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.targetTab || item.id)}
                className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                  isTabActive
                    ? `${item.activeColor || 'bg-indigo-600'} text-white shadow`
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {getNavIcon(item.icon)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* 5-Minute Daily Streak Real-time Status Badge */}
          {effectiveStreak.todayCompleted ? (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-400/50 text-orange-300 text-xs font-extrabold shadow-md shadow-orange-500/20 whitespace-nowrap shrink-0"
              title={`🔥 ${effectiveStreak.currentStreak} ngày liên tiếp (Đã hoàn thành 5 phút học hôm nay!)`}
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-400 animate-bounce" />
              <span>
                🔥 {effectiveStreak.currentStreak || streakDays} ngày liên tiếp
              </span>
              <span className="hidden 2xl:inline text-[10px] text-emerald-300 font-bold">
                (Đã hoàn thành hôm nay!)
              </span>
            </div>
          ) : (
            <div
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-slate-300 text-xs font-semibold whitespace-nowrap shrink-0"
              title={`Học đủ 5 phút (300 giây) trong không gian học tập để kích hoạt chuỗi Streak hôm nay! (Hiện tại: ${effectiveStreak.currentStreak} ngày)`}
            >
              <Flame className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px]">
                🔥 Streak: Còn <strong className="font-mono text-amber-400">{remMin}:{remSec}</strong> để bật chuỗi hôm nay
              </span>
            </div>
          )}

          {/* S-Coin Wallet & Study Arcade Trigger Button */}
          {onOpenArcade && (
            <button
              type="button"
              onClick={() => onOpenArcade('checkin')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-400/40 text-amber-300 text-xs font-extrabold shadow-sm shadow-amber-500/15 transition whitespace-nowrap shrink-0 cursor-pointer"
              title="Mở Trung Tâm Điểm Danh, Minigame Săn Coin & Cửa Hàng Đổi Thưởng"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono">{effectiveCoins.toLocaleString()}</span>
              <span className="hidden lg:inline text-[11px] px-1.5 py-0.5 rounded-md bg-amber-400 text-slate-950 font-black">
                🎁 Săn Coin
              </span>
            </button>
          )}

          {/* Pomodoro Trigger */}
          {onOpenPomodoro && (
            <button
              type="button"
              onClick={onOpenPomodoro}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 shadow transition whitespace-nowrap shrink-0"
              title="Mở Trạm Tập Trung Pomodoro & Trộn Âm Thanh Nền"
            >
              <Timer className="w-4 h-4 text-rose-400" />
              <span className="hidden 2xl:inline">Pomodoro</span>
            </button>
          )}

          {/* v6.1: Private Mistake Notebook & Bookmarks */}
          {onOpenMistakeNotebook && (
            <button
              type="button"
              onClick={onOpenMistakeNotebook}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow transition whitespace-nowrap shrink-0"
              title="Sổ Tay Lỗi Sai Cá Nhân & Tủ Tài Liệu Đánh Dấu (100% Riêng Tư Theo Tài Khoản)"
            >
              <BookMarked className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">📓 Sổ tay</span>
            </button>
          )}

          {/* v6.1: University Admission Score Calculator */}
          {onOpenScoreCalculator && (
            <button
              type="button"
              onClick={onOpenScoreCalculator}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 shadow transition whitespace-nowrap shrink-0"
              title="Máy Tính Điểm Xét Tuyển Theo Công Thức Riêng Từng Trường ĐH"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">🧮 Tính điểm</span>
            </button>
          )}

          {/* v6.1: User Personalization (Blink-Blink & Study Backgrounds) */}
          {onOpenPersonalization && (
            <button
              type="button"
              onClick={onOpenPersonalization}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 shadow transition whitespace-nowrap shrink-0"
              title="Cá Nhân Hóa Hiệu Ứng Rơi Blink-Blink & Hình Nền Phòng Học Của Riêng Bạn"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="hidden lg:inline">✨ Cá nhân hóa</span>
            </button>
          )}

          {/* Smart 3-Minute Study Timer */}
          {user ? (
            <div
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono whitespace-nowrap shrink-0 transition ${
                graceState.isGraceActive
                  ? 'bg-amber-950/30 border-amber-500/40 text-amber-300'
                  : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-500/20'
              }`}
            >
              {graceState.isGraceActive ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span className="text-[11px] font-sans">Khởi động:</span>
                  <span className="font-bold">
                    {formatTime(graceState.remainingGraceSeconds, false)}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-sans">Đang học:</span>
                  <span className="font-bold">{formatTime(user.totalStudySeconds)}</span>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition whitespace-nowrap shrink-0"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Tính giờ học</span>
            </button>
          )}

          {/* Leaderboard Button */}
          <button
            type="button"
            onClick={onOpenLeaderboard}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1.5 shadow transition whitespace-nowrap shrink-0"
            title="Bảng xếp hạng thời gian thực"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">BXH</span>
          </button>

          {/* Admin Studio Button */}
          {isAdmin && onOpenAdminStudio && (
            <button
              type="button"
              onClick={onOpenAdminStudio}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/25 flex items-center gap-1.5 transition"
              title="Mở bảng điều khiển ADMIN STUDIO"
            >
              <span>👑 Admin Studio</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition"
            title={theme === 'dark' ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
            aria-label="Đổi theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>

          {/* User Profile / Auth */}
          {user ? (
            <button
              type="button"
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition"
              title="Hồ sơ cá nhân"
            >
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <img
                  src={
                    user.avatar ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'
                  }
                  alt={user.displayName}
                  className={`w-8 h-8 rounded-lg object-cover ${
                    user.equippedFrame || 'border border-indigo-400/50'
                  }`}
                />
                {user.equippedFrameImageUrl && (
                  <img
                    src={user.equippedFrameImageUrl}
                    alt="Frame"
                    className="absolute inset-0 w-9 h-9 -m-0.5 object-contain pointer-events-none scale-110"
                  />
                )}
              </div>
              <div className="hidden xl:flex flex-col items-start leading-tight max-w-[110px]">
                <span className="text-xs font-bold text-slate-200 truncate w-full">
                  {user.displayName}
                </span>
                {user.equippedTitle && (
                  <span className="text-[9px] text-amber-300 font-bold truncate w-full">
                    {user.equippedTitle}
                  </span>
                )}
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};