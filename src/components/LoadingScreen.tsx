import React, { useState } from 'react';
import { Sparkles, Settings2, X, Upload } from 'lucide-react';
import { LoadingConfig } from '../types';
import { LOADING_GIF_PRESETS } from '../data/initialData';

interface Props {
  config: LoadingConfig;
  isAdmin: boolean;
  onUpdateConfig: (newConfig: LoadingConfig) => void;
}

export const LoadingScreen: React.FC<Props> = ({ config, isAdmin, onUpdateConfig }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [gifUrl, setGifUrl] = useState(config.gifUrl);
  const [durationMs, setDurationMs] = useState(config.durationMs);
  const [quoteText, setQuoteText] = useState(config.quoteText);
  const [progressColor, setProgressColor] = useState(config.progressColor || '#6366f1');

  const handleGifFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setGifUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig({
      gifUrl: gifUrl.trim(),
      durationMs: Math.min(5000, Math.max(500, Number(durationMs) || 1500)),
      quoteText: quoteText.trim(),
      progressColor: progressColor || '#6366f1',
    });
    setShowConfigModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 p-6 text-center animate-fade-in">
      {/* Background glow */}
      <div
        className="absolute w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ backgroundColor: config.progressColor || '#6366f1' }}
      />

      {/* Loading GIF Frame */}
      <div className="relative mb-6">
        <div
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 shadow-2xl relative"
          style={{
            borderColor: `${config.progressColor || '#6366f1'}66`,
            boxShadow: `0 20px 50px -12px ${config.progressColor || '#6366f1'}55`,
          }}
        >
          <img
            src={config.gifUrl}
            alt="Đang khởi tạo không gian học tập"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        </div>

        {/* Pulse ring */}
        <div
          className="absolute -inset-2 rounded-3xl border animate-ping pointer-events-none opacity-40"
          style={{ borderColor: config.progressColor || '#6366f1' }}
        />
      </div>

      {/* Progress Bar Animation */}
      <div className="w-52 sm:w-64 h-2 rounded-full bg-slate-800/90 overflow-hidden mb-5 border border-white/10">
        <div
          className="h-full rounded-full animate-pulse transition-all"
          style={{
            width: '100%',
            background: config.progressColor
              ? `linear-gradient(90deg, ${config.progressColor}, #a855f7, #ec4899)`
              : 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)',
          }}
        />
      </div>

      {/* Inspiring quote */}
      <p className="text-sm sm:text-base font-medium text-slate-200 max-w-md mx-auto italic mb-2">
        {config.quoteText}
      </p>
      <span className="text-xs text-indigo-400 font-medium flex items-center gap-1.5 justify-center">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Đang chuẩn bị học liệu cá nhân ({((config.durationMs || 1500) / 1000).toFixed(1)}s)...</span>
      </span>

      {/* Admin option to customize loading GIF */}
      {isAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowConfigModal(true);
          }}
          className="mt-8 px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-slate-900 border border-indigo-500/40 text-indigo-300 hover:text-white flex items-center gap-1.5 transition shadow-lg"
        >
          <Settings2 className="w-3.5 h-3.5" />
          <span>⚙️ Tùy chỉnh GIF & Thời lượng Loading (Admin)</span>
        </button>
      )}

      {/* Admin Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-2xl p-6 text-left text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-base text-white">🎬 Studio Màn hình Chuyển cảnh (Loading GIF)</h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="my-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  1. Tải ảnh .GIF / Ảnh động từ máy tính hoặc dán URL:
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={gifUrl}
                    onChange={(e) => setGifUrl(e.target.value)}
                    placeholder="https://... hoặc tải file bên cạnh"
                    className="flex-1 px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                    required
                  />
                  <label className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải GIF</span>
                    <input
                      type="file"
                      accept="image/gif,image/*"
                      onChange={handleGifFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* 6 Preset GIFs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                  {LOADING_GIF_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setGifUrl(preset.url)}
                      className={`p-1.5 rounded-lg border text-left text-[10px] font-medium truncate transition ${
                        gifUrl === preset.url
                          ? 'bg-indigo-600/30 border-indigo-400 text-white'
                          : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>2. Thời lượng hiển thị Loading:</span>
                  <span className="text-indigo-400 font-mono">{durationMs} ms ({(durationMs / 1000).toFixed(1)} giây)</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={durationMs}
                  onChange={(e) => setDurationMs(Number(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>0.5 giây (Siêu nhanh)</span>
                  <span>1.5 giây (Chuẩn)</span>
                  <span>5.0 giây</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">3. Câu nói truyền cảm hứng:</label>
                  <textarea
                    rows={2}
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">4. Màu thanh chạy:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={progressColor}
                      onChange={(e) => setProgressColor(e.target.value)}
                      className="w-10 h-9 rounded-lg cursor-pointer bg-transparent border border-white/20"
                    />
                    <span className="font-mono text-[11px] text-slate-300">{progressColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-lg"
                >
                  Lưu cài đặt Loading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

