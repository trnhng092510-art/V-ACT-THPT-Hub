import React, { useState } from 'react';
import { X, Mail, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'google' | 'quick'>('google');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await StorageService.loginWithGoogle();
      if (result.success && result.user) {
        onLoginSuccess(result.user);
        onClose();
      } else {
        setErrorMsg(result.error || 'Đăng nhập Google không thành công.');
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Lỗi khi kích hoạt Google Sign-In');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ (ví dụ: student@gmail.com)');
      return;
    }

    if (!displayName.trim()) {
      setErrorMsg('Vui lòng nhập Tên hiển thị của bạn');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = StorageService.loginWithQuickGmail(email, displayName, identifier);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg('Không thể đăng nhập. Vui lòng thử lại.');
      }
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-xl text-white">Đăng nhập Không gian Học tập</h3>
            <p className="text-xs text-slate-400">Lưu lại giờ học, tích lũy điểm và thăng hạng sĩ tử</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 my-5 p-1 rounded-xl bg-slate-900/70 border border-white/5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'google'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Google OAuth</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('quick');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'quick'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Gmail Nhanh (Không OAuth)</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Google OAuth */}
        {activeTab === 'google' && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-indigo-400 block mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Đồng bộ thời gian thực
              </span>
              Đăng nhập qua tài khoản Google giúp tự động cập nhật avatar, đồng bộ bảng xếp hạng và bảo lưu lịch sử học tập trên mọi thiết bị.
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full py-3 px-4 rounded-xl font-medium text-sm text-slate-900 bg-white hover:bg-slate-100 flex items-center justify-center gap-3 shadow-lg transition active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Đang xác thực...' : 'Tiếp tục với Google'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Quick Gmail without OAuth */}
        {activeTab === 'quick' && (
          <form onSubmit={handleQuickLogin} className="space-y-3.5 py-1">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Địa chỉ Gmail:
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vi_du@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Tên hiển thị (Display Name):
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="VD: Nguyễn Văn An - 2k8"
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mã định danh riêng / Mật khẩu (tùy chọn):
              </label>
              <input
                type="password"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập mã bí mật cá nhân để bảo mật"
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              * Phương thức này lưu bản ghi trực tiếp vào Firestore `users` mà không bắt buộc liên kết OAuth.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Đang tạo phiên...' : 'Vào học ngay'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
