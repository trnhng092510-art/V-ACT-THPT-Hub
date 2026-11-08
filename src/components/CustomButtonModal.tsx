import React, { useState } from 'react';
import { X, Trash2, Link as LinkIcon, QrCode, Sparkles } from 'lucide-react';
import { AdminCustomButton } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  button?: AdminCustomButton | null;
  onSave: (btn: AdminCustomButton) => void;
  onDelete?: (id: string) => void;
}

const COLOR_GRADIENTS = [
  { label: 'Cam Vàng', value: 'from-amber-500 to-orange-600' },
  { label: 'Xanh Lam', value: 'from-blue-600 to-indigo-600' },
  { label: 'Lục Ngọc', value: 'from-emerald-500 to-teal-600' },
  { label: 'Tím Neon', value: 'from-purple-600 to-pink-600' },
  { label: 'Hồng Đào', value: 'from-rose-500 to-red-600' },
  { label: 'Xám Tối', value: 'from-slate-700 to-zinc-800' },
];

export const CustomButtonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  button,
  onSave,
  onDelete,
}) => {
  const [label, setLabel] = useState(button ? button.label : '');
  const [icon, setIcon] = useState(button ? button.icon : 'QrCode');
  const [color, setColor] = useState(button ? button.color : 'from-amber-500 to-orange-600');
  const [type, setType] = useState<'url' | 'modal'>(button ? button.type : 'modal');
  const [url, setUrl] = useState(button?.url || '');
  const [modalTitle, setModalTitle] = useState(button?.modalTitle || 'Thông tin liên hệ');
  const [modalContent, setModalContent] = useState(button?.modalContent || '');
  const [modalImage, setModalImage] = useState(button?.modalImage || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const newBtn: AdminCustomButton = {
      id: button ? button.id : `btn-${Date.now()}`,
      label: label.trim(),
      icon,
      color,
      type,
      url: type === 'url' ? url.trim() : undefined,
      modalTitle: type === 'modal' ? modalTitle.trim() : undefined,
      modalContent: type === 'modal' ? modalContent.trim() : undefined,
      modalImage: type === 'modal' ? modalImage.trim() : undefined,
    };

    onSave(newBtn);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <h3 className="font-bold text-lg text-white">
              {button ? 'Chỉnh sửa Nút tùy chỉnh' : '+ Thêm Nút tùy chỉnh Trang chủ'}
            </h3>
            <p className="text-xs text-slate-400">Hiển thị trên Cover Screen để kết nối cộng đồng</p>
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
            <label className="block text-xs font-medium text-slate-300 mb-1">Tên nút hiển thị:</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="VD: Ủng hộ dự án (QR), Fanpage, Zalo..."
              className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Chọn Icon đại diện:</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { name: 'QrCode', label: 'QR Code' },
                { name: 'Share2', label: 'Mạng xã hội' },
                { name: 'MessageCircle', label: 'Tin nhắn' },
                { name: 'Heart', label: 'Ủng hộ' },
                { name: 'Compass', label: 'Khám phá' },
                { name: 'FileText', label: 'Tài liệu' },
                { name: 'Sparkles', label: 'Nổi bật' },
                { name: 'Flame', label: 'Sôi động' },
              ].map((ic) => (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIcon(ic.name)}
                  className={`p-2 rounded-xl text-xs flex flex-col items-center gap-1 border transition ${
                    icon === ic.name
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                      : 'bg-slate-900/60 text-slate-300 border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="font-semibold">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Màu sắc dải Gradient:</label>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_GRADIENTS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-9 rounded-xl border text-xs font-medium transition flex items-center justify-center text-white bg-gradient-to-r ${c.value} ${
                    color === c.value ? 'ring-2 ring-white shadow-md' : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Hành vi khi click:</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('modal')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                  type === 'modal' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900/60 text-slate-400 border-white/5'
                }`}
              >
                Mở Cửa sổ Pop-up (QR / Thông tin)
              </button>
              <button
                type="button"
                onClick={() => setType('url')}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${
                  type === 'url' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900/60 text-slate-400 border-white/5'
                }`}
              >
                Mở Liên kết ngoài (URL)
              </button>
            </div>
          </div>

          {type === 'url' ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Đường dẫn liên kết (URL):</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3.5 py-2 text-sm rounded-xl glass-input text-white border border-white/10"
                required
              />
            </div>
          ) : (
            <div className="space-y-3 p-3 rounded-xl bg-slate-900/40 border border-white/5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Tiêu đề Pop-up:</label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-white border border-white/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nội dung Pop-up:</label>
                <textarea
                  rows={2}
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  placeholder="Mô tả nội dung, hướng dẫn quét mã hoặc số hotline..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-white border border-white/10"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Link ảnh QR hoặc ảnh minh họa:</label>
                <input
                  type="url"
                  value={modalImage}
                  onChange={(e) => setModalImage(e.target.value)}
                  placeholder="https://... dán link mã QR VietQR hoặc ảnh"
                  className="w-full px-3 py-1.5 text-xs rounded-lg glass-input text-white border border-white/10"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            {button && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(button.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-1 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Xóa nút này
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
                Lưu nút
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
