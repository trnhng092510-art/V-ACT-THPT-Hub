import React, { useState } from 'react';
import {
  Search,
  Plus,
  Palette,
  FileText,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Sparkles,
  Edit2,
  Trash2,
  Compass,
  Clock,
  Layers,
  Target,
  X,
  Lock,
  Unlock,
  Star,
  Upload,
} from 'lucide-react';
import { BackgroundConfig, StudyMaterial } from '../types';
import { VACT_PARTS } from '../data/initialData';
import { NestedFolderExplorer } from './NestedFolderExplorer';
import { StorageService } from '../services/storage';

interface Props {
  materials: StudyMaterial[];
  isAdmin: boolean;
  onOpenMaterialEditor: (mat?: StudyMaterial, defaultSubjectId?: string, defaultSubCat?: string) => void;
  onDeleteMaterial: (id: string) => void;
  onIncrementView: (id: string) => void;
  bgConfig: BackgroundConfig;
  onOpenBgEditor: () => void;
  onOpenExamOMR?: (title?: string, mode?: 'thptqg' | 'vact') => void;
  theme?: 'dark' | 'light';
}

export const StudyZoneVACT: React.FC<Props> = ({
  materials,
  isAdmin,
  onOpenMaterialEditor,
  onDeleteMaterial,
  onIncrementView,
  bgConfig,
  onOpenBgEditor,
  onOpenExamOMR,
  theme = 'dark',
}) => {
  const [selectedPartId, setSelectedPartId] = useState<string>('vact-part1');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activePreviewMaterial, setActivePreviewMaterial] = useState<StudyMaterial | null>(null);
  const [unlockingMaterial, setUnlockingMaterial] = useState<StudyMaterial | null>(null);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [, setUnlockTick] = useState(0);

  React.useEffect(() => {
    const unsub = StorageService.subscribe((type) => {
      if (type === 'MATERIAL_UNLOCKS_CHANGED' || type === 'COINS_UPDATED' || type === 'BOOKMARKS_CHANGED') {
        setUnlockTick((t) => t + 1);
      }
    });
    return unsub;
  }, []);

  const currentUser = StorageService.getCurrentUser();

  const currentPart = VACT_PARTS.find((p) => p.id === selectedPartId) || VACT_PARTS[0];

  const filteredMaterials = materials.filter((m) => {
    if (m.subjectId !== selectedPartId) return false;
    if (selectedSubCat !== 'all' && m.subCategory !== selectedSubCat) return false;
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        (m.author && m.author.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const bgStyle: React.CSSProperties = {
    background:
      bgConfig.type === 'solid' || bgConfig.type === 'gradient'
        ? bgConfig.value
        : `url('${bgConfig.value}') center/cover no-repeat fixed`,
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">PDF</span>;
      case 'doc':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">WORD</span>;
      case 'video':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">VIDEO</span>;
      case 'quiz':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">QUIZ</span>;
      case 'drive':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">DRIVE</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/20 text-slate-300">FILE</span>;
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] pt-6 pb-16 px-4 sm:px-8 transition-colors duration-500 relative"
      style={bgStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: 'black',
          opacity: bgConfig.overlayOpacity ?? 0.1,
          backdropFilter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : 'none',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Header & Section Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Phân vùng 2: Kỳ thi ĐGNL ĐHQG TP.HCM (V-ACT)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Phòng Luyện thi V-ACT Thực Chiến
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Chuẩn 120 câu hỏi trắc nghiệm khách quan trong 150 phút (Thang điểm tối đa 1200).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onOpenExamOMR && (
              <button
                type="button"
                onClick={() =>
                  onOpenExamOMR(`Đề thực chiến ${currentPart.name} - V-ACT ĐHQG TP.HCM 2026`, 'vact')
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-md flex items-center gap-1.5 transition"
              >
                <Target className="w-3.5 h-3.5" />
                <span>🎯 Làm bài bấm giờ (Mở phiếu trả lời)</span>
              </button>
            )}
            {!isAdmin && (
              <button
                type="button"
                onClick={() =>
                  onOpenMaterialEditor(
                    undefined,
                    selectedPartId,
                    selectedSubCat !== 'all' ? selectedSubCat : 'vietnamese'
                  )
                }
                className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md flex items-center gap-1.5 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>📤 Đóng góp tài liệu (+50 Coin)</span>
              </button>
            )}
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={onOpenBgEditor}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5 transition"
                >
                  <Palette className="w-3.5 h-3.5 text-violet-400" />
                  <span>🎨 Đổi nền V-ACT</span>
                </button>
                <button
                  type="button"
                  onClick={() => onOpenMaterialEditor(undefined, selectedPartId, selectedSubCat !== 'all' ? selectedSubCat : 'vietnamese')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white shadow-md flex items-center gap-1.5 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm học liệu V-ACT</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 4 V-ACT Parts Cards Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {VACT_PARTS.map((part) => {
            const isSelected = part.id === selectedPartId;
            return (
              <button
                key={part.id}
                onClick={() => {
                  setSelectedPartId(part.id);
                  setSelectedSubCat('all');
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-violet-600/90 to-indigo-600/90 text-white border-violet-400 shadow-lg shadow-violet-500/20 scale-102'
                    : 'glass-panel text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/20' : 'bg-slate-800'}`}>
                      {part.code}
                    </span>
                    <Layers className="w-4 h-4 opacity-70" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{part.name}</h3>
                  <p className="text-[11px] opacity-80 line-clamp-2">{part.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* View Mode Switcher: Tree View vs Flat View */}
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl glass-panel border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                viewMode === 'tree'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>👨‍🏫 Ban Chuyên Môn & Cây Thư Mục Đa Cấp</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20">V-ACT 2026</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('flat')}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                viewMode === 'flat'
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>📋 Danh Sách Nhanh</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10">{filteredMaterials.length}</span>
            </button>
          </div>
        </div>

        {/* View Mode Conditional Rendering */}
        {viewMode === 'tree' ? (
          <NestedFolderExplorer
            subjectId={selectedPartId}
            subjectName={currentPart.name}
            subjectCode={currentPart.code}
            subjectColor={currentPart.color}
            isAdmin={isAdmin}
            onOpenExamOMR={onOpenExamOMR}
            theme={theme}
          />
        ) : (
          <>
            {/* Part Sub-categories & Search Bar */}
        <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{currentPart.name}</span>
                <span className="text-xs font-mono text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded-md border border-violet-500/30">
                  {currentPart.code}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">{currentPart.description}</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm đề V-ACT, tư duy logic..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10 focus:border-violet-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Sub-categories */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setSelectedSubCat('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedSubCat === 'all'
                    ? 'bg-violet-600 text-white'
                    : 'bg-slate-900/60 text-slate-300 hover:text-white'
                }`}
              >
                Tất cả học liệu
              </button>
              {currentPart.subCategories.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCat(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedSubCat === sub.id
                      ? 'bg-violet-600 text-white'
                      : 'bg-slate-900/60 text-slate-300 hover:text-white'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-900 px-2.5 py-1.5 rounded-lg border border-white/10 text-xs text-slate-200"
              >
                <option value="all">Mọi định dạng</option>
                <option value="pdf">Chỉ PDF</option>
                <option value="doc">Chỉ Word</option>
                <option value="video">Chỉ Video</option>
                <option value="quiz">Chỉ Quiz</option>
              </select>
            </div>
          </div>
        </div>

        {/* Materials Cards List */}
        {filteredMaterials.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-white/10">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
            <h3 className="text-base font-bold text-white mb-1">Chưa có đề hoặc bài học trong mục này</h3>
            <p className="text-xs text-slate-400 mb-4">
              Thử tìm kiếm với từ khóa khác hoặc chuyển sang chuyên đề khác.
            </p>
            {isAdmin && (
              <button
                onClick={() => onOpenMaterialEditor(undefined, selectedPartId, selectedSubCat !== 'all' ? selectedSubCat : 'vietnamese')}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-semibold"
              >
                + Thêm tài liệu đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMaterials.map((mat) => {
              const unlockStatus = StorageService.getMaterialUnlockStatus(mat.id, mat.priceCoins);
              const isLocked = !unlockStatus.isUnlocked;
              return (
              <div
                key={mat.id}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 hover:border-violet-500/40 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {getBadgeForType(mat.type)}
                      {mat.isFeatured && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          ★ Trọng tâm V-ACT
                        </span>
                      )}
                      {(mat.priceCoins || 0) > 0 ? (
                        unlockStatus.isUnlocked ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Unlock className="w-3 h-3" />
                            <span>
                              Đã mở • {StorageService.formatRemainingUnlockTime(unlockStatus.remainingMs)}
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>Giá: {mat.priceCoins} Coin</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-violet-400" />
                              <span>
                                {mat.accessDurationHours && mat.accessDurationHours > 0
                                  ? `Hạn: ${mat.accessDurationHours} giờ`
                                  : '♾️ Vĩnh viễn'}
                              </span>
                            </span>
                          </>
                        )
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                          Miễn phí
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onOpenMaterialEditor(mat, selectedPartId);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          title="Sửa học liệu & Giá Coin"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDeleteMaterial(mat.id);
                          }}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                          title="Xóa học liệu ngay"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-violet-300 transition line-clamp-2 leading-snug">
                    {mat.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-3">
                    <span>{mat.author || 'V-ACT Master'}</span>
                    <span>•</span>
                    <span>{mat.date}</span>
                    <span>•</span>
                    <span>{mat.size}</span>
                    <span className="flex items-center gap-1 text-slate-300 ml-auto">
                      <Eye className="w-3.5 h-3.5 text-violet-400" />
                      <span>{mat.views}</span>
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-white/5">
                  {isLocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnlockFeedback(null);
                        setUnlockingMaterial(mat);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>
                        🔓 Mở khóa bằng {mat.priceCoins} S-Coin ({mat.accessDurationHours ? `${mat.accessDurationHours} giờ` : 'Vĩnh viễn'})
                      </span>
                    </button>
                  ) : (
                    <>
                      {onOpenExamOMR && (
                        <button
                          type="button"
                          onClick={() => {
                            onIncrementView(mat.id);
                            onOpenExamOMR(mat.title, 'vact');
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-extrabold flex items-center justify-center gap-1.5 transition"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>🎯 Làm bài bấm giờ (Mở phiếu trả lời)</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onIncrementView(mat.id);
                          setActivePreviewMaterial(mat);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trực tiếp</span>
                      </button>
                      <a
                        href={mat.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onIncrementView(mat.id)}
                        className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition"
                        title="Mở liên kết gốc"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    </>
                  )}
                  {currentUser && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        StorageService.toggleBookmark(currentUser.id, {
                          materialId: mat.id,
                          title: mat.title,
                          subjectId: currentPart.name,
                          type: mat.type,
                          url: mat.url,
                        });
                        setUnlockTick((t) => t + 1);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center gap-1 transition border ${
                        StorageService.isBookmarked(currentUser.id, mat.id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/50'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                      title="Lưu vào Tủ Tài Liệu Đánh Dấu riêng của tài khoản bạn"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          StorageService.isBookmarked(currentUser.id, mat.id)
                            ? 'fill-amber-400 text-amber-400'
                            : ''
                        }`}
                      />
                      <span>
                        {StorageService.isBookmarked(currentUser.id, mat.id) ? 'Đã lưu' : 'Lưu tủ đề'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        )}
      </>
    )}
  </div>

      {/* Material Preview Modal */}
      {activePreviewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 text-slate-100 shadow-2xl border border-white/10 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {getBadgeForType(activePreviewMaterial.type)}
                <h3 className="font-bold text-sm sm:text-base text-white truncate max-w-md">
                  {activePreviewMaterial.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePreviewMaterial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-white/5 text-xs space-y-2">
                <p className="text-slate-300 font-medium">
                  Tài liệu: <span className="text-white font-bold">{activePreviewMaterial.title}</span>
                </p>
                <p className="text-slate-400">
                  Tác giả / Nguồn: <span className="text-slate-200">{activePreviewMaterial.author}</span>
                </p>
                <p className="text-slate-400">
                  Dung lượng: <span className="text-slate-200">{activePreviewMaterial.size}</span>
                </p>
                <p className="text-slate-400">
                  Lượt xem: <span className="text-violet-400 font-mono font-bold">{activePreviewMaterial.views}</span>
                </p>
              </div>

              <div className="p-8 rounded-xl bg-violet-950/20 border border-violet-500/20 text-center">
                <Target className="w-12 h-12 text-violet-400 mx-auto mb-3" />
                <h4 className="font-bold text-white mb-1">Mở tài liệu V-ACT chính thức</h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto mb-4">
                  Đề thi & bảng phân tích đáp án chi tiết sẵn sàng tải về hoặc ôn luyện trực tuyến.
                </p>
                <a
                  href={activePreviewMaterial.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Mở xem toàn màn hình (Tab mới)</span>
                </a>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setActivePreviewMaterial(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* S-Coin Unlock Modal */}
      {unlockingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">Mở Khóa Học Liệu V-ACT</h3>
              </div>
              <button
                type="button"
                onClick={() => setUnlockingMaterial(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
              <p className="font-bold text-sm text-white">{unlockingMaterial.title}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Chi phí mở khóa:</span>
                <span className="font-extrabold text-amber-300 text-sm">🪙 {unlockingMaterial.priceCoins} S-Coin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời hạn truy cập:</span>
                <span className="font-bold text-violet-300">
                  {unlockingMaterial.accessDurationHours && unlockingMaterial.accessDurationHours > 0
                    ? `⏱️ ${unlockingMaterial.accessDurationHours} giờ kể từ lúc mở`
                    : '♾️ Vĩnh viễn (Không giới hạn)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Số dư hiện tại của bạn:</span>
                <span className="font-bold text-emerald-400">
                  🪙 {StorageService.getCoins()} Coin • 🎟️ {StorageService.getVipTickets()} Vé VIP
                </span>
              </div>
            </div>

            {unlockFeedback && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-semibold">
                {unlockFeedback}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {StorageService.getVipTickets() > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const res = StorageService.unlockMaterialWithCoins(
                      unlockingMaterial.id,
                      unlockingMaterial.priceCoins || 0,
                      unlockingMaterial.accessDurationHours,
                      true
                    );
                    if (res.success) {
                      const target = unlockingMaterial;
                      setUnlockingMaterial(null);
                      setActivePreviewMaterial(target);
                    } else {
                      setUnlockFeedback(res.message);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow"
                >
                  🎟️ Dùng 1 Vé VIP (Miễn phí Coin)
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const res = StorageService.unlockMaterialWithCoins(
                    unlockingMaterial.id,
                    unlockingMaterial.priceCoins || 0,
                    unlockingMaterial.accessDurationHours,
                    false
                  );
                  if (res.success) {
                    const target = unlockingMaterial;
                    setUnlockingMaterial(null);
                    setActivePreviewMaterial(target);
                  } else {
                    setUnlockFeedback(res.message);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold transition shadow-lg"
              >
                🔓 Xác nhận mở ({unlockingMaterial.priceCoins} Coin)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
