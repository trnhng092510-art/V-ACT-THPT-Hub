import React, { useState } from 'react';
import {
  Eye,
  ArrowRight,
  Plus,
  Palette,
  QrCode,
  Share2,
  MessageCircle,
  Heart,
  Sparkles,
  Compass,
  FileText,
  Flame,
  X,
  Edit2,
  GraduationCap,
  Settings,
} from 'lucide-react';
import { AdminCustomButton, BackgroundConfig, SiteStats, LandingCoverConfig, StatsConfig } from '../types';

interface Props {
  onEnterWorkspace: () => void;
  isAdmin: boolean;
  bgConfig: BackgroundConfig;
  landingConfig: LandingCoverConfig;
  stats: SiteStats;
  statsConfig?: StatsConfig;
  customButtons: AdminCustomButton[];
  onOpenBgEditor: () => void;
  onOpenButtonEditor: (btn?: AdminCustomButton) => void;
  onOpenAdminStudio?: () => void;
  onOpenEyeStatsAdmin?: () => void;
}

export const CoverScreen: React.FC<Props> = ({
  onEnterWorkspace,
  isAdmin,
  bgConfig,
  landingConfig,
  stats,
  statsConfig,
  customButtons,
  onOpenBgEditor,
  onOpenButtonEditor,
  onOpenAdminStudio,
  onOpenEyeStatsAdmin,
}) => {
  const [activeModalButton, setActiveModalButton] = useState<AdminCustomButton | null>(null);

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'QrCode':
        return <QrCode className="w-4 h-4" />;
      case 'Share2':
        return <Share2 className="w-4 h-4" />;
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4" />;
      case 'Heart':
        return <Heart className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      case 'FileText':
        return <FileText className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const backgroundStyle: React.CSSProperties = {
    background:
      bgConfig.type === 'solid' || bgConfig.type === 'gradient'
        ? bgConfig.value
        : `url('${bgConfig.value}') center/cover no-repeat fixed`,
  };

  const getBtnShapeClass = (shape?: 'square' | 'rounded' | 'pill') => {
    if (shape === 'square') return 'rounded-none';
    if (shape === 'rounded') return 'rounded-xl';
    return 'rounded-full';
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-12 transition-all duration-700 overflow-hidden"
      style={backgroundStyle}
    >
      {/* Background Overlay & Blur */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-500"
        style={{
          backgroundColor: 'black',
          opacity: bgConfig.overlayOpacity ?? 0.35,
          backdropFilter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : 'none',
        }}
      />

      {/* Top Header: Live Stats & Admin tools */}
      <header className="relative z-10 flex items-center justify-between w-full max-w-6xl mx-auto">
        {/* Eye Stats badge (Real-Time 100%) */}
        {(statsConfig?.isVisible ?? true) || isAdmin ? (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full glass-panel text-xs shadow-lg border border-white/10 ${
              !(statsConfig?.isVisible ?? true) ? 'opacity-60 border-dashed border-amber-500/40' : 'text-slate-300'
            }`}>
              <div className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <Eye className="w-4 h-4 animate-pulse text-indigo-400" />
                <span className="font-semibold text-white">{stats.totalViews.toLocaleString()}</span>
                <span className="text-slate-400 text-[11px]">lượt xem</span>
              </div>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-semibold text-white">{stats.onlineCount}</span>
                <span className="text-slate-400 text-[11px]">sĩ tử online</span>
              </div>
            </div>

            {/* Admin Quick Control Button for Eye Stats */}
            {isAdmin && onOpenEyeStatsAdmin && (
              <button
                type="button"
                onClick={onOpenEyeStatsAdmin}
                className="p-1.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-indigo-400 hover:text-white border border-indigo-400/40 text-[10px] shadow transition flex items-center gap-1 px-2"
                title="Chỉnh sửa lượt xem & Reset bộ đếm"
              >
                <Settings className="w-3 h-3" />
                <span className="hidden sm:inline font-mono">Reset / Chỉnh</span>
              </button>
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Admin Tools on Cover */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            {onOpenAdminStudio && (
              <button
                onClick={onOpenAdminStudio}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-lg flex items-center gap-1.5 transition"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>👑 Admin Studio</span>
              </button>
            )}
            <button
              onClick={onOpenBgEditor}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-indigo-600/80 hover:bg-indigo-600 text-white shadow-lg flex items-center gap-1.5 transition border border-indigo-400/30"
              title="Đổi hình nền vùng Cover"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>🎨 Đổi nền</span>
            </button>
          </div>
        )}
      </header>

      {/* Center Hero: Minimalist Inspiring Presentation */}
      <main className="relative z-10 my-auto text-center max-w-4xl mx-auto px-4 py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur-sm animate-fade-in">
          <GraduationCap className="w-4 h-4 text-indigo-400" />
          <span>{landingConfig.subtitle}</span>
        </div>

        <h1
          className="font-extrabold tracking-tight text-white mb-6 leading-tight drop-shadow-md whitespace-pre-line"
          style={{
            fontSize: `${landingConfig.titleFontSize || 64}px`,
            color: landingConfig.titleColor || '#ffffff',
          }}
        >
          {landingConfig.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {landingConfig.slogan}
        </p>

        {/* Big Central CTA Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onEnterWorkspace}
            className={`group relative px-8 py-4 font-bold text-base sm:text-lg text-white shadow-2xl transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 cursor-pointer border border-white/20 ${
              landingConfig.primaryBtnGlow ? 'animate-glow shadow-indigo-500/50' : ''
            } ${getBtnShapeClass(landingConfig.primaryBtnShape)}`}
            style={{
              background: landingConfig.primaryBtnBg || 'linear-gradient(to right, #6366f1, #8b5cf6, #ec4899)',
              transform: `scale(${landingConfig.primaryBtnScale || 1})`,
            }}
          >
            <span>{landingConfig.primaryBtnText || 'Bước vào không gian học tập'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        {/* Custom Admin Buttons on Cover Screen */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {customButtons.map((btn) => (
            <div key={btn.id} className="relative group">
              {btn.type === 'url' ? (
                <a
                  href={btn.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r ${btn.color} shadow-md hover:shadow-lg flex items-center gap-2 transition transform hover:scale-105 border border-white/10 ${getBtnShapeClass(
                    btn.shape || 'pill'
                  )}`}
                  style={{
                    transform: btn.scale ? `scale(${btn.scale})` : undefined,
                  }}
                >
                  {getIconComponent(btn.icon)}
                  <span>{btn.label}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveModalButton(btn)}
                  className={`px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r ${btn.color} shadow-md hover:shadow-lg flex items-center gap-2 transition transform hover:scale-105 border border-white/10 cursor-pointer ${getBtnShapeClass(
                    btn.shape || 'pill'
                  )}`}
                  style={{
                    transform: btn.scale ? `scale(${btn.scale})` : undefined,
                  }}
                >
                  {getIconComponent(btn.icon)}
                  <span>{btn.label}</span>
                </button>
              )}

              {/* Admin edit button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenButtonEditor(btn)}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-900 border border-white/20 text-indigo-400 hover:text-white text-[10px] shadow"
                  title="Sửa nút này"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}

          {/* Admin Add Custom Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenButtonEditor()}
              className="px-3.5 py-2 rounded-full text-xs font-medium text-indigo-300 bg-slate-900/80 hover:bg-slate-800 border border-dashed border-indigo-400/40 hover:border-indigo-400 flex items-center gap-1.5 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Thêm nút tùy chỉnh</span>
            </button>
          )}
        </div>
      </main>

      {/* Pop-up modal for Custom Buttons with QR code / Details */}
      {activeModalButton && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 text-center relative">
            <button
              onClick={() => setActiveModalButton(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              {getIconComponent(activeModalButton.icon)}
            </div>

            <h3 className="text-lg font-bold text-white mb-2">
              {activeModalButton.modalTitle || activeModalButton.label}
            </h3>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed whitespace-pre-line">
              {activeModalButton.modalContent}
            </p>

            {activeModalButton.modalImage && (
              <div className="p-2 rounded-xl bg-white inline-block shadow-lg mb-4">
                <img
                  src={activeModalButton.modalImage}
                  alt={activeModalButton.label}
                  className="w-48 h-48 object-contain rounded-lg"
                />
              </div>
            )}

            <button
              onClick={() => setActiveModalButton(null)}
              className="w-full py-2.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/15 text-white transition"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
