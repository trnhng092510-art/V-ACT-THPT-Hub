import React, { useState } from 'react';
import { X, Trash2, FileText, Lock, Clock, Upload, Sparkles } from 'lucide-react';
import { StudyMaterial, MaterialType } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  material?: StudyMaterial | null;
  defaultSubjectId?: string;
  defaultSubCategory?: string;
  availableSubjects: { id: string; name: string }[];
  isAdmin?: boolean;
  onSave: (mat: StudyMaterial) => void;
  onDelete?: (id: string) => void;
}

export const MaterialEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  material,
  defaultSubjectId,
  defaultSubCategory,
  availableSubjects,
  isAdmin = true,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(material?.title || '');
  const [subjectId, setSubjectId] = useState(material?.subjectId || defaultSubjectId || availableSubjects[0]?.id || 'toan');
  const [subCategory] = useState(material?.subCategory || defaultSubCategory || 'theory');
  const [type, setType] = useState<MaterialType>(material?.type || 'pdf');
  const [url, setUrl] = useState(material?.url || '');
  const [size, setSize] = useState(material?.size || '5.5 MB');
  const [author, setAuthor] = useState(material?.author || (isAdmin ? 'Ban Chuyên môn StudyHub' : 'Đóng góp từ Sĩ tử'));
  const [isFeatured, setIsFeatured] = useState(material?.isFeatured || false);
  const [priceCoins, setPriceCoins] = useState<number>(material?.priceCoins || 0);
  const [accessDurationHours, setAccessDurationHours] = useState<number>(material?.accessDurationHours || 0);

  if (!isOpen) return null;

  const handleLocalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
    setSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;

    const item: StudyMaterial = {
      id: material?.id || `mat-${Date.now()}`,
      title: title.trim(),
      subjectId,
      subCategory,
      type,
      url: url.trim(),
      size: size.trim() || 'Tài liệu số',
      date: material?.date || new Date().toLocaleDateString('vi-VN'),
      views: material?.views || 1,
      author: author.trim() || 'StudyHub',
      isFeatured: isAdmin ? isFeatured : false,
      priceCoins: isAdmin ? Math.max(0, Number(priceCoins) || 0) : 0,
      accessDurationHours: isAdmin ? Math.max(0, Number(accessDurationHours) || 0) : 0,
    };

    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {!isAdmin
                  ? '📤 Đóng Góp Tài Liệu Cho Cộng Đồng (+50 S-Coin)'
                  : material
                  ? 'Chỉnh sửa Học liệu & Cài đặt Coin'
                  : '+ Thêm Học liệu / Đề thi Mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {!isAdmin
                  ? 'Chia sẻ đề thi, sơ đồ tư duy hoặc tài liệu hay để nhận thưởng +50 S-Coin khi được Admin duyệt'
                  : 'Quản lý file PDF, Word, Video, Drive & Khóa S-Coin có thời hạn'}
              </p>
            </div>
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

        {!isAdmin && (
          <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-amber-500/15 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Tài liệu của bạn sẽ được đưa vào <strong>Hàng Đợi Duyệt Bài</strong> trong Admin Studio. Ngay khi Admin bấm duyệt, hệ thống tự động cộng <strong>+50 S-Coin</strong> vào ví của bạn!
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="my-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tên tài liệu / Tiêu đề đề thi:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử THPTQG 2026 chuẩn cấu trúc có lời giải chi tiết..."
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Môn học / Phân vùng:</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
              >
                {availableSubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Định dạng file:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
              >
                <option value="pdf">Tài liệu PDF</option>
                <option value="doc">Văn bản Word (.docx)</option>
                <option value="video">Video bài giảng / YouTube</option>
                <option value="quiz">Bài trắc nghiệm / Quiz Online</option>
                <option value="drive">Thư mục Google Drive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Đường dẫn tài liệu (URL) hoặc tải file trực tiếp từ máy:
            </label>
            <div className="flex gap-2">
              <label className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/30 text-indigo-200 text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Chọn file</span>
                <input type="file" onChange={handleLocalFileSelect} className="hidden" />
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/... hoặc tải file bên cạnh"
                className="flex-1 px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Dung lượng / Thời lượng:</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="VD: 5.2 MB hoặc 45 phút"
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nguồn / Người đóng góp:</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Minh Quân 12A1"
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10"
              />
            </div>
          </div>

          {/* v5.0: S-Coin Lock & Timed Expiration Config (Admin Only) */}
          {isAdmin && (
            <>
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>🪙 Cài đặt Mở khóa bằng S-Coin & Thời hạn truy cập</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold">
                    {priceCoins > 0 ? `Thu phí: ${priceCoins} Coin` : 'Miễn phí (0 Coin)'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Giá mở khóa (S-Coin):</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={priceCoins}
                      onChange={(e) => setPriceCoins(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/15 font-mono"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[0, 30, 50, 100, 200].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setPriceCoins(val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            priceCoins === val
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {val === 0 ? 'Miễn phí' : `${val} Coin`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>Thời hạn sau khi mở khóa (Giờ):</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={accessDurationHours}
                      onChange={(e) => setAccessDurationHours(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/15 font-mono"
                      placeholder="0 = Vĩnh viễn"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {[
                        { label: '♾️ Vĩnh viễn', val: 0 },
                        { label: '1 giờ', val: 1 },
                        { label: '6 giờ', val: 6 },
                        { label: '24 giờ', val: 24 },
                        { label: '3 ngày', val: 72 },
                        { label: '7 ngày', val: 168 },
                      ].map((opt) => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => setAccessDurationHours(opt.val)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                            accessDurationHours === opt.val
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="is-featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="is-featured" className="text-xs text-slate-300 cursor-pointer">
                  Đánh dấu tài liệu Nổi bật (Ghim lên đầu trang)
                </label>
              </div>
            </>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {isAdmin && material && onDelete ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(material.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa tài liệu
              </button>
            ) : <div />}

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
                {!isAdmin ? '📤 Gửi Duyệt (+50 Coin)' : 'Lưu học liệu'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

