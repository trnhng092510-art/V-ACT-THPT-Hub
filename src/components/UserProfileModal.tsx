import React, { useState } from 'react';
import { X, Copy, Check, Camera, LogOut, Award, Clock, Target } from 'lucide-react';
import { User } from '../types';
import { formatTime } from '../utils/timer';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUserUpdated: (user: User) => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onUserUpdated,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [avatar, setAvatar] = useState(user.avatar);
  const [bio, setBio] = useState(user.bio);
  const [copiedUid, setCopiedUid] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [avatarUrlDraft, setAvatarUrlDraft] = useState('');

  if (!isOpen) return null;

  const coins = StorageService.getCoins();
  const cosmetics = StorageService.getUserCosmetics();

  const handleCopyUid = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = StorageService.updateUserProfile({
      displayName: displayName.trim() || user.displayName,
      avatar,
      bio: bio.trim(),
    });
    if (updated) {
      onUserUpdated(updated);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-xl text-white">Hồ sơ Cá nhân Sĩ tử</h3>
            <p className="text-xs text-slate-400">Tùy chỉnh thông tin, danh hiệu và mục tiêu điểm thi</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="my-5 space-y-5">
          {/* Avatar & UID Header */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                alt={displayName}
                className={`w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md group-hover:opacity-85 transition ${
                  cosmetics.equippedFrame || ''
                }`}
              />
              {(cosmetics.equippedFrameImageUrl || user.equippedFrameImageUrl) && (
                <img
                  src={cosmetics.equippedFrameImageUrl || user.equippedFrameImageUrl}
                  alt="Avatar Frame"
                  className="absolute inset-0 w-20 h-20 object-contain pointer-events-none scale-110 z-10"
                />
              )}
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition"
                title="Tải ảnh mới từ máy"
              >
                <Camera className="w-6 h-6 text-white" />
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleAvatarFile}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.id}
                </span>
                {cosmetics.equippedTitle && (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow">
                    {cosmetics.equippedTitle}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="p-1 text-slate-400 hover:text-white rounded transition"
                  title="Sao chép ID"
                >
                  {copiedUid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {copiedUid && <span className="text-[10px] text-emerald-400">Đã copy!</span>}
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <button
                type="button"
                onClick={() => {
                  setAvatarUrlDraft(avatar);
                  setShowAvatarUrlInput(!showAvatarUrlInput);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold block"
              >
                🔗 Hoặc dán link ảnh trực tiếp
              </button>
              {showAvatarUrlInput && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="url"
                    value={avatarUrlDraft}
                    onChange={(e) => setAvatarUrlDraft(e.target.value)}
                    placeholder="https://... link ảnh Avatar"
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg glass-input text-white border border-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (avatarUrlDraft.trim()) {
                        setAvatar(avatarUrlDraft.trim());
                      }
                      setShowAvatarUrlInput(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Áp dụng
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Study Stats & S-Coin Badges */}
          <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-xl bg-slate-900/60 border border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Giờ học tích lũy</span>
                <span className="text-xs font-bold font-mono text-emerald-400">
                  {formatTime(user.totalStudySeconds)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-bold">
                🪙
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ví S-Coin</span>
                <span className="text-xs font-extrabold text-amber-300">
                  {coins.toLocaleString()} Coin
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Trạng thái</span>
                <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                </span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Tên hiển thị:</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> Bio / Mục tiêu điểm thi:
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="VD: Mục tiêu 28+ Khối A00 - Thủ khoa ĐGNL V-ACT 950+"
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Mục tiêu này sẽ hiển thị bên cạnh tên bạn trên Bảng xếp hạng học tập thời gian thực.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="px-3.5 py-2 text-xs font-medium rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs rounded-xl text-slate-400 hover:text-white transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition"
              >
                {isSaved ? 'Đã lưu!' : 'Lưu hồ sơ'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
