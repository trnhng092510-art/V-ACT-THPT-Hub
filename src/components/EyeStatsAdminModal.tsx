import React, { useState } from 'react';
import { Eye, RotateCcw, Save, X, EyeOff, CheckCircle2 } from 'lucide-react';
import { StatsConfig } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdated: () => void;
}

export const EyeStatsAdminModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onStatsUpdated,
}) => {
  const [config, setConfig] = useState<StatsConfig>(() => StorageService.getStatsConfig());
  const [customViews, setCustomViews] = useState<string>(() =>
    StorageService.getStatsConfig().totalViews.toString()
  );
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleResetToZero = () => {
    StorageService.resetPageViews(0);
    setCustomViews('0');
    setConfig({ ...config, totalViews: 0 });
    onStatsUpdated();
    showToast('Đã đưa bộ đếm lượt xem về 0!');
  };

  const handleResetToOne = () => {
    StorageService.resetPageViews(1);
    setCustomViews('1');
    setConfig({ ...config, totalViews: 1 });
    onStatsUpdated();
    showToast('Đã đưa bộ đếm lượt xem về 1 (Khởi tạo chuẩn thực tế)!');
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customViews, 10);
    if (isNaN(parsed) || parsed < 0) {
      showToast('⚠️ Vui lòng nhập một số hợp lệ >= 0');
      return;
    }
    const updated: StatsConfig = {
      ...config,
      totalViews: parsed,
    };
    StorageService.saveStatsConfig(updated);
    setConfig(updated);
    onStatsUpdated();
    showToast(`Đã lưu con số lượt xem mới: ${parsed.toLocaleString()}!`);
  };

  const handleToggleVisibility = () => {
    const updated: StatsConfig = {
      ...config,
      isVisible: !config.isVisible,
    };
    StorageService.saveStatsConfig(updated);
    setConfig(updated);
    onStatsUpdated();
    showToast(updated.isVisible ? 'Đã BẬT hiển thị khung thống kê!' : 'Đã ẨN khung thống kê trên giao diện!');
  };

  const onlineReal = StorageService.getActiveOnlineTabCount();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-white/15 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5 text-indigo-400">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-white">
                Quản Lý Bộ Đếm "Con Mắt"
              </h3>
              <p className="text-[11px] text-slate-400">Đo lường truy cập & Sĩ tử online thực tế 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real-time Indicator banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Hiện trạng đo lường thực:</span>
            <div className="flex items-center gap-3 mt-1 font-bold text-white">
              <span className="text-indigo-300">👁️ {config.totalViews.toLocaleString()} lượt</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {onlineReal} sĩ tử online
              </span>
            </div>
          </div>
          <div className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
            Real-time Active
          </div>
        </div>

        {/* Actions Form */}
        <form onSubmit={handleSaveCustom} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">
              ✏️ Tự nhập số Lượt Xem khởi điểm (Số nguyên):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={customViews}
                onChange={(e) => setCustomViews(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-mono text-sm"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-1.5 transition shadow"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu</span>
              </button>
            </div>
          </div>

          {/* Reset Buttons */}
          <div className="pt-2 border-t border-white/10">
            <label className="block text-slate-300 font-medium mb-2">🔄 Thiết lập lại (Reset):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleResetToOne}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center justify-center gap-1.5 font-semibold transition hover:border-indigo-400"
              >
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reset về 1 (Chuẩn)</span>
              </button>

              <button
                type="button"
                onClick={handleResetToZero}
                className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-rose-300 border border-rose-500/20 flex items-center justify-center gap-1.5 font-semibold transition hover:border-rose-400"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset về 0</span>
              </button>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <span className="font-semibold text-white block">Hiển thị khung Con mắt trên trang</span>
              <span className="text-[11px] text-slate-400">Ẩn hoặc hiện huy hiệu thống kê ở ngoài Cover Screen</span>
            </div>
            <button
              type="button"
              onClick={handleToggleVisibility}
              className={`p-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                config.isVisible
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-white/10'
              }`}
            >
              {config.isVisible ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Đang hiện</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Đang ẩn</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
};
