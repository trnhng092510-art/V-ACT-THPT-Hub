import React, { useState } from 'react';
import { X, Palette, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import { BackgroundConfig, BackgroundType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  sectionName: string;
  currentConfig: BackgroundConfig;
  onSave: (config: BackgroundConfig) => void;
}

const SOLID_PRESETS = [
  '#090d16',
  '#020617',
  '#0f172a',
  '#1e1b4b',
  '#13111c',
  '#042f2e',
  '#1c1917',
  '#f8fafc',
];

const GRADIENT_PRESETS = [
  'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
  'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #311042 100%)',
  'linear-gradient(to right bottom, #030712, #0c1830, #041f22)',
  'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
  'radial-gradient(circle at 50% 0%, #312e81 0%, #090d16 80%)',
  'linear-gradient(to bottom right, #f8fafc 0%, #e2e8f0 100%)',
];

const SAMPLE_IMAGES = [
  { label: 'Galaxy Focus', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Modern Library', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Cyber Minimal', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop' },
  { label: 'Calm Night Study', url: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=1200&auto=format&fit=crop' },
];

export const AdminSectionBgModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sectionId,
  sectionName,
  currentConfig,
  onSave,
}) => {
  const [bgType, setBgType] = useState<BackgroundType>(currentConfig.type);
  const [bgValue, setBgValue] = useState<string>(currentConfig.value);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(currentConfig.overlayOpacity ?? 0.2);
  const [blur, setBlur] = useState<number>(currentConfig.blur ?? 0);

  if (!isOpen) return null;

  const handleApply = () => {
    onSave({
      sectionId: sectionId as any,
      type: bgType,
      value: bgValue,
      overlayOpacity,
      blur,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Tùy biến nền vùng: {sectionName}</h3>
              <p className="text-xs text-slate-400">Chỉnh sửa trực quan chỉ áp dụng riêng cho phân vùng này</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex gap-2 my-5 p-1 rounded-xl bg-slate-900/60 border border-white/5">
          <button
            type="button"
            onClick={() => setBgType('solid')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              bgType === 'solid' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Màu đơn sắc
          </button>
          <button
            type="button"
            onClick={() => setBgType('gradient')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              bgType === 'gradient' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Dải Gradient
          </button>
          <button
            type="button"
            onClick={() => setBgType('image')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              bgType === 'image' || bgType === 'gif' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Ảnh / GIF
          </button>
        </div>

        {/* Preview Box */}
        <div className="mb-5">
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Xem trước nền thực tế</label>
          <div
            className="h-28 rounded-xl border border-white/15 relative overflow-hidden flex items-center justify-center shadow-inner"
            style={{
              background: bgType === 'solid' || bgType === 'gradient' ? bgValue : `url('${bgValue}') center/cover no-repeat`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundColor: 'black',
                opacity: overlayOpacity,
                backdropFilter: blur > 0 ? `blur(${blur}px)` : 'none',
              }}
            />
            <span className="relative z-10 px-3 py-1 rounded-full text-xs font-medium bg-black/60 text-white border border-white/20 backdrop-blur-sm">
              Xem trước: {sectionName}
            </span>
          </div>
        </div>

        {/* Option contents */}
        {bgType === 'solid' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2 font-medium">Bảng màu nhanh:</label>
              <div className="flex flex-wrap gap-2.5">
                {SOLID_PRESETS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setBgValue(color)}
                    className="w-8 h-8 rounded-full border border-white/20 transition transform hover:scale-110 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    aria-label={`Màu ${color}`}
                  >
                    {bgValue === color && <Check className="w-4 h-4 text-indigo-400 drop-shadow" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Mã màu tùy ý (Hex/RGB):</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgValue.startsWith('#') && bgValue.length === 7 ? bgValue : '#090d16'}
                  onChange={(e) => setBgValue(e.target.value)}
                  className="h-10 w-12 rounded-lg cursor-pointer bg-transparent border border-white/20"
                />
                <input
                  type="text"
                  value={bgValue}
                  onChange={(e) => setBgValue(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-lg glass-input text-white border border-white/10"
                  placeholder="#090d16 hoặc rgba(...)"
                />
              </div>
            </div>
          </div>
        )}

        {bgType === 'gradient' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-2 font-medium">Mẫu Gradient có sẵn:</label>
              <div className="grid grid-cols-2 gap-2">
                {GRADIENT_PRESETS.map((grad, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setBgValue(grad)}
                    className={`h-12 rounded-lg border transition p-1 text-left relative overflow-hidden ${
                      bgValue === grad ? 'border-indigo-400 ring-2 ring-indigo-500/50' : 'border-white/10 hover:border-white/30'
                    }`}
                    style={{ background: grad }}
                  >
                    {bgValue === grad && (
                      <span className="absolute top-1 right-1 p-0.5 rounded-full bg-indigo-600 text-white">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1">Mã CSS Gradient tùy biến:</label>
              <input
                type="text"
                value={bgValue}
                onChange={(e) => setBgValue(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg glass-input text-white border border-white/10 font-mono"
                placeholder="linear-gradient(...)"
              />
            </div>
          </div>
        )}

        {(bgType === 'image' || bgType === 'gif') && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1 font-medium">Đường dẫn ảnh nền / GIF:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={bgValue}
                  onChange={(e) => setBgValue(e.target.value)}
                  placeholder="https://... ảnh hoặc GIF"
                  className="flex-1 px-3 py-2 text-sm rounded-lg glass-input text-white border border-white/10"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">Gợi ý hình ảnh chất lượng cao:</label>
              <div className="grid grid-cols-2 gap-2">
                {SAMPLE_IMAGES.map((img) => (
                  <button
                    key={img.label}
                    type="button"
                    onClick={() => {
                      setBgType('image');
                      setBgValue(img.url);
                    }}
                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                      bgValue === img.url ? 'border-indigo-400 bg-indigo-950/40' : 'border-white/10 bg-slate-900/40 hover:border-white/20'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-8 h-8 rounded object-cover" />
                    <span className="text-xs text-slate-200 truncate">{img.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sliders for Opacity & Blur */}
        <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Độ tối lớp phủ (Overlay Dim):</span>
              <span className="font-mono text-indigo-400">{Math.round(overlayOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.9"
              step="0.05"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1">
              <span>Độ mờ làm mịn (Blur):</span>
              <span className="font-mono text-indigo-400">{blur}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={blur}
              onChange={(e) => setBlur(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition transform active:scale-95"
          >
            Lưu thay đổi nền
          </button>
        </div>
      </div>
    </div>
  );
};
