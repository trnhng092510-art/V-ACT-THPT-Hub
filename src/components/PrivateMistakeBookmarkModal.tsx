import React, { useState, useEffect } from 'react';
import {
  X,
  BookMarked,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Upload,
  Lock,
  LogIn,
  ExternalLink,
  Bookmark,
  Edit2,
} from 'lucide-react';
import { User, MistakeItem, BookmarkRecord } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  initialTab?: 'mistakes' | 'bookmarks';
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

const SUBJECT_OPTIONS = [
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'ĐGNL V-ACT',
  'Lịch sử / Địa lý',
];

export const PrivateMistakeBookmarkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  initialTab = 'mistakes',
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'mistakes' | 'bookmarks'>(initialTab);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'need_review' | 'mastered'>('ALL');

  // Form State for Adding/Editing a Mistake
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MistakeItem | null>(null);
  const [subject, setSubject] = useState('Toán học');
  const [questionTitle, setQuestionTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mistakeReason, setMistakeReason] = useState('');
  const [correctSolution, setCorrectSolution] = useState('');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      if (user?.id) {
        setMistakes(StorageService.getMistakes(user.id));
        setBookmarks(StorageService.getBookmarks(user.id));
      } else {
        setMistakes([]);
        setBookmarks([]);
      }
    }
  }, [isOpen, initialTab, user?.id]);

  useEffect(() => {
    const unsub = StorageService.subscribe((ev) => {
      if (ev === 'MISTAKES_CHANGED' || ev === 'BOOKMARKS_CHANGED' || ev === 'USER_AUTH_CHANGED') {
        if (user?.id) {
          setMistakes(StorageService.getMistakes(user.id));
          setBookmarks(StorageService.getBookmarks(user.id));
        } else {
          setMistakes([]);
          setBookmarks([]);
        }
      }
    });
    return unsub;
  }, [user?.id]);

  if (!isOpen) return null;

  const handleUploadMistakeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !questionTitle.trim()) return;

    const item: MistakeItem = {
      id: editingItem?.id || `msk-${Date.now()}`,
      ownerId: user.id,
      subject,
      questionTitle: questionTitle.trim(),
      imageUrl: imageUrl.trim() || undefined,
      mistakeReason: mistakeReason.trim(),
      correctSolution: correctSolution.trim(),
      status: editingItem?.status || 'need_review',
      createdAt: editingItem?.createdAt || Date.now(),
    };

    StorageService.saveMistake(user.id, item);
    setMistakes(StorageService.getMistakes(user.id));
    setShowForm(false);
    setEditingItem(null);
    setQuestionTitle('');
    setImageUrl('');
    setMistakeReason('');
    setCorrectSolution('');
    showToast('📓 Đã lưu vào Sổ Tay Lỗi Sai cá nhân của bạn!', 'success');
  };

  const handleEditMistake = (item: MistakeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setSubject(item.subject);
    setQuestionTitle(item.questionTitle);
    setImageUrl(item.imageUrl || '');
    setMistakeReason(item.mistakeReason);
    setCorrectSolution(item.correctSolution);
    setShowForm(true);
  };

  const handleDeleteMistake = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    StorageService.deleteMistake(user.id, id);
    setMistakes(StorageService.getMistakes(user.id));
    showToast('🗑️ Đã xóa mục khỏi Sổ tay lỗi sai!', 'info');
  };

  const handleToggleMistakeStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    StorageService.toggleMistakeStatus(user.id, id);
    setMistakes(StorageService.getMistakes(user.id));
    showToast('✅ Đã cập nhật trạng thái ôn tập câu sai!', 'success');
  };

  const handleRemoveBookmark = (materialId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user?.id) return;
    StorageService.removeBookmark(user.id, materialId);
    setBookmarks(StorageService.getBookmarks(user.id));
    showToast('🗑️ Đã bỏ đánh dấu tài liệu khỏi tủ cá nhân!', 'info');
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (filterSubject !== 'ALL' && m.subject !== filterSubject) return false;
    if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
    return true;
  });

  return (
    <div
      className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gradient-to-r from-rose-500/15 via-amber-500/15 to-indigo-500/15 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg">
              <BookMarked className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  📓 Sổ Tay Lỗi Sai & ⭐ Tủ Đề Cá Nhân
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Riêng tư 100% theo Account
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {user
                  ? `Đang mở không gian lưu trữ riêng của: ${user.displayName} (${user.id})`
                  : 'Hãy đăng nhập để mở Sổ tay lỗi sai và Tủ đề riêng tư của bạn'}
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

        {/* Tabs */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950/60 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'mistakes'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>📓 Sổ Tay Lỗi Sai ({mistakes.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bookmarks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>⭐ Tủ Tài Liệu Đánh Dấu ({bookmarks.length})</span>
            </button>
          </div>

          {user && activeTab === 'mistakes' && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setQuestionTitle('');
                setImageUrl('');
                setMistakeReason('');
                setCorrectSolution('');
                setShowForm((prev) => !prev);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{showForm ? 'Đóng khung nhập' : '+ Ghi Câu Sai Mới'}</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!user ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mx-auto">
                <Lock className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-black text-white">
                Sổ Tay Lỗi Sai & Tủ Tài Liệu Được Bảo Mật Theo Từng Tài Khoản
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Để đảm bảo quyền riêng tư tuyệt đối (không ai nhìn thấy câu sai hoặc tủ đề của bạn), vui lòng đăng nhập tài khoản học viên của bạn.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs inline-flex items-center gap-2 shadow-xl"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Để Mở Sổ Tay Riêng Tư</span>
              </button>
            </div>
          ) : activeTab === 'mistakes' ? (
            <div className="space-y-5">
              {/* Add / Edit Mistake Form */}
              {showForm && (
                <form
                  onSubmit={handleSaveMistake}
                  className="p-5 rounded-2xl bg-slate-950/80 border border-rose-500/30 space-y-4 text-xs"
                >
                  <h4 className="font-black text-sm text-rose-300">
                    {editingItem ? '✏️ Chỉnh sửa câu làm sai' : '➕ Thêm câu hỏi làm sai vào Sổ Tay Cá Nhân'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Môn học:</label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                      >
                        {SUBJECT_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 mb-1">Tên câu hỏi / Nguồn đề thi (*):</label>
                      <input
                        type="text"
                        value={questionTitle}
                        onChange={(e) => setQuestionTitle(e.target.value)}
                        placeholder="VD: Câu 45 cực trị số phức - Đề thi thử Sở Hà Nội lần 2..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 mb-1">
                      Ảnh chụp câu hỏi làm sai (Tải ảnh từ máy hoặc dán link):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://... hoặc bấm nút tải ảnh chụp đề bài"
                        className="flex-1 px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải ảnh câu sai</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadMistakeImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-rose-300 font-bold mb-1">
                        ⚠️ Nguyên nhân sai / Bẫy đề bài cần tránh:
                      </label>
                      <textarea
                        rows={3}
                        value={mistakeReason}
                        onChange={(e) => setMistakeReason(e.target.value)}
                        placeholder="VD: Quên điều kiện xác định x > 0 của hàm logarit, đọc nhầm 'không đúng' thành 'đúng'..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-rose-500/30"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-300 font-bold mb-1">
                        💡 Công thức / Hướng giải đúng:
                      </label>
                      <textarea
                        rows={3}
                        value={correctSolution}
                        onChange={(e) => setCorrectSolution(e.target.value)}
                        placeholder="VD: Đặt điều kiện trước khi biến đổi, dùng bất đẳng thức mô-đun |z1 + z2| <= |z1| + |z2|..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-emerald-500/30"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-slate-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black shadow-lg"
                    >
                      Lưu Vào Sổ Tay Riêng
                    </button>
                  </div>
                </form>
              )}

              {/* Filters */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setFilterSubject('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold ${
                      filterSubject === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300'
                    }`}
                  >
                    Tất cả môn
                  </button>
                  {SUBJECT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFilterSubject(s)}
                      className={`px-3 py-1.5 rounded-xl font-bold ${
                        filterSubject === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'need_review', label: '🔥 Cần ôn lại' },
                    { id: 'mastered', label: '✅ Đã khắc phục' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFilterStatus(st.id as any)}
                      className={`px-3 py-1.5 rounded-xl font-bold ${
                        filterStatus === st.id ? 'bg-amber-500 text-slate-950' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mistake Cards */}
              {filteredMistakes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
                  Bạn chưa có câu sai nào trong mục này. Hãy bấm <strong>"+ Ghi Câu Sai Mới"</strong> để lưu lại các bẫy đề thi cần nhớ!
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMistakes.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                              {item.subject}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                item.status === 'mastered'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {item.status === 'mastered' ? '✅ Đã khắc phục' : '🔥 Cần ôn kỹ'}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-white mt-1.5">{item.questionTitle}</h4>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleToggleMistakeStatus(item.id, e)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{item.status === 'mastered' ? 'Đánh dấu ôn lại' : 'Đã hiểu kỹ'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleEditMistake(item, e)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-300"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteMistake(item.id, e)}
                            className="p-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.imageUrl && (
                        <div className="max-h-56 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                          <img
                            src={item.imageUrl}
                            alt={item.questionTitle}
                            className="w-full h-full object-contain max-h-56"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/25">
                          <span className="font-bold text-rose-300 block mb-1">⚠️ Nguyên nhân sai / Bẫy:</span>
                          <p className="text-slate-200 whitespace-pre-line">{item.mistakeReason}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/25">
                          <span className="font-bold text-emerald-300 block mb-1">💡 Cách giải đúng:</span>
                          <p className="text-slate-200 whitespace-pre-line">{item.correctSolution}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs border border-dashed border-white/10 rounded-2xl">
                  Tủ tài liệu cá nhân của bạn đang trống. Hãy bấm biểu tượng <strong>⭐ Đánh dấu</strong> trên bất kỳ đề thi hoặc tài liệu nào trong THPTQG / V-ACT để lưu riêng vào đây!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-4 rounded-2xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                          {bm.subjectId} • {bm.type}
                        </span>
                        <h4 className="font-bold text-sm text-white truncate mt-1">{bm.title}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={bm.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Mở</span>
                        </a>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveBookmark(bm.materialId, e)}
                          className="p-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300"
                          title="Xóa khỏi tủ cá nhân"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
