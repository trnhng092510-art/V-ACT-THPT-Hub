import React, { useState } from 'react';
import { X, Trash2, LayoutGrid, Calendar, Bell, BookOpen, Flame, Compass } from 'lucide-react';
import { DashboardWidget } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  widget?: DashboardWidget | null;
  onSave: (widget: DashboardWidget) => void;
  onDelete?: (id: string) => void;
}

export const WidgetEditorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  widget,
  onSave,
  onDelete,
}) => {
  const [type, setType] = useState<DashboardWidget['type']>(widget?.type || 'countdown');
  const [title, setTitle] = useState(widget?.title || '');
  const [content, setContent] = useState(widget?.content || '');
  const [targetDate, setTargetDate] = useState(widget?.targetDate || '2026-06-25T07:30');
  const [icon, setIcon] = useState(widget?.icon || 'GraduationCap');
  const [badge, setBadge] = useState(widget?.badge || '');
  const [gridSpan, setGridSpan] = useState<'half' | 'full'>(widget?.gridSpan === 'full' ? 'full' : 'half');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    let colorStyle = 'border-indigo-500/30 bg-indigo-950/20';
    if (type === 'announcement') colorStyle = 'border-amber-500/30 bg-amber-950/20';
    if (type === 'note') colorStyle = 'border-emerald-500/30 bg-emerald-950/20';
    if (type === 'banner') colorStyle = 'border-violet-500/30 bg-violet-950/20';

    const item: DashboardWidget = {
      id: widget?.id || `w-${Date.now()}`,
      type,
      title: title.trim(),
      content: content.trim() || undefined,
      targetDate: type === 'countdown' ? targetDate : undefined,
      color: colorStyle,
      icon,
      badge: badge.trim() || undefined,
      gridSpan,
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
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                {widget ? 'Chỉnh sửa Mục Dashboard' : '+ Thêm Mục Dashboard Mới'}
              </h3>
              <p className="text-xs text-slate-400">Tùy biến widget đồng hồ, thông báo, ghi chú chiến thuật</p>
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

        <form onSubmit={handleSubmit} className="my-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Loại thẻ (Widget Type):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'countdown', label: 'Đồng hồ đếm ngược' },
                { id: 'announcement', label: 'Thông báo / Tin tức' },
                { id: 'note', label: 'Mẹo học / Ghi chú' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id as any)}
                  className={`p-2 rounded-xl text-xs font-medium border text-center transition ${
                    type === t.id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-slate-900/60 text-slate-400 border-white/5 hover:border-white/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Tiêu đề thẻ:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đếm ngược THPTQG 2026, Lịch thi thử đợt 1..."
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              required
            />
          </div>

          {type === 'countdown' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Ngày & giờ thi mục tiêu:
              </label>
              <input
                type="datetime-local"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nội dung chi tiết:</label>
              <textarea
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Nhập nội dung chia sẻ, thông báo cập nhật đề thi, hoặc mẹo ghi nhớ nhanh..."
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Huy hiệu nhỏ (Badge):</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="VD: Mới nhất, GDPT 2018..."
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Bố cục chiều rộng:</label>
              <select
                value={gridSpan}
                onChange={(e) => setGridSpan(e.target.value as any)}
                className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
              >
                <option value="half">1/2 Hàng (Tiêu chuẩn)</option>
                <option value="full">Toàn hàng (Rộng)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {widget && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(widget.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa mục này
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
                Lưu mục
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
