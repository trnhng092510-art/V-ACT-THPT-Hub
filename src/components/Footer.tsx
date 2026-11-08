import React from 'react';
import { Lock, Shield, GraduationCap, Palette, Mail, Phone, Settings } from 'lucide-react';
import { BackgroundConfig, FooterConfig } from '../types';

interface Props {
  onOpenAdminPin: () => void;
  isAdmin: boolean;
  bgConfig: BackgroundConfig;
  footerConfig: FooterConfig;
  onOpenBgEditor: () => void;
  onOpenAdminStudio?: () => void;
}

export const Footer: React.FC<Props> = ({
  onOpenAdminPin,
  isAdmin,
  bgConfig,
  footerConfig,
  onOpenBgEditor,
  onOpenAdminStudio,
}) => {
  const bgStyle: React.CSSProperties = {
    background:
      bgConfig.type === 'solid' || bgConfig.type === 'gradient'
        ? bgConfig.value
        : `url('${bgConfig.value}') center/cover no-repeat`,
  };

  return (
    <footer
      className="border-t border-white/10 text-slate-400 py-10 px-4 sm:px-8 transition-colors duration-500 relative mt-auto"
      style={bgStyle}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Brand & Mission */}
        <div className="flex items-center gap-3 text-center md:text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-white text-sm block tracking-tight">
              {footerConfig.brandName}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
              {footerConfig.tagline}
            </p>
          </div>
        </div>

        {/* Contact & Copyright info */}
        <div className="text-center md:text-center text-[11px] text-slate-400 space-y-1">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-300">
            {footerConfig.contactEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{footerConfig.contactEmail}</span>
              </span>
            )}
            {footerConfig.contactHotline && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>Hotline: {footerConfig.contactHotline}</span>
              </span>
            )}
          </div>
          <p className="text-slate-400 pt-1">{footerConfig.copyrightText}</p>
        </div>

        {/* Right tools: Admin background & subtle Hidden Lock Button */}
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              {onOpenAdminStudio && (
                <button
                  onClick={onOpenAdminStudio}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1 transition"
                  title="Mở Admin Studio toàn màn hình"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Admin Studio</span>
                </button>
              )}
              <button
                onClick={onOpenBgEditor}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-[11px] flex items-center gap-1 transition"
                title="Đổi nền Footer"
              >
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </>
          )}

          {/* Hidden Admin Lock / PIN trigger button */}
          <button
            type="button"
            onClick={onOpenAdminPin}
            className={`p-2 rounded-xl transition duration-200 cursor-pointer ${
              isAdmin
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow'
                : 'text-slate-600 hover:text-slate-400 hover:bg-white/5'
            }`}
            title="Xác minh Quản trị viên"
            aria-label="Xác minh Quản trị viên"
          >
            {isAdmin ? <Shield className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </footer>
  );
};
