import React, { useState } from 'react';
import {
  Folder,
  FolderPlus,
  FilePlus,
  Link as LinkIcon,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Eye,
  Trash2,
  Edit2,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Plus,
  X,
  Palette,
  Search,
  Filter,
  GraduationCap,
  BookOpen,
  Compass,
  Check,
  Maximize2,
  Target,
  Lock,
  Unlock,
  Clock,
} from 'lucide-react';
import { Teacher, StudyFolder, StudyFileItem, MaterialType } from '../types';
import { StorageService } from '../services/storage';

interface Props {
  subjectId: string;
  subjectName: string;
  subjectCode?: string;
  subjectColor?: string;
  isAdmin: boolean;
  onOpenExamOMR?: (title?: string, mode?: 'thptqg' | 'vact') => void;
  theme?: 'dark' | 'light';
}

export const NestedFolderExplorer: React.FC<Props> = ({
  subjectId,
  subjectName,
  subjectCode = 'THPTQG',
  subjectColor = 'from-indigo-600 to-purple-600',
  isAdmin,
  onOpenExamOMR,
  theme = 'dark',
}) => {
  // Navigation hierarchy:
  // Level 3: Selected teacher (null means show Teacher Zone cards)
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Level 4+: Current folder hierarchy trail: [{ id: 'f1', name: 'Chuyên đề 1' }]
  const [folderTrail, setFolderTrail] = useState<{ id: string; name: string }[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modals for Admin Actions
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<StudyFolder | null>(null);

  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [editingFile, setEditingFile] = useState<StudyFileItem | null>(null);

  // Preview modal for Files
  const [previewFile, setPreviewFile] = useState<StudyFileItem | null>(null);

  // Form states for Teacher
  const [teacherName, setTeacherName] = useState('');
  const [teacherTitle, setTeacherTitle] = useState('');
  const [teacherAvatar, setTeacherAvatar] = useState('');
  const [teacherBadge, setTeacherBadge] = useState('');
  const [teacherDesc, setTeacherDesc] = useState('');
  const [teacherColor, setTeacherColor] = useState('from-indigo-600 via-purple-600 to-pink-500');

  // Form states for Folder
  const [folderName, setFolderName] = useState('');
  const [folderDesc, setFolderDesc] = useState('');
  const [folderColor, setFolderColor] = useState('from-indigo-600 to-purple-600');
  const [folderIcon, setFolderIcon] = useState('Folder');

  // Form states for File / Link
  const [fileTitle, setFileTitle] = useState('');
  const [fileType, setFileType] = useState<MaterialType | 'link'>('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileNotes, setFileNotes] = useState('');
  const [filePriceCoins, setFilePriceCoins] = useState<number>(0);
  const [fileDurationHours, setFileDurationHours] = useState<number>(0);

  // Coin Unlock Modal for StudyFileItem
  const [unlockingFile, setUnlockingFile] = useState<StudyFileItem | null>(null);
  const [unlockFeedback, setUnlockFeedback] = useState<string | null>(null);
  const [contributionBanner, setContributionBanner] = useState<string | null>(null);

  // Data fetching
  const [teachers, setTeachers] = useState<Teacher[]>(() => StorageService.getTeachers(subjectId));
  const [folders, setFolders] = useState<StudyFolder[]>(() => StorageService.getAllFolders());
  const [studyFiles, setStudyFiles] = useState<StudyFileItem[]>(() => StorageService.getStudyFiles());

  const handleRefreshData = () => {
    setTeachers(StorageService.getTeachers(subjectId));
    setFolders(StorageService.getAllFolders());
    setStudyFiles(StorageService.getStudyFiles());
  };

  React.useEffect(() => {
    handleRefreshData();
  }, [subjectId]);

  React.useEffect(() => {
    const unsub = StorageService.subscribe((type) => {
      if (
        type === 'TEACHERS_CHANGED' ||
        type === 'FOLDERS_CHANGED' ||
        type === 'STUDY_FILES_CHANGED' ||
        type === 'MATERIAL_UNLOCKS_CHANGED' ||
        type === 'COINS_UPDATED'
      ) {
        handleRefreshData();
      }
    });
    return unsub;
  }, [subjectId]);

  const currentTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const currentParentFolderId = folderTrail.length > 0 ? folderTrail[folderTrail.length - 1].id : undefined;

  // Filter folders in the current view level
  const currentFolders = folders.filter((f) => {
    if (f.subjectId !== subjectId) return false;
    if (selectedTeacherId && f.teacherId !== selectedTeacherId) return false;
    if (f.parentId !== currentParentFolderId) return false;
    if (searchQuery.trim()) {
      return f.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Filter files in the current view level
  const currentFiles = studyFiles.filter((f) => {
    if (f.subjectId !== subjectId) return false;
    if (selectedTeacherId && f.teacherId !== selectedTeacherId) return false;
    if (f.folderId !== currentParentFolderId) return false;
    if (typeFilter !== 'all' && f.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return f.title.toLowerCase().includes(q) || (f.notes && f.notes.toLowerCase().includes(q));
    }
    return true;
  });

  // Navigate to folder
  const handleOpenFolder = (folder: StudyFolder) => {
    setFolderTrail((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  // Breadcrumb step click
  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      // Root of this teacher or subject
      setFolderTrail([]);
    } else {
      setFolderTrail((prev) => prev.slice(0, index + 1));
    }
  };

  // File upload reader
  const handleLocalFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileTitle(file.name.replace(/\.[^/.]+$/, ''));
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') setFileType('pdf');
    else if (['doc', 'docx'].includes(ext || '')) setFileType('doc');
    else if (['mp3', 'wav', 'm4a'].includes(ext || '')) setFileType('audio');
    else if (['mp4', 'mov', 'webm'].includes(ext || '')) setFileType('video');
    else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) setFileType('image');

    const reader = new FileReader();
    reader.onload = () => {
      setFileUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save Folder
  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    const folder: StudyFolder = {
      id: editingFolder ? editingFolder.id : `fold-${Date.now()}`,
      parentId: currentParentFolderId,
      teacherId: selectedTeacherId || undefined,
      subjectId,
      name: folderName.trim(),
      description: folderDesc.trim() || undefined,
      color: folderColor,
      icon: folderIcon,
      createdAt: editingFolder ? editingFolder.createdAt : Date.now(),
    };

    StorageService.saveFolder(folder);
    handleRefreshData();
    setShowAddFolderModal(false);
    setEditingFolder(null);
    setFolderName('');
    setFolderDesc('');
  };

  // Save File
  const handleSaveFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileTitle.trim() || !fileUrl.trim()) return;

    const currentUser = StorageService.getCurrentUser();
    const file: StudyFileItem = {
      id: editingFile ? editingFile.id : `file-${Date.now()}`,
      folderId: currentParentFolderId,
      teacherId: selectedTeacherId || undefined,
      subjectId,
      title: fileTitle.trim(),
      type: fileType,
      fileUrl: fileUrl.trim(),
      size: fileSize.trim() || 'Online File',
      date: new Date().toLocaleDateString('vi-VN'),
      notes: fileNotes.trim() || undefined,
      views: editingFile ? editingFile.views : 0,
      priceCoins: isAdmin ? Math.max(0, Number(filePriceCoins) || 0) : 0,
      accessDurationHours: isAdmin ? Math.max(0, Number(fileDurationHours) || 0) : 0,
      approvalStatus: isAdmin ? 'approved' : 'pending',
      submittedBy: currentUser?.displayName || 'Sĩ tử đóng góp',
      submittedById: currentUser?.id,
    };

    StorageService.saveStudyFile(file);
    handleRefreshData();
    setShowAddFileModal(false);
    setEditingFile(null);
    setFileTitle('');
    setFileUrl('');
    setFileSize('');
    setFileNotes('');
    setFilePriceCoins(0);
    setFileDurationHours(0);
    if (!isAdmin) {
      setContributionBanner(
        '📤 Đã gửi tài liệu vào Hàng Đợi Duyệt của Admin! Bạn sẽ tự động nhận +50 S-Coin ngay khi Admin duyệt bài.'
      );
      setTimeout(() => setContributionBanner(null), 5000);
    }
  };

  // Save Teacher
  const handleSaveTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) return;

    const teacher: Teacher = {
      id: editingTeacher ? editingTeacher.id : `tc-${Date.now()}`,
      subjectId,
      name: teacherName.trim(),
      title: teacherTitle.trim() || 'Giáo viên Chuyên Môn',
      avatar: teacherAvatar.trim() || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      badge: teacherBadge.trim() || '8.5+ THPTQG',
      color: teacherColor,
      description: teacherDesc.trim() || 'Chuyên gia luyện thi bám sát cấu trúc mới.',
      totalMaterials: editingTeacher ? editingTeacher.totalMaterials : 15,
    };

    StorageService.saveTeacher(teacher);
    handleRefreshData();
    setShowAddTeacherModal(false);
    setEditingTeacher(null);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'doc':
        return <FileText className="w-5 h-5 text-blue-400" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-400" />;
      case 'audio':
        return <Music className="w-5 h-5 text-amber-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      case 'link':
        return <LinkIcon className="w-5 h-5 text-cyan-400" />;
      default:
        return <FileText className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* --- LEVEL 3: TEACHER ZONES (When no teacher is selected yet) --- */}
      {selectedTeacherId === null ? (
        <div className="space-y-6">
          {/* Header of Teacher Area */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>Không gian Thầy Cô Chuyên Dạy & Luyện Đề</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Chọn Thầy / Cô để truy cập toàn bộ cây thư mục bài giảng, đề thi và học liệu độc quyền.
              </p>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  setEditingTeacher(null);
                  setTeacherName('');
                  setTeacherTitle('');
                  setTeacherAvatar('');
                  setTeacherBadge('');
                  setTeacherDesc('');
                  setShowAddTeacherModal(true);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Thầy Cô Mới</span>
              </button>
            )}
          </div>

          {/* Teacher Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Gradient Accent Bar */}
                <div className={`h-1.5 w-full -mt-5 -mx-5 mb-1 bg-gradient-to-r ${teacher.color}`} />

                <div className="space-y-3">
                  {/* Avatar & Title */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-white/10 shadow-md group-hover:scale-105 transition"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-indigo-300 border border-white/10">
                          {teacher.badge}
                        </span>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTeacher(teacher);
                                setTeacherName(teacher.name);
                                setTeacherTitle(teacher.title);
                                setTeacherAvatar(teacher.avatar);
                                setTeacherBadge(teacher.badge);
                                setTeacherDesc(teacher.description);
                                setTeacherColor(teacher.color);
                                setShowAddTeacherModal(true);
                              }}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Sửa thông tin Thầy/Cô"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                StorageService.deleteTeacher(teacher.id);
                                handleRefreshData();
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                              title="Xóa Thầy/Cô ngay"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className="font-extrabold text-base text-white mt-1 group-hover:text-indigo-400 transition truncate">
                        {teacher.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate">{teacher.title}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                    {teacher.description}
                  </p>

                  {teacher.quote && (
                    <p className="text-[11px] italic text-slate-400 border-l-2 border-indigo-500/40 pl-2 py-0.5">
                      {teacher.quote}
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <button
                  type="button"
                  onClick={() => setSelectedTeacherId(teacher.id)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${teacher.color} hover:brightness-110 shadow-md flex items-center justify-center gap-2 transition`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Vào phòng học của {teacher.name}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- LEVEL 4+: NESTED FOLDER EXPLORER OF SELECTED TEACHER --- */
        <div className="space-y-5">
          {/* Top Return & Teacher Info Header */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedTeacherId(null);
                  setFolderTrail([]);
                }}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold shrink-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Đổi Thầy / Cô</span>
              </button>

              {currentTeacher && (
                <div className="flex items-center gap-3">
                  <img
                    src={currentTeacher.avatar}
                    alt={currentTeacher.name}
                    className="w-9 h-9 rounded-xl object-cover border border-white/20"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{currentTeacher.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {currentTeacher.badge}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">{currentTeacher.title}</span>
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING ADMIN OR USER CONTRIBUTION TOOLBAR AT THIS LEVEL */}
            <div className="flex items-center gap-2 flex-wrap">
              {isAdmin ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFolder(null);
                      setFolderName('');
                      setFolderDesc('');
                      setShowAddFolderModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>+ Tạo Thư Mục Con</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingFile(null);
                      setFileTitle('');
                      setFileUrl('');
                      setFileSize('');
                      setFileNotes('');
                      setFilePriceCoins(0);
                      setFileDurationHours(0);
                      setShowAddFileModal(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition"
                  >
                    <FilePlus className="w-4 h-4" />
                    <span>+ Tải File / Link Mới</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFile(null);
                    setFileTitle('');
                    setFileUrl('');
                    setFileSize('');
                    setFileNotes('');
                    setFilePriceCoins(0);
                    setFileDurationHours(0);
                    setShowAddFileModal(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow transition"
                >
                  <FilePlus className="w-4 h-4" />
                  <span>📤 Đóng góp tài liệu (+50 Coin)</span>
                </button>
              )}
            </div>
          </div>

          {contributionBanner && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-200 text-xs font-bold flex items-center justify-between">
              <span>{contributionBanner}</span>
              <button
                type="button"
                onClick={() => setContributionBanner(null)}
                className="text-emerald-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Breadcrumb Navigation Trail */}
          <div className="flex items-center gap-2 text-xs text-slate-300 overflow-x-auto py-1 scrollbar-none">
            <button
              type="button"
              onClick={() => handleBreadcrumbClick(-1)}
              className="hover:text-indigo-400 flex items-center gap-1 font-semibold text-slate-400 hover:underline shrink-0"
            >
              <span>{currentTeacher ? currentTeacher.name : subjectName}</span>
            </button>

            {folderTrail.map((crumb, idx) => (
              <React.Fragment key={crumb.id}>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <button
                  type="button"
                  onClick={() => handleBreadcrumbClick(idx)}
                  className={`hover:text-indigo-400 font-semibold shrink-0 ${
                    idx === folderTrail.length - 1 ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:underline'
                  }`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search within this folder */}
          <div className="glass-panel rounded-2xl p-3 border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bài học, tài liệu, video trong thư mục này..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl glass-input border border-white/10 text-white"
              >
                <option value="all" className="bg-slate-900 text-white">Tất cả định dạng</option>
                <option value="pdf" className="bg-slate-900 text-white">Tệp PDF</option>
                <option value="doc" className="bg-slate-900 text-white">Tệp Word</option>
                <option value="video" className="bg-slate-900 text-white">Video bài giảng</option>
                <option value="audio" className="bg-slate-900 text-white">Audio Podcast</option>
                <option value="link" className="bg-slate-900 text-white">Link trực tuyến</option>
              </select>
            </div>
          </div>

          {/* Content of Current Folder */}
          <div className="space-y-6">
            {/* 1. Sub-folders Grid */}
            {currentFolders.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Folder className="w-4 h-4 text-indigo-400" />
                  <span>Thư mục bài học ({currentFolders.length})</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {currentFolders.map((fld) => (
                    <div
                      key={fld.id}
                      onClick={() => handleOpenFolder(fld)}
                      className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 cursor-pointer transition flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${fld.color} text-white flex items-center justify-center shrink-0 shadow`}>
                          <Folder className="w-5 h-5 fill-current" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-white group-hover:text-indigo-400 transition truncate">
                            {fld.name}
                          </h4>
                          {fld.description && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{fld.description}</p>
                          )}
                        </div>
                      </div>

                      {isAdmin && (
                        <div
                          className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setEditingFolder(fld);
                              setFolderName(fld.name);
                              setFolderDesc(fld.description || '');
                              setFolderColor(fld.color);
                              setShowAddFolderModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            title="Sửa thư mục"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              StorageService.deleteFolder(fld.id);
                              handleRefreshData();
                            }}
                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                            title="Xóa thư mục ngay"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Files and Links List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-400" />
                <span>Tài liệu & Bài giảng trực tuyến ({currentFiles.length})</span>
              </h3>

              {currentFiles.length === 0 && currentFolders.length === 0 ? (
                <div className="glass-panel rounded-2xl p-8 text-center border border-white/10 space-y-2">
                  <p className="text-sm text-slate-400">Thư mục này hiện đang trống.</p>
                  {isAdmin && (
                    <p className="text-xs text-indigo-400">
                      Hãy dùng thanh công cụ phía trên để tạo thư mục con hoặc tải file/link lên!
                    </p>
                  )}
                </div>
              ) : (
                <div className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                  {currentFiles.map((file) => {
                    const unlockStatus = StorageService.getMaterialUnlockStatus(file.id, file.priceCoins);
                    const isLocked = !unlockStatus.isUnlocked;
                    return (
                    <div
                      key={file.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                          {getFileIcon(file.type)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-semibold text-xs sm:text-sm text-white group-hover:text-indigo-400 transition truncate">
                              {file.title}
                            </h4>
                            {(file.priceCoins || 0) > 0 ? (
                              unlockStatus.isUnlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>Đã mở • {StorageService.formatRemainingUnlockTime(unlockStatus.remainingMs)}</span>
                                </span>
                              ) : (
                                <>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                                    <Lock className="w-2.5 h-2.5" />
                                    <span>Giá: {file.priceCoins} Coin</span>
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-white/10 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-indigo-400" />
                                    <span>
                                      {file.accessDurationHours && file.accessDurationHours > 0
                                        ? `Hạn: ${file.accessDurationHours} giờ`
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
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span className="uppercase font-bold text-slate-300">{file.type}</span>
                            <span>•</span>
                            <span>{file.size}</span>
                            <span>•</span>
                            <span>{file.date}</span>
                            {file.notes && (
                              <>
                                <span>•</span>
                                <span className="truncate max-w-[200px] text-slate-400 italic">{file.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {isLocked ? (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUnlockFeedback(null);
                              setUnlockingFile(file);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow transition"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>🔓 Mở khóa ({file.priceCoins} Coin)</span>
                          </button>
                        ) : (
                          <>
                            {onOpenExamOMR && (
                              <button
                                type="button"
                                onClick={() => {
                                  StorageService.incrementStudyFileView(file.id);
                                  onOpenExamOMR(file.title, subjectId.startsWith('vact') ? 'vact' : 'thptqg');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-extrabold flex items-center gap-1.5 transition"
                              >
                                <Target className="w-3.5 h-3.5" />
                                <span>🎯 Làm bài bấm giờ (Mở phiếu trả lời)</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                StorageService.incrementStudyFileView(file.id);
                                setPreviewFile(file);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem nhanh</span>
                            </button>

                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={file.type !== 'link'}
                              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                              title="Tải về hoặc mở link"
                            >
                              {file.type === 'link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                            </a>
                          </>
                        )}

                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                setEditingFile(file);
                                setFileTitle(file.title);
                                setFileType(file.type);
                                setFileUrl(file.fileUrl);
                                setFileSize(file.size || '');
                                setFileNotes(file.notes || '');
                                setFilePriceCoins(file.priceCoins || 0);
                                setFileDurationHours(file.accessDurationHours || 0);
                                setShowAddFileModal(true);
                              }}
                              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                              title="Sửa tệp & Giá Coin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                StorageService.deleteStudyFile(file.id);
                                handleRefreshData();
                              }}
                              className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/20 transition"
                              title="Xóa tệp này ngay"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT FOLDER --- */}
      {showAddFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-400" />
                <span>+ Tạo Thư Mục Bài Học Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFolderModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên thư mục:</label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="VD: Chuyên đề 2: Tích phân & Hình học Oxyz..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mô tả tóm tắt nội dung:</label>
                <textarea
                  rows={2}
                  value={folderDesc}
                  onChange={(e) => setFolderDesc(e.target.value)}
                  placeholder="Mô tả các bài tập, video hoặc tài liệu có trong thư mục này..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Màu sắc chủ đạo:</label>
                <select
                  value={folderColor}
                  onChange={(e) => setFolderColor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                >
                  <option value="from-indigo-600 to-purple-600" className="bg-slate-900 text-white">Tím Ngân Hà (Indigo / Purple)</option>
                  <option value="from-rose-500 to-pink-600" className="bg-slate-900 text-white">Hồng Đào (Rose / Pink)</option>
                  <option value="from-blue-600 to-cyan-600" className="bg-slate-900 text-white">Xanh Biển (Blue / Cyan)</option>
                  <option value="from-emerald-500 to-teal-600" className="bg-slate-900 text-white">Xanh Bạc Hà (Emerald / Teal)</option>
                  <option value="from-amber-500 to-orange-600" className="bg-slate-900 text-white">Cam San Hô (Amber / Orange)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow"
                >
                  Tạo thư mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT FILE & LINK --- */}
      {showAddFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-purple-400" />
                <span>+ Thêm Tệp Tin / Bài Giảng / Đường Link Mới</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFileModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Định dạng nội dung:</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                >
                  <option value="pdf" className="bg-slate-900 text-white">Tài liệu PDF (Đề thi, sách, tóm tắt)</option>
                  <option value="doc" className="bg-slate-900 text-white">Tài liệu Word (.docx / .doc)</option>
                  <option value="video" className="bg-slate-900 text-white">Video Bài Giảng (YouTube / MP4)</option>
                  <option value="audio" className="bg-slate-900 text-white">Audio Podcast (Giọng đọc văn / Audio)</option>
                  <option value="link" className="bg-slate-900 text-white">Đường Link Trực Tuyến (Drive, Test, Meet)</option>
                  <option value="image" className="bg-slate-900 text-white">Hình Ảnh / Sơ Đồ Tư Duy (Mindmap)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu đề bài giảng / tài liệu:</label>
                <input
                  type="text"
                  required
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="VD: 50 Mẹo bấm máy Casio 880BTG xử lý tích phân..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
                />
              </div>

              {/* Upload from device OR enter URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đường dẫn (URL) hoặc tải file trực tiếp từ máy tính:
                </label>
                <div className="flex gap-2">
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition shrink-0">
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Chọn file từ máy</span>
                    <input type="file" onChange={handleLocalFileUpload} className="hidden" />
                  </label>

                  <input
                    type="text"
                    required
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/... hoặc link tài liệu"
                    className="flex-1 px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Dung lượng / Thời lượng:</label>
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="VD: 15.4 MB, 45 phút..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi chú bổ sung:</label>
                  <input
                    type="text"
                    value={fileNotes}
                    onChange={(e) => setFileNotes(e.target.value)}
                    placeholder="VD: Có đáp án chi tiết trang 12..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                  />
                </div>
              </div>

              {/* v5.0 Coin Price & Expiration Duration */}
              <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>🪙 Cài đặt Mở khóa bằng S-Coin & Thời hạn</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 font-bold">
                    {filePriceCoins > 0 ? `Thu phí: ${filePriceCoins} Coin` : 'Miễn phí (0 Coin)'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Giá mở khóa (S-Coin):</label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={filePriceCoins}
                      onChange={(e) => setFilePriceCoins(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input border border-white/15 text-white font-mono"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[0, 30, 50, 100].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setFilePriceCoins(v)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            filePriceCoins === v ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {v === 0 ? 'Miễn phí' : `${v} Coin`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-300 mb-1">Thời hạn truy cập (Giờ, 0 = Vĩnh viễn):</label>
                    <input
                      type="number"
                      min="0"
                      value={fileDurationHours}
                      onChange={(e) => setFileDurationHours(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs rounded-xl glass-input border border-white/15 text-white font-mono"
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[
                        { l: '♾️ Vĩnh viễn', v: 0 },
                        { l: '6g', v: 6 },
                        { l: '24g', v: 24 },
                        { l: '7 ngày', v: 168 },
                      ].map((opt) => (
                        <button
                          key={opt.v}
                          type="button"
                          onClick={() => setFileDurationHours(opt.v)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fileDurationHours === opt.v ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFileModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow"
                >
                  Lưu tài liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: CREATE / EDIT TEACHER --- */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md glass-panel rounded-3xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <span>{editingTeacher ? 'Sửa Thông Tin Thầy / Cô' : '+ Thêm Thầy / Cô Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTeacher} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Thầy / Cô:</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  placeholder="VD: Cô Sương Mai, Thầy Đỗ Văn Đức..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Chức danh / Thành tích:</label>
                <input
                  type="text"
                  value={teacherTitle}
                  onChange={(e) => setTeacherTitle(e.target.value)}
                  placeholder="VD: Thủ khoa Sư Phạm • Chuyên gia NLVH 9+..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ảnh đại diện Thầy / Cô (URL):</label>
                <input
                  type="url"
                  value={teacherAvatar}
                  onChange={(e) => setTeacherAvatar(e.target.value)}
                  placeholder="https://... ảnh avatar"
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Huy hiệu (Badge):</label>
                  <input
                    type="text"
                    value={teacherBadge}
                    onChange={(e) => setTeacherBadge(e.target.value)}
                    placeholder="VD: Văn Học 8.5+, 9+ Casio..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Màu sắc:</label>
                  <select
                    value={teacherColor}
                    onChange={(e) => setTeacherColor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                  >
                    <option value="from-rose-500 via-pink-500 to-amber-500" className="bg-slate-900 text-white">Hồng Đào (Văn)</option>
                    <option value="from-indigo-600 via-purple-600 to-pink-500" className="bg-slate-900 text-white">Tím Ngân Hà (Toán)</option>
                    <option value="from-cyan-500 via-teal-500 to-emerald-500" className="bg-slate-900 text-white">Xanh Ngọc (Anh)</option>
                    <option value="from-blue-600 via-indigo-600 to-violet-600" className="bg-slate-900 text-white">Xanh Dương (Lý)</option>
                    <option value="from-emerald-500 via-green-500 to-teal-600" className="bg-slate-900 text-white">Lục Bảo (Sinh)</option>
                    <option value="from-purple-600 via-indigo-600 to-blue-500" className="bg-slate-900 text-white">V-ACT Logic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Giới thiệu phương pháp giảng dạy:</label>
                <textarea
                  rows={2}
                  value={teacherDesc}
                  onChange={(e) => setTeacherDesc(e.target.value)}
                  placeholder="Mô tả phong cách, thế mạnh và phương pháp truyền cảm hứng..."
                  className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow"
                >
                  Lưu thông tin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- PREVIEW MODAL FOR FILES --- */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-3xl glass-panel rounded-3xl border border-white/20 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                {getFileIcon(previewFile.type)}
                <h3 className="font-bold text-base text-white truncate max-w-xl">{previewFile.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span>Định dạng: <strong className="text-white uppercase">{previewFile.type}</strong></span>
                <span>Dung lượng: <strong className="text-white">{previewFile.size}</strong></span>
                <span>Ngày cập nhật: <strong className="text-white">{previewFile.date}</strong></span>
                <span>Lượt xem: <strong className="text-indigo-400">{previewFile.views || 1}</strong></span>
              </div>

              {previewFile.notes && (
                <p className="text-xs text-slate-400 italic bg-white/5 p-3 rounded-xl border border-white/5">
                  “{previewFile.notes}”
                </p>
              )}

              {/* Render audio player if file is audio */}
              {previewFile.type === 'audio' && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                  <audio controls className="w-full">
                    <source src={previewFile.fileUrl} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ phát audio.
                  </audio>
                </div>
              )}

              {/* Render image if file is image */}
              {previewFile.type === 'image' && (
                <div className="max-h-96 overflow-hidden rounded-xl border border-white/10">
                  <img src={previewFile.fileUrl} alt={previewFile.title} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Đóng
              </button>

              {onOpenExamOMR && (
                <button
                  type="button"
                  onClick={() => {
                    const title = previewFile.title;
                    setPreviewFile(null);
                    onOpenExamOMR(title, subjectId.startsWith('vact') ? 'vact' : 'thptqg');
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow"
                >
                  <Target className="w-4 h-4" />
                  <span>🎯 Làm bài bấm giờ (Mở phiếu trả lời)</span>
                </button>
              )}

              <a
                href={previewFile.fileUrl}
                target="_blank"
                rel="noreferrer"
                download={previewFile.type !== 'link'}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                {previewFile.type === 'link' ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                <span>{previewFile.type === 'link' ? 'Mở liên kết ngay' : 'Tải tài liệu về máy'}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* --- COIN UNLOCK MODAL FOR TEACHER FILES --- */}
      {unlockingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-400">
                <Lock className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-white">Mở Khóa Tài Liệu Thầy / Cô</h3>
              </div>
              <button
                type="button"
                onClick={() => setUnlockingFile(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 text-xs">
              <p className="font-bold text-sm text-white">{unlockingFile.title}</p>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Chi phí mở khóa:</span>
                <span className="font-extrabold text-amber-300 text-sm">🪙 {unlockingFile.priceCoins} S-Coin</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Thời hạn truy cập:</span>
                <span className="font-bold text-indigo-300">
                  {unlockingFile.accessDurationHours && unlockingFile.accessDurationHours > 0
                    ? `⏱️ ${unlockingFile.accessDurationHours} giờ kể từ lúc mở`
                    : '♾️ Vĩnh viễn (Không giới hạn)'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-slate-400">Số dư hiện tại:</span>
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
                      unlockingFile.id,
                      unlockingFile.priceCoins || 0,
                      unlockingFile.accessDurationHours,
                      true
                    );
                    if (res.success) {
                      const target = unlockingFile;
                      setUnlockingFile(null);
                      setPreviewFile(target);
                      handleRefreshData();
                    } else {
                      setUnlockFeedback(res.message);
                    }
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow"
                >
                  🎟️ Dùng 1 Vé VIP
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const res = StorageService.unlockMaterialWithCoins(
                    unlockingFile.id,
                    unlockingFile.priceCoins || 0,
                    unlockingFile.accessDurationHours,
                    false
                  );
                  if (res.success) {
                    const target = unlockingFile;
                    setUnlockingFile(null);
                    setPreviewFile(target);
                    handleRefreshData();
                  } else {
                    setUnlockFeedback(res.message);
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-extrabold transition shadow-lg"
              >
                🔓 Xác nhận mở ({unlockingFile.priceCoins} Coin)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
