import React, { useState } from 'react';
import { X, Flame, CheckCircle, Database, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { StorageService } from '../services/storage';
import { FirebaseConfigState } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminFirebaseModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const currentConfig = StorageService.getFirebaseConfig();
  const [jsonInput, setJsonInput] = useState<string>(() => {
    if (currentConfig.apiKey) {
      return JSON.stringify(
        {
          apiKey: currentConfig.apiKey,
          authDomain: currentConfig.authDomain,
          projectId: currentConfig.projectId,
          storageBucket: currentConfig.storageBucket,
          messagingSenderId: currentConfig.messagingSenderId,
          appId: currentConfig.appId,
        },
        null,
        2
      );
    }
    return '';
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSave = () => {
    setFeedback(null);
    if (!jsonInput.trim()) {
      // Revert to local storage fallback
      StorageService.setFirebaseConfig({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
        isConfigured: false,
      });
      setFeedback({
        type: 'info',
        message: 'Đã chuyển về chế độ Dual-Storage: Lưu trữ trên LocalStorage + đồng bộ real-time BroadcastChannel.',
      });
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const newConfig: FirebaseConfigState = {
        apiKey: parsed.apiKey || '',
        authDomain: parsed.authDomain || '',
        projectId: parsed.projectId || '',
        storageBucket: parsed.storageBucket || '',
        messagingSenderId: parsed.messagingSenderId || '',
        appId: parsed.appId || '',
        isConfigured: Boolean(parsed.apiKey && parsed.projectId),
      };

      const result = StorageService.setFirebaseConfig(newConfig);
      if (result.success) {
        setFeedback({
          type: 'success',
          message: `${result.message} Đã kích hoạt dự án: ${newConfig.projectId || 'Firebase'}`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    } catch (e: any) {
      setFeedback({
        type: 'error',
        message: 'Định dạng JSON không hợp lệ! Vui lòng kiểm tra lại dấu ngoặc và dấu phẩy.',
      });
    }
  };

  const handleLoadSample = () => {
    const sample = {
      apiKey: "AIzaSyDummyKey_For_StudyHub_EdTech2026",
      authDomain: "studyhub-vact-thptqg.firebaseapp.com",
      projectId: "studyhub-vact-thptqg",
      storageBucket: "studyhub-vact-thptqg.appspot.com",
      messagingSenderId: "849201829102",
      appId: "1:849201829102:web:7f6a5b4c3d2e1"
    };
    setJsonInput(JSON.stringify(sample, null, 2));
    setFeedback({
      type: 'info',
      message: 'Đã dán mẫu JSON Firebase. Nhấn "Lưu cấu hình" để kích hoạt.',
    });
  };

  const isConfigured = StorageService.isFirebaseActive();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">⚙️ Cấu hình Firebase & Dual-Storage</h3>
              <p className="text-xs text-slate-400">Dán trực tiếp JSON firebaseConfig từ Firebase Console</p>
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

        {/* Current status pill */}
        <div className="my-4 p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <span className="text-xs text-slate-400 block">Trạng thái lưu trữ hiện tại:</span>
              <span className="text-sm font-semibold text-white">
                {isConfigured ? '🟢 Đã kết nối Firebase Cloud Firestore & Auth' : '🔵 Dual-Storage (LocalStorage + BroadcastChannel)'}
              </span>
            </div>
          </div>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
            isConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
          }`}>
            {isConfigured ? 'Live Cloud' : 'Offline Ready'}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">
                Dán mã JSON <span className="font-mono text-orange-400">firebaseConfig</span>:
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Dán mẫu demo
              </button>
            </div>
            <textarea
              rows={8}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "your-app.firebaseapp.com",\n  "projectId": "your-app-id",\n  "storageBucket": "...",\n  "messagingSenderId": "...",\n  "appId": "..."\n}`}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-white border border-white/10 font-mono text-xs focus:border-orange-500/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              * Ghi chú: Nếu để trống, trang web vẫn vận hành trơn tru 100% nhờ cơ chế Fallback tự động.
            </p>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                : feedback.type === 'error'
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}>
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : feedback.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0" />
              ) : (
                <RefreshCw className="w-4 h-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-lg shadow-orange-500/20 transition transform active:scale-95"
          >
            Lưu & Đồng bộ Firebase
          </button>
        </div>
      </div>
    </div>
  );
};
