import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Palette,
  RotateCcw,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Sliders,
} from 'lucide-react';
import { BlinkBlinkConfig, BackgroundConfig, BackgroundType } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const PRESET_GRADIENTS = [
  { name: 'Vũ Trụ Đêm (Mặc định)', value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' },
  { name: 'Tím Tinh Vân (Cyber)', value: 'linear-gradient(135deg, #1e1b4b 0%, #3b0764 50%, #0f172a 100%)' },
  { name: 'Rừng Đêm Lofi (Emerald)', value: 'linear-gradient(135deg, #022c22 0%, #0f172a 60%, #064e3b 100%)' },
  { name: 'Hoàng Hôn Thủ Khoa', value: 'linear-gradient(135deg, #2e1065 0%, #4c0519 50%, #0f172a 100%)' },
  { name: 'Đại Dương Sâu (Deep Ocean)', value: 'linear-gradient(135deg, #082f49 0%, #0f172a 50%, #172554 100%)' },
];

export const UserPersonalizationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfigUpdated,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'blink' | 'background'>('blink');
  const [blinkCfg, setBlinkCfg] = useState<BlinkBlinkConfig>(() =>
    StorageService.getEffectiveBlinkConfig()
  );
  const [selectedZone, setSelectedZone] = useState<'dashboard' | 'thptqg' | 'vact' | 'forum'>('dashboard');
  const [zoneBgs, setZoneBgs] = useState<Record<string, BackgroundConfig>>(() =>
    StorageService.getEffectiveBackgrounds()
  );

  useEffect(() => {
    if (isOpen) {
      setBlinkCfg(StorageService.getEffectiveBlinkConfig());
      setZoneBgs(StorageService.getEffectiveBackgrounds());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentZoneBg: BackgroundConfig = zoneBgs[selectedZone] || {
    sectionId: selectedZone,
    type: 'gradient',
    value: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    overlayOpacity: 0.4,
    blur: 0,
  };

  const handleSaveBlink = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveUserBlinkConfig(blinkCfg);
    onConfigUpdated();
    showToast('✨ Đã lưu hiệu ứng hạt Blink-Blink cá nhân của bạn!', 'success');
  };

  const handleResetBlink = () => {
    StorageService.resetUserBlinkConfig();
    const fallback = StorageService.getEffectiveBlinkConfig();
    setBlinkCfg(fallback);
    onConfigUpdated();
    showToast('🔄 Đã khôi phục hiệu ứng Blink-Blink mặc định của hệ thống!', 'info');
  };

  const handleUploadCustomParticle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setBlinkCfg((prev) => ({ ...prev, type: 'custom', customIconUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateCurrentZoneBg = (patch: Partial<BackgroundConfig>) => {
    const updated: BackgroundConfig = {
      ...currentZoneBg,
      sectionId: selectedZone,
      ...patch,
    };
    setZoneBgs((prev) => ({ ...prev, [selectedZone]: updated }));
    StorageService.saveUserSectionBackground(selectedZone, updated);
    onConfigUpdated();
  };

  const handleUploadBgImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const isGif = file.type.includes('gif');
        updateCurrentZoneBg({
          type: isGif ? 'gif' : 'image',
          value: reader.result,
        });
        showToast('🖼️ Đã tải ảnh nền cá nhân lên thành công!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetAllBackgrounds = () => {
    StorageService.resetUserBackgrounds();
    setZoneBgs(StorageService.getEffectiveBackgrounds());
    onConfigUpdated();
    showToast('🔄 Đã khôi phục toàn bộ nền về mặc định của Admin!', 'info');
  };

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                ✨ Cá Nhân Hóa Không Gian Học Tập Của Bạn
              </h2>
              <p className="text-xs text-slate-300">
                Tự đổi hạt rơi Blink-Blink và màu nền / ảnh nền theo sở thích riêng (Lưu theo tài khoản của bạn)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/60 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('blink')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'blink'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>1. Đổi Hạt Chạy Nền (Blink-Blink)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('background')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'background'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>2. Đổi Nền Từng Vùng Học Tập</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'blink' && (
            <form onSubmit={handleSaveBlink} className="space-y-5">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <div>
                  <span className="font-bold text-sm text-white block">Hiệu ứng hạt lấp lánh (Blink-Blink)</span>
                  <span className="text-xs text-slate-400">Bật hoặc tắt các hạt bay nhẹ nhàng trên màn hình</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBlinkCfg({ ...blinkCfg, enabled: !blinkCfg.enabled })}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition ${
                    blinkCfg.enabled
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {blinkCfg.enabled ? '🟢 Đang BẬT' : '⚪ Đang TẮT'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">Chọn kiểu hạt rơi yêu thích:</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { type: 'sparkle', label: '✨ Lấp lánh' },
                    { type: 'star', label: '⭐ Ngôi sao' },
                    { type: 'sakura', label: '🌸 Anh đào' },
                    { type: 'snow', label: '❄️ Bông tuyết' },
                    { type: 'lightbulb', label: '💡 Ý tưởng' },
                    { type: 'custom', label: '🖼️ Tự chọn ảnh' },
                  ].map((item) => (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setBlinkCfg({ ...blinkCfg, type: item.type as any })}
                      className={`p-3 rounded-xl text-xs font-bold border transition text-center ${
                        blinkCfg.type === item.type
                          ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                          : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {blinkCfg.type === 'custom' && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30 space-y-2">
                  <label className="block text-xs text-slate-300 font-semibold">
                    Dán link ảnh PNG/GIF hạt rơi hoặc tải từ máy tính:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={blinkCfg.customIconUrl || ''}
                      onChange={(e) => setBlinkCfg({ ...blinkCfg, customIconUrl: e.target.value })}
                      placeholder="https://... ảnh PNG/GIF trong suốt"
                      className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải ảnh</span>
                      <input
                        type="file"
                        accept="image/png,image/gif,image/webp"
                        onChange={handleUploadCustomParticle}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Mật độ hạt:</span>
                    <span className="font-mono font-bold text-indigo-400">{blinkCfg.count} hạt</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="50"
                    value={blinkCfg.count}
                    onChange={(e) => setBlinkCfg({ ...blinkCfg, count: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Kích thước:</span>
                    <span className="font-mono font-bold text-indigo-400">{blinkCfg.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="36"
                    value={blinkCfg.size}
                    onChange={(e) => setBlinkCfg({ ...blinkCfg, size: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10">
                  <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span>Tốc độ bay:</span>
                    <span className="font-mono font-bold text-indigo-400">{blinkCfg.speed}x</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={blinkCfg.speed}
                    onChange={(e) => setBlinkCfg({ ...blinkCfg, speed: Number(e.target.value) })}
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetBlink}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mặc định của Admin</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Áp Dụng Blink-Blink Ngay</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'background' && (
            <div className="space-y-5">
              {/* Select Zone */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Chọn phân vùng bạn muốn đổi nền:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'dashboard', label: '🏠 Bàn Học Dashboard' },
                    { id: 'thptqg', label: '🎓 Ôn Thi THPTQG' },
                    { id: 'vact', label: '🎯 ĐGNL V-ACT' },
                    { id: 'forum', label: '💬 Diễn Đàn Hỏi Bài' },
                  ].map((z) => (
                    <button
                      key={z.id}
                      type="button"
                      onClick={() => setSelectedZone(z.id as any)}
                      className={`p-3 rounded-xl text-xs font-bold border transition ${
                        selectedZone === z.id
                          ? 'bg-purple-600 text-white border-purple-400 shadow-md'
                          : 'bg-slate-950/60 text-slate-300 border-white/10 hover:bg-white/5'
                      }`}
                    >
                      {z.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset Gradients */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Dải màu Gradient nghệ thuật (Bấm để áp dụng tức thì):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {PRESET_GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => {
                        updateCurrentZoneBg({ type: 'gradient', value: g.value });
                        showToast(`🎨 Đã đổi nền "${g.name}"!`, 'success');
                      }}
                      style={{ background: g.value }}
                      className="p-3 rounded-xl border border-white/20 text-left text-xs font-bold text-white shadow hover:scale-[1.02] transition"
                    >
                      {g.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload Image / GIF or Paste URL */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
                <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <span>Hoặc tự tải Ảnh nền / Ảnh động GIF từ máy tính của bạn:</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentZoneBg.value}
                    onChange={(e) =>
                      updateCurrentZoneBg({
                        type: e.target.value.startsWith('http') || e.target.value.startsWith('data:') ? 'image' : 'gradient',
                        value: e.target.value,
                      })
                    }
                    placeholder="Dán link ảnh https://... hoặc mã màu #hex / linear-gradient..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                  />
                  <label className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh / GIF</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadBgImage}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5" /> Độ tối lớp phủ (Overlay):
                      </span>
                      <span className="font-mono text-purple-300">
                        {Math.round((currentZoneBg.overlayOpacity ?? 0.4) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.85"
                      step="0.05"
                      value={currentZoneBg.overlayOpacity ?? 0.4}
                      onChange={(e) => updateCurrentZoneBg({ overlayOpacity: Number(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Độ làm mờ ảnh nền (Blur):</span>
                      <span className="font-mono text-purple-300">{currentZoneBg.blur ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={currentZoneBg.blur ?? 0}
                      onChange={(e) => updateCurrentZoneBg({ blur: Number(e.target.value) })}
                      className="w-full accent-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleResetAllBackgrounds}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục tất cả nền mặc định của Admin</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg"
                >
                  Hoàn Tất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
