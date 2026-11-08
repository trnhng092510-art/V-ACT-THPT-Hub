import React, { useState } from 'react';
import { Lock, KeyRound, ShieldAlert, CheckCircle2, X } from 'lucide-react';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onAdminStateChange: (active: boolean) => void;
  onOpenAdminStudio?: () => void;
}

export const AdminPinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  isAdmin,
  onAdminStateChange,
  onOpenAdminStudio,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const ok = StorageService.verifyAdminPin(pinInput);
    if (ok) {
      setSuccessMsg('Xác thực danh tính Quản trị viên thành công!');
      onAdminStateChange(true);
      setTimeout(() => {
        onClose();
        setPinInput('');
        setSuccessMsg('');
        if (onOpenAdminStudio) {
          onOpenAdminStudio();
        }
      }, 600);
    } else {
      setErrorMsg('Mã bảo mật không chính xác. Quyền truy cập bị từ chối!');
      setPinInput('');
    }
  };

  const handleDisableAdmin = () => {
    StorageService.setAdminMode(false);
    onAdminStateChange(false);
    onClose();
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPin.trim().length < 4) {
      setErrorMsg('Mã PIN mới phải có ít nhất 4 ký tự!');
      return;
    }

    const currentPin = StorageService.getAdminPin();
    if (pinInput.trim() !== currentPin) {
      setErrorMsg('Mã PIN hiện tại không chính xác!');
      return;
    }

    const updated = StorageService.setAdminPin(newPin.trim());
    if (updated) {
      setSuccessMsg('Đã cập nhật mã PIN bảo mật Admin mới!');
      setIsChangingPin(false);
      setPinInput('');
      setNewPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Xác minh Quyền Quản trị viên</h3>
              <p className="text-xs text-slate-400">Không gian quản trị tối cao</p>
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

        {isAdmin ? (
          <div className="my-6 space-y-4">
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-300">Admin Studio đang kích hoạt</p>
                <p className="text-xs text-slate-300">
                  Bạn đang sở hữu quyền quản trị viên tối cao: Thiết kế Landing, Micro-UI, Particle Engine, Quản lý Sticker, Reset Leaderboard và duyệt học liệu.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              {onOpenAdminStudio && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminStudio();
                  }}
                  className="w-full py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/25 transition"
                >
                  👑 Mở Bảng Điều Khiển ADMIN STUDIO
                </button>
              )}
              <button
                type="button"
                onClick={handleDisableAdmin}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition"
              >
                Tắt quyền Admin (Về chế độ Học viên)
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPin(!isChangingPin)}
                className="w-full py-2 text-xs text-slate-400 hover:text-slate-200 transition"
              >
                {isChangingPin ? 'Hủy đổi mã PIN' : '🔑 Đổi mã PIN bảo mật cá nhân'}
              </button>
            </div>

            {isChangingPin && (
              <form onSubmit={handleChangePin} className="space-y-3 pt-3 border-t border-white/10">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Mã PIN hiện tại:</label>
                  <input
                    type="password"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input text-white border border-white/10"
                    placeholder="Nhập mã bảo mật..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Mã PIN mới:</label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-input text-white border border-white/10"
                    placeholder="Nhập mã bảo mật..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Lưu mã PIN mới
                </button>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={handleUnlock} className="my-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Mã bảo mật quản trị:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Nhập mã bảo mật..."
                  maxLength={16}
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-white border border-white/15 focus:border-amber-400/50 font-mono tracking-widest text-center text-lg"
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              Mở khóa Bảng điều khiển Admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
