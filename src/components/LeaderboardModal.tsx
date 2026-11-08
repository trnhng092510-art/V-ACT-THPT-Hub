import React, { useState } from 'react';
import {
  Trophy,
  Crown,
  Search,
  X,
  Clock,
  Sparkles,
  Award,
  Flame,
  Copy,
  Check,
} from 'lucide-react';
import { User } from '../types';
import { formatTime } from '../utils/timer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
}

export const LeaderboardModal: React.FC<Props> = ({
  isOpen,
  onClose,
  users,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Sort by total study seconds descending
  const sortedUsers = [...users].sort((a, b) => b.totalStudySeconds - a.totalStudySeconds);

  const filteredUsers = sortedUsers.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      (u.bio && u.bio.toLowerCase().includes(q))
    );
  });

  const top1 = sortedUsers[0];
  const top2 = sortedUsers[1];
  const top3 = sortedUsers[2];

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-3xl rounded-3xl p-5 sm:p-7 text-slate-100 shadow-2xl border border-white/10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
                <span>Bảng Vàng Sĩ Tử Chăm Chỉ</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Real-time
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Ghi nhận theo thời gian học tập thực tế (Đã qua bộ đếm 3 phút chống treo máy)
              </p>
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

        {/* Podium for Top 3 Students */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 my-6 items-end">
          {/* Top 2: Silver */}
          {top2 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top2.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={top2.displayName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-slate-300 shadow-md"
                />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-300">
                  <Crown className="w-5 h-5 text-slate-300 drop-shadow" />
                </span>
                <span className="absolute -bottom-1.5 right-0 w-5 h-5 rounded-full bg-slate-300 text-slate-900 font-bold text-xs flex items-center justify-center">
                  2
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px] text-center">
                {top2.displayName}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {formatTime(top2.totalStudySeconds)}
              </span>
              <div className="w-full h-16 sm:h-20 bg-slate-800/80 rounded-t-xl border-t border-slate-400/40 mt-2 flex items-center justify-center text-xs font-bold text-slate-300 shadow-inner">
                🥈 Á quân
              </div>
            </div>
          )}

          {/* Top 1: Gold */}
          {top1 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top1.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={top1.displayName}
                  className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-xl shadow-amber-500/20"
                />
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                  <Crown className="w-7 h-7 text-amber-400 drop-shadow" />
                </span>
                <span className="absolute -bottom-1.5 right-0 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-amber-300 truncate max-w-[110px] sm:max-w-[150px] text-center">
                {top1.displayName}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-extrabold">
                {formatTime(top1.totalStudySeconds)}
              </span>
              <div className="w-full h-22 sm:h-28 bg-gradient-to-t from-amber-950/40 to-amber-900/60 rounded-t-xl border-t-2 border-amber-400 mt-2 flex items-center justify-center text-xs sm:text-sm font-extrabold text-amber-300 shadow-inner">
                🥇 Quán quân
              </div>
            </div>
          )}

          {/* Top 3: Bronze */}
          {top3 && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <img
                  src={top3.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop'}
                  alt={top3.displayName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-700 shadow-md"
                />
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-600">
                  <Crown className="w-5 h-5 text-amber-600 drop-shadow" />
                </span>
                <span className="absolute -bottom-1.5 right-0 w-5 h-5 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center">
                  3
                </span>
              </div>
              <span className="text-xs font-bold text-white truncate max-w-[100px] sm:max-w-[130px] text-center">
                {top3.displayName}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">
                {formatTime(top3.totalStudySeconds)}
              </span>
              <div className="w-full h-12 sm:h-16 bg-slate-800/80 rounded-t-xl border-t border-amber-700/60 mt-2 flex items-center justify-center text-xs font-bold text-amber-600 shadow-inner">
                🥉 Quý quân
              </div>
            </div>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên học viên, mã #UID hoặc mục tiêu điểm..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 focus:border-amber-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* User Leaderboard List Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredUsers.map((user, idx) => {
            const rank = idx + 1;
            const isMe = currentUser && (currentUser.id === user.id || currentUser.email === user.email);

            return (
              <div
                key={user.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isMe
                    ? 'bg-indigo-950/40 border-indigo-400/50 shadow-md ring-1 ring-indigo-500/30'
                    : 'glass-panel border-white/5 hover:border-white/15'
                }`}
              >
                {/* Rank & User details */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-xl font-bold font-mono text-xs flex items-center justify-center shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 font-extrabold'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 font-bold'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-bold'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {rank}
                  </span>

                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                      alt={user.displayName}
                      className={`w-10 h-10 rounded-xl object-cover ${
                        user.equippedFrame || 'border border-white/10'
                      }`}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        user.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                      }`}
                      title={user.isOnline ? 'Đang học trực tuyến' : 'Ngoại tuyến'}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-white truncate">
                        {user.displayName}
                      </span>
                      {user.equippedTitle && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          {user.equippedTitle}
                        </span>
                      )}
                      {isMe && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500 text-white">
                          BẠN
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopy(user.id)}
                        className="text-[10px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-0.5"
                        title="Sao chép UID"
                      >
                        <span>{user.id}</span>
                        {copiedId === user.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                      {user.bio || 'Chăm chỉ ôn luyện từng ngày'}
                    </p>
                  </div>
                </div>

                {/* Study Time & S-Coin */}
                <div className="text-right shrink-0 space-y-0.5">
                  <span className="block font-mono text-xs sm:text-sm font-bold text-emerald-400">
                    {formatTime(user.totalStudySeconds)}
                  </span>
                  <div className="flex items-center justify-end gap-1.5 text-[10px]">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 font-bold">
                      🪙 {(user.coins ?? 150).toLocaleString()} Coin
                    </span>
                    <span className="text-slate-400">
                      {user.isOnline ? '🟢 Online' : '⚪ Offline'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Quy tắc: Duy trì tối thiểu 3 phút để bắt đầu ghi nhận giờ học.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
