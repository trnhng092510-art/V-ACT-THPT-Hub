import React, { useState } from 'react';
import {
  Sparkles,
  Layout,
  Sliders,
  Trophy,
  Sticker,
  Database,
  Calendar,
  X,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Edit2,
  Lock,
  Unlock,
  Palette,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Flame,
  FileText,
  Clock,
  Layers,
  GraduationCap,
  Volume2,
  Shield,
  Key,
  UserCheck,
  UserX,
  LayoutDashboard,
  Search,
  CheckSquare,
  Square,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  ExternalLink,
  Compass,
  Target,
  BookOpen,
  Coins,
  Gift,
  Upload,
  Play,
  ShoppingBag,
  Calculator,
  Inbox,
} from 'lucide-react';
import {
  LandingCoverConfig,
  MicroUIConfig,
  BlinkBlinkConfig,
  LoadingConfig,
  StickerPack,
  StickerItem,
  User,
  StudyMaterial,
  StudyFileItem,
  ExamCountdownConfig,
  FooterConfig,
  BackgroundConfig,
  DashboardWidget,
  NavbarConfig,
  NavbarItem,
  StatsConfig,
  ShopItem,
  UniversityFormulaProfile,
  UniversityMajor,
  UniversityAdmissionMethod,
  FormulaVariable,
} from '../types';
import { StorageService } from '../services/storage';
import {
  LOADING_GIF_PRESETS,
  DEFAULT_UNIVERSITY_DISCLAIMER_NOTE,
} from '../data/initialData';
import { formatTime } from '../utils/timer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveLandingCover: (cfg: LandingCoverConfig) => void;
  onSaveMicroUI: (cfg: MicroUIConfig) => void;
  onSaveBlinkBlink: (cfg: BlinkBlinkConfig) => void;
  onSaveLoading: (cfg: LoadingConfig) => void;
  onSaveExamCountdown: (cfg: ExamCountdownConfig) => void;
  onSaveFooter: (cfg: FooterConfig) => void;
  onReloadAllData: () => void;
}

export const AdminStudio: React.FC<Props> = ({
  isOpen,
  onClose,
  onSaveLandingCover,
  onSaveMicroUI,
  onSaveBlinkBlink,
  onSaveLoading,
  onSaveExamCountdown,
  onSaveFooter,
  onReloadAllData,
}) => {
  const [activeCenter, setActiveCenter] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Center 1: Master Dashboard Sync Builder State
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => StorageService.getWidgets());
  const [newWidgetTitle, setNewWidgetTitle] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<DashboardWidget['type']>('announcement');
  const [newWidgetGridSpan, setNewWidgetGridSpan] = useState<'half' | 'full'>('half');
  const [newWidgetBadge, setNewWidgetBadge] = useState('');
  const [newWidgetContent, setNewWidgetContent] = useState('');
  const [newWidgetColor, setNewWidgetColor] = useState('glass-panel');
  const [newWidgetImageUrl, setNewWidgetImageUrl] = useState('');
  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);

  // Center 2: Landing Cover State
  const [landingConfig, setLandingConfig] = useState<LandingCoverConfig>(() =>
    StorageService.getLandingCoverConfig()
  );

  // Center 3: Micro-UI Customizer State
  const [microUIConfig, setMicroUIConfig] = useState<MicroUIConfig>(() =>
    StorageService.getMicroUIConfig()
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() =>
    StorageService.getFooterConfig()
  );

  // Center 4: Blink-Blink Engine & Loading GIF
  const [blinkConfig, setBlinkConfig] = useState<BlinkBlinkConfig>(() =>
    StorageService.getBlinkBlinkConfig()
  );
  const [loadingConfig, setLoadingConfig] = useState<LoadingConfig>(() =>
    StorageService.getLoadingConfig()
  );
  const [showFullLoadingPreview, setShowFullLoadingPreview] = useState(false);

  // Center 5: Leaderboard Management
  const [users, setUsers] = useState<User[]>(() => StorageService.getAllUsers());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingUserTime, setEditingUserTime] = useState<{ id: string; minutes: number } | null>(null);

  // Center 6: Sticker Pack Manager
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>(() =>
    StorageService.getStickerPacks()
  );
  const [newPackName, setNewPackName] = useState('');
  const [newPackIcon, setNewPackIcon] = useState('🌟');
  const [newStickerUrl, setNewStickerUrl] = useState('');
  const [newStickerName, setNewStickerName] = useState('');
  const [selectedPackForUpload, setSelectedPackForUpload] = useState<string>(
    stickerPacks[0]?.id || ''
  );

  // Center 7: Materials, Countdowns & Firebase
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => StorageService.getMaterials());
  const [firebaseJson, setFirebaseJson] = useState(() => {
    const cfg = StorageService.getFirebaseConfig();
    return cfg.apiKey ? JSON.stringify(cfg, null, 2) : '';
  });
  const [countdownConfig, setCountdownConfig] = useState<ExamCountdownConfig>(() =>
    StorageService.getExamCountdownConfig()
  );

  // Center 8: Co-Admin, Bulk Delete & Security State
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [quickGrantTarget, setQuickGrantTarget] = useState('');
  const [newAdminPin, setNewAdminPin] = useState('');
  const [confirmAdminPin, setConfirmAdminPin] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // v4.1: Dynamic Navbar Customizer State
  const [navbarConfig, setNavbarConfig] = useState<NavbarConfig>(() =>
    StorageService.getNavbarConfig()
  );
  const [editingNavItem, setEditingNavItem] = useState<NavbarItem | null>(null);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavIcon, setNewNavIcon] = useState('Compass');
  const [newNavType, setNewNavType] = useState<'tab' | 'custom_view' | 'external_link'>('custom_view');
  const [newNavTarget, setNewNavTarget] = useState('');
  const [newNavActiveColor, setNewNavActiveColor] = useState('bg-indigo-600');
  const [newNavCustomContent, setNewNavCustomContent] = useState('');

  // v4.1: Eye Stats Admin State
  const [statsConfig, setStatsConfig] = useState<StatsConfig>(() =>
    StorageService.getStatsConfig()
  );
  const [customPageViews, setCustomPageViews] = useState<string>(() =>
    StorageService.getStatsConfig().totalViews.toString()
  );

  // v6.1: Pending User Material Queue State
  const [pendingMaterials, setPendingMaterials] = useState<StudyMaterial[]>(() =>
    StorageService.getPendingMaterials()
  );
  const [pendingStudyFiles, setPendingStudyFiles] = useState<StudyFileItem[]>(() =>
    StorageService.getPendingStudyFiles()
  );

  // v6.1: Center 9 - Custom Shop Builder State
  const [shopItems, setShopItems] = useState<ShopItem[]>(() => StorageService.getShopItems());
  const [editingShopItem, setEditingShopItem] = useState<ShopItem | null>(null);
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');
  const [shopType, setShopType] = useState<ShopItem['type']>('frame');
  const [shopPrice, setShopPrice] = useState<number>(200);
  const [shopIcon, setShopIcon] = useState('👑');
  const [shopBadgeText, setShopBadgeText] = useState('');
  const [shopFrameClass, setShopFrameClass] = useState('ring-2 ring-amber-400 shadow-lg shadow-amber-500/40');
  const [shopFrameImageUrl, setShopFrameImageUrl] = useState('');

  // v6.1: Center 10 - 3-Tier University -> Major -> Method & Benchmark Builder State
  const [uniFormulas, setUniFormulas] = useState<UniversityFormulaProfile[]>(() =>
    StorageService.getUniversityFormulas()
  );
  const [uniDisclaimerNote, setUniDisclaimerNote] = useState<string>(() =>
    StorageService.getUniversityDisclaimerNote()
  );
  const [selectedAdminUniId, setSelectedAdminUniId] = useState<string>(() => {
    const first = StorageService.getUniversityFormulas()[0];
    return first?.id || '';
  });
  const [selectedAdminMajorId, setSelectedAdminMajorId] = useState<string>(() => {
    const first = StorageService.getUniversityFormulas()[0];
    return first?.majors?.[0]?.id || '';
  });

  // Tier 1: University Editor State
  const [editingFormula, setEditingFormula] = useState<UniversityFormulaProfile | null>(null);
  const [uniTag, setUniTag] = useState('');
  const [uniCode, setUniCode] = useState('');
  const [uniColor, setUniColor] = useState('from-blue-600 to-cyan-500');

  // Tier 2: Major Editor State
  const [editingMajor, setEditingMajor] = useState<UniversityMajor | null>(null);
  const [majorName, setMajorName] = useState('');
  const [majorCode, setMajorCode] = useState('');

  // Tier 3: Admission Method & Benchmark & Formula Editor State
  const [editingMethod, setEditingMethod] = useState<UniversityAdmissionMethod | null>(null);
  const [methodName, setMethodName] = useState('');
  const [uniScaleMax, setUniScaleMax] = useState<number>(100);
  const [uniBenchmark, setUniBenchmark] = useState<number>(82.5);
  const [uniExpression, setUniExpression] = useState(
    '(VACT / 12) * 0.7 + ((TOAN + MON2 + MON3) / 3 * 10) * 0.2 + (HOCBA / 3 * 10) * 0.1 + UUTIEN'
  );
  const [uniNote, setUniNote] = useState('');
  const [uniVariables, setUniVariables] = useState<FormulaVariable[]>([
    { key: 'VACT', label: 'Điểm ĐGNL V-ACT (Thang 1200)', max: 1200, defaultVal: 920 },
    { key: 'TOAN', label: 'Điểm Thi THPT Môn Toán (Thang 10)', max: 10, defaultVal: 8.8 },
    { key: 'MON2', label: 'Điểm Thi THPT Môn 2 (Lý/Hóa)', max: 10, defaultVal: 8.5 },
    { key: 'MON3', label: 'Điểm Thi THPT Môn 3 (Hóa/Anh)', max: 10, defaultVal: 8.2 },
    { key: 'HOCBA', label: 'Điểm TB Học Bạ 3 Môn (Thang 30)', max: 30, defaultVal: 26.5 },
    { key: 'UUTIEN', label: 'Điểm Ưu Tiên / Cộng Thưởng', max: 10, defaultVal: 0 },
  ]);
  const [testFormulaResult, setTestFormulaResult] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setPendingMaterials(StorageService.getPendingMaterials());
      setPendingStudyFiles(StorageService.getPendingStudyFiles());
      setMaterials(StorageService.getMaterials());
      setShopItems(StorageService.getShopItems());
      const latestUnis = StorageService.getUniversityFormulas();
      setUniFormulas(latestUnis);
      setUniDisclaimerNote(StorageService.getUniversityDisclaimerNote());
      if (latestUnis.length > 0 && !latestUnis.some((u) => u.id === selectedAdminUniId)) {
        setSelectedAdminUniId(latestUnis[0].id);
        setSelectedAdminMajorId(latestUnis[0].majors?.[0]?.id || '');
      }
      setUsers(StorageService.getAllUsers());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // --- Handlers for Dynamic Navbar Builder (v4.1) ---
  const handleSaveNavbarBrand = () => {
    StorageService.saveNavbarConfig(navbarConfig);
    onReloadAllData();
    showToast('🧭 Đã lưu cấu hình Thương hiệu & Thanh Điều Hướng!');
  };

  const handleSaveNavItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim()) return;

    const itemId = editingNavItem?.id || `nav-custom-${Date.now()}`;
    const targetTabVal =
      newNavType === 'tab'
        ? newNavTarget.trim() || 'dashboard'
        : newNavType === 'custom_view'
        ? itemId
        : undefined;

    const item: NavbarItem = {
      id: itemId,
      label: newNavLabel.trim(),
      icon: newNavIcon,
      type: newNavType,
      targetTab: targetTabVal,
      externalUrl: newNavType === 'external_link' ? newNavTarget.trim() : undefined,
      customContent:
        newNavType === 'custom_view'
          ? newNavCustomContent.trim() || `Chào mừng bạn đến với vùng học tập "${newNavLabel.trim()}"!`
          : undefined,
      activeColor: newNavActiveColor,
      isVisible: editingNavItem ? editingNavItem.isVisible : true,
      order: editingNavItem ? editingNavItem.order : navbarConfig.items.length,
    };

    if (editingNavItem) {
      StorageService.updateNavbarItem(item);
    } else {
      StorageService.addNavbarItem(item);
    }

    const updated = StorageService.getNavbarConfig();
    setNavbarConfig(updated);
    onReloadAllData();
    setEditingNavItem(null);
    setNewNavLabel('');
    setNewNavTarget('');
    setNewNavCustomContent('');
    showToast(editingNavItem ? 'Đã cập nhật mục điều hướng!' : '➕ Đã thêm mục mới lên Thanh Điều Hướng!');
  };

  const handleEditNavItemClick = (item: NavbarItem) => {
    setEditingNavItem(item);
    setNewNavLabel(item.label);
    setNewNavIcon(item.icon);
    setNewNavType(item.type);
    setNewNavTarget(item.type === 'external_link' ? item.externalUrl || '' : item.targetTab || '');
    setNewNavActiveColor(item.activeColor || 'bg-indigo-600');
    setNewNavCustomContent(item.customContent || '');
  };

  const handleToggleNavVisibility = (item: NavbarItem) => {
    const updatedItem = { ...item, isVisible: !item.isVisible };
    StorageService.updateNavbarItem(updatedItem);
    setNavbarConfig(StorageService.getNavbarConfig());
    onReloadAllData();
    showToast(updatedItem.isVisible ? `Đã hiện mục "${item.label}"` : `Đã tạm ẩn mục "${item.label}"`);
  };

  const handleMoveNavItem = (itemId: string, dir: 'left' | 'right') => {
    StorageService.reorderNavbarItem(itemId, dir);
    setNavbarConfig(StorageService.getNavbarConfig());
    onReloadAllData();
  };

  const handleDeleteNavItem = (item: NavbarItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.deleteNavbarItem(item.id);
    setNavbarConfig(StorageService.getNavbarConfig());
    onReloadAllData();
    showToast(`🗑️ Đã xóa mục "${item.label}" khỏi Navbar!`);
  };

  // --- Handlers for Eye Stats (v4.1) ---
  const handleResetViews = (val: number) => {
    StorageService.resetPageViews(val);
    const updated = StorageService.getStatsConfig();
    setStatsConfig(updated);
    setCustomPageViews(val.toString());
    onReloadAllData();
    showToast(`🔄 Đã Reset bộ đếm Lượt xem về ${val}!`);
  };

  const handleSaveCustomViews = () => {
    const parsed = parseInt(customPageViews, 10);
    if (isNaN(parsed) || parsed < 0) return;
    const updated: StatsConfig = { ...statsConfig, totalViews: parsed };
    StorageService.saveStatsConfig(updated);
    setStatsConfig(updated);
    onReloadAllData();
    showToast(`👁️ Đã cập nhật số lượt xem thành ${parsed.toLocaleString()}!`);
  };

  const handleToggleStatsVisibility = () => {
    const updated: StatsConfig = { ...statsConfig, isVisible: !statsConfig.isVisible };
    StorageService.saveStatsConfig(updated);
    setStatsConfig(updated);
    onReloadAllData();
    showToast(updated.isVisible ? 'Đã BẬT hiển thị khung Con mắt!' : 'Đã ẨN khung Con mắt!');
  };

  // Handlers for Center 1: Master Dashboard Sync Builder
  const handleSaveWidget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWidgetTitle.trim()) return;
    const widget: DashboardWidget = {
      id: editingWidget?.id || `widget-${Date.now()}`,
      title: newWidgetTitle.trim(),
      type: newWidgetType,
      gridSpan: newWidgetGridSpan,
      badge: newWidgetBadge.trim() || undefined,
      content: newWidgetContent.trim(),
      color: newWidgetColor,
      imageUrl: newWidgetImageUrl.trim() || undefined,
      order: editingWidget?.order ?? widgets.length + 1,
    };
    StorageService.saveWidget(widget);
    setWidgets(StorageService.getWidgets());
    onReloadAllData();
    setEditingWidget(null);
    setNewWidgetTitle('');
    setNewWidgetBadge('');
    setNewWidgetContent('');
    setNewWidgetImageUrl('');
    showToast('Đã lưu & đồng bộ khối Dashboard tức thì!');
  };

  const handleDeleteWidget = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.deleteWidget(id);
    setWidgets(StorageService.getWidgets());
    onReloadAllData();
    showToast('🗑️ Đã xóa khối khỏi Dashboard tức thì!');
  };

  const handleEditWidget = (w: DashboardWidget) => {
    setEditingWidget(w);
    setNewWidgetTitle(w.title);
    setNewWidgetType(w.type);
    setNewWidgetGridSpan(w.gridSpan === 'full' ? 'full' : 'half');
    setNewWidgetBadge(w.badge || '');
    setNewWidgetContent(w.content || '');
    setNewWidgetColor(w.color || 'glass-panel');
    setNewWidgetImageUrl(w.imageUrl || '');
  };

  // Handlers for Center 8: Co-Admin, Single Delete, Bulk Delete & Security
  const handleToggleCoAdmin = (userId: string, currentRole?: string) => {
    const newRole = currentRole === 'co_admin' ? 'user' : 'co_admin';
    StorageService.setUserRole(userId, newRole);
    setUsers(StorageService.getAllUsers());
    onReloadAllData();
    showToast(newRole === 'co_admin' ? '👑 Đã cấp quyền ĐỒNG ADMIN thành công!' : 'Đã thu hồi quyền Đồng Admin!');
  };

  const handleSingleDeleteUser = (u: User, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.deleteUser(u.id);
    setUsers(StorageService.getAllUsers());
    setSelectedUserIds((prev) => prev.filter((id) => id !== u.id));
    onReloadAllData();
    showToast(`🗑️ Đã xóa tài khoản ${u.displayName} vĩnh viễn!`);
  };

  const handleAdjustUserCoins = (u: User, delta: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const currentCoins = u.coins ?? 150;
    const nextCoins = Math.max(0, currentCoins + delta);
    StorageService.adminSetUserCoins(u.id, nextCoins);
    setUsers(StorageService.getAllUsers());
    onReloadAllData();
    showToast(`🪙 Đã cập nhật ví của ${u.displayName}: ${nextCoins.toLocaleString()} S-Coin!`);
  };

  const handleGrantGlobalServerCoins = (amount: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.adminGrantGlobalCoins(amount);
    setUsers(StorageService.getAllUsers());
    onReloadAllData();
    showToast(`🎁 Đã phát quà +${amount} S-Coin cho TOÀN BỘ SĨ TỬ trên Server!`);
  };

  const handleToggleSelectUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAllUsers = (filteredList: User[]) => {
    const deletableIds = filteredList.filter((u) => u.role !== 'admin').map((u) => u.id);
    const allSelected = deletableIds.length > 0 && deletableIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(deletableIds);
    }
  };

  const handleSelectZeroHoursUsers = () => {
    const zeroIds = users.filter((u) => u.role !== 'admin' && u.totalStudySeconds === 0).map((u) => u.id);
    setSelectedUserIds(zeroIds);
    showToast(`Đã chọn ${zeroIds.length} tài khoản có 0 giờ học!`);
  };

  const handleSelectInactiveUsers = () => {
    const inactiveIds = users
      .filter((u) => u.role !== 'admin' && (!u.isOnline || u.totalStudySeconds < 600))
      .map((u) => u.id);
    setSelectedUserIds(inactiveIds);
    showToast(`Đã chọn ${inactiveIds.length} tài khoản ảo / ít hoạt động!`);
  };

  const handleBulkDeleteUsers = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (selectedUserIds.length === 0) return;
    const count = selectedUserIds.length;
    StorageService.bulkDeleteUsers(selectedUserIds);
    setUsers(StorageService.getAllUsers());
    setSelectedUserIds([]);
    onReloadAllData();
    showToast(`🔥 Đã xóa đồng loạt ${count} User & cập nhật Bảng xếp hạng!`);
  };

  const handleQuickGrantCoAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const query = quickGrantTarget.trim().toLowerCase();
    if (!query) return;
    const matched = users.find((u) => u.id.toLowerCase() === query || u.email.toLowerCase() === query);
    if (!matched) {
      showToast('⚠️ Không tìm thấy tài khoản với #UID hoặc Email này trong hệ thống!');
      return;
    }
    StorageService.setUserRole(matched.id, 'co_admin');
    setUsers(StorageService.getAllUsers());
    setQuickGrantTarget('');
    onReloadAllData();
    showToast(`👑 Đã nâng cấp ${matched.displayName} thành ĐỒNG ADMIN!`);
  };

  const handleUpdateAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPin || newAdminPin.length < 4) {
      showToast('⚠️ Mật mã bảo mật mới phải có tối thiểu 4 ký tự!');
      return;
    }
    if (newAdminPin !== confirmAdminPin) {
      showToast('⚠️ Xác nhận mật mã không trùng khớp!');
      return;
    }
    StorageService.updateAdminPin(newAdminPin);
    setNewAdminPin('');
    setConfirmAdminPin('');
    showToast('🔑 Đã đổi mật mã bảo mật Admin thành công!');
  };

  // Handlers for Center 2: Landing Cover
  const handleSaveCenter2 = () => {
    StorageService.saveLandingCoverConfig(landingConfig);
    onSaveLandingCover(landingConfig);
    showToast('Đã lưu thiết kế Trang chủ Cover Screen thành công!');
  };

  // Handlers for Center 3: Micro-UI
  const handleSaveCenter3 = () => {
    StorageService.saveMicroUIConfig(microUIConfig);
    StorageService.saveFooterConfig(footerConfig);
    onSaveMicroUI(microUIConfig);
    onSaveFooter(footerConfig);
    showToast('Đã lưu tùy biến Micro-UI & Chân trang thành công!');
  };

  // Handlers for Center 4: Blink-Blink
  const handleSaveCenter4 = () => {
    StorageService.saveBlinkBlinkConfig(blinkConfig);
    StorageService.saveLoadingConfig(loadingConfig);
    onSaveBlinkBlink(blinkConfig);
    onSaveLoading(loadingConfig);
    showToast('Đã cập nhật hiệu ứng Blink-Blink & Loading GIF!');
  };

  // Handlers for Center 4: Leaderboard
  const handleResetEntireLeaderboard = () => {
    StorageService.resetAllStudyTime();
    setUsers(StorageService.getAllUsers());
    setShowResetConfirm(false);
    onReloadAllData();
    showToast('Đã RESET TOÀN BỘ BẢNG XẾP HẠNG về 00:00:00!');
  };

  const handleAdjustUserTime = (userId: string, addedMinutes: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      const newSec = Math.max(0, user.totalStudySeconds + addedMinutes * 60);
      StorageService.adjustUserStudyTime(userId, newSec);
      setUsers(StorageService.getAllUsers());
      onReloadAllData();
      showToast(`Đã điều chỉnh ${addedMinutes > 0 ? '+' : ''}${addedMinutes} phút cho ${user.displayName}!`);
    }
  };

  const handleDeleteUser = (userId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.deleteUser(userId);
    setUsers(StorageService.getAllUsers());
    onReloadAllData();
    showToast('🗑️ Đã xóa user khỏi hệ thống!');
  };

  // Handlers for Center 5: Stickers
  const handleCreateStickerPack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackName.trim()) return;
    const newPack: StickerPack = {
      id: `pack-${Date.now()}`,
      name: newPackName.trim(),
      icon: newPackIcon || '✨',
      isApproved: true,
      stickers: [],
    };
    StorageService.saveStickerPack(newPack);
    const updated = StorageService.getStickerPacks();
    setStickerPacks(updated);
    setSelectedPackForUpload(newPack.id);
    setNewPackName('');
    showToast(`Đã tạo bộ sticker "${newPack.name}"!`);
  };

  const handleAddSticker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStickerUrl.trim() || !selectedPackForUpload) return;
    const sticker: StickerItem = {
      id: `stk-${Date.now()}`,
      name: newStickerName.trim() || 'Sticker mới',
      url: newStickerUrl.trim(),
      isApproved: true,
    };
    StorageService.addStickerToPack(selectedPackForUpload, sticker);
    setStickerPacks(StorageService.getStickerPacks());
    setNewStickerUrl('');
    setNewStickerName('');
    showToast('Đã tải sticker lên bộ thành công!');
  };

  const handleTogglePackApproval = (packId: string) => {
    StorageService.toggleStickerPackApproval(packId);
    setStickerPacks(StorageService.getStickerPacks());
    showToast('Đã cập nhật trạng thái cấp phép bộ sticker!');
  };

  const handleToggleStickerApproval = (packId: string, stickerId: string) => {
    StorageService.toggleStickerApproval(packId, stickerId);
    setStickerPacks(StorageService.getStickerPacks());
  };

  const handleDeletePack = (packId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    StorageService.deleteStickerPack(packId);
    setStickerPacks(StorageService.getStickerPacks());
    showToast('🗑️ Đã xóa bộ sticker!');
  };

  const handleUploadLoadingGifFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const nextCfg = { ...loadingConfig, gifUrl: reader.result };
        setLoadingConfig(nextCfg);
        StorageService.saveLoadingConfig(nextCfg);
        onSaveLoading(nextCfg);
        showToast('🎬 Đã tải ảnh GIF màn hình chờ lên thành công!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerLiveLoadingTest = () => {
    StorageService.saveLoadingConfig(loadingConfig);
    onSaveLoading(loadingConfig);
    setShowFullLoadingPreview(true);
    setTimeout(() => {
      setShowFullLoadingPreview(false);
    }, Math.min(5000, Math.max(800, loadingConfig.durationMs)));
  };

  // Handlers for Center 7: Countdowns
  const handleSaveCenter7 = () => {
    StorageService.saveExamCountdownConfig(countdownConfig);
    onSaveExamCountdown(countdownConfig);
    showToast('Đã cập nhật ngày giờ đếm ngược kỳ thi!');
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 animate-in fade-in duration-200 overflow-hidden">
      {/* Studio Header Bar */}
      <header className="h-16 px-6 border-b border-white/10 bg-slate-900/90 backdrop-blur-xl flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 text-slate-950 flex items-center justify-center font-extrabold shadow-lg shadow-amber-500/25">
            👑
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
              <span>ADMIN STUDIO • VÙNG LÀM VIỆC TỐI CAO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PRO NO-CODE CMS
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Kiểm soát 100% giao diện từ ngoài vào trong, quản lý sticker, reset mùa giải và học liệu
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
        >
          <X className="w-4 h-4" />
          <span>Thoát Studio</span>
        </button>
      </header>

      {/* Main Studio Body: Side Navigation & Active Control Center */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Centers Menu */}
        <nav className="w-64 sm:w-72 bg-slate-900/60 border-r border-white/10 p-3 space-y-1.5 overflow-y-auto shrink-0">
          {[
            { id: 1, name: '🌟 Master Dashboard Sync', desc: 'Thêm/sửa/xóa khối & đồng bộ tức thì', icon: LayoutDashboard },
            { id: 2, name: 'Trung tâm 2: Landing Cover', desc: 'Slogan, Tiêu đề, Nút chính & phụ', icon: Layout },
            { id: 3, name: 'Trung tâm 3: Micro-UI & Thẻ', desc: 'Bo góc, viền, lề, màu sắc chi tiết', icon: Sliders },
            { id: 4, name: 'Trung tâm 4: Blink Blink & GIF', desc: 'Particle hoa/sao & màn chờ', icon: Sparkles },
            { id: 5, name: 'Trung tâm 5: Bảng Xếp Hạng', desc: 'Reset mùa giải & chỉnh giờ học', icon: Trophy },
            { id: 6, name: 'Trung tâm 6: Bộ Sticker', desc: 'Tải sticker & cấp phép bình luận', icon: Sticker },
            {
              id: 7,
              name: `📥 Học Liệu & Duyệt Bài (${pendingMaterials.length + pendingStudyFiles.length})`,
              desc: 'Duyệt file User (+50 Coin) & Cloud',
              icon: Database,
            },
            { id: 8, name: '🛡️ Quản lý User & Đổi PIN', desc: 'Cấp quyền Đồng Admin & Đổi mật mã', icon: Shield },
            { id: 9, name: '🛍️ Shop & Khung Avatar Xinh', desc: 'Thêm/sửa/xóa vật phẩm & Khung PNG/GIF', icon: ShoppingBag },
            { id: 10, name: '🧮 Công Thức Điểm & Tag ĐH', desc: 'Thiết lập công thức xét tuyển các trường', icon: Calculator },
          ].map((center) => {
            const Icon = center.icon;
            const isActive = activeCenter === center.id;
            return (
              <button
                key={center.id}
                onClick={() => setActiveCenter(center.id as any)}
                className={`w-full p-3 rounded-2xl text-left transition flex items-start gap-3 border ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/40 text-slate-300 hover:text-white hover:bg-white/5 border-white/5'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${isActive ? 'bg-white/20' : 'bg-slate-800'}`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate">{center.name}</span>
                  <span className={`text-[10px] block truncate ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {center.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Workspace Canvas (Right Content Area) */}
        <main className="flex-1 p-6 overflow-y-auto bg-slate-950/70">
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top">
              <CheckCircle2 className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* ================= TRUNG TÂM 1: MASTER DASHBOARD SYNC BUILDER ================= */}
          {activeCenter === 1 && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <span>🌟 Trung tâm 1: Master Dashboard Sync Builder</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Real-time Sync
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Thêm, sửa, xóa và cấu hình các ô khối widget trên Bàn học Dashboard trực quan không cần code
                  </p>
                </div>
              </div>

              {/* Form Thêm / Chỉnh Sửa Khối */}
              <form onSubmit={handleSaveWidget} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>{editingWidget ? 'Chỉnh sửa Khối Dashboard' : '➕ Thêm Ô / Khối Mới Cho Dashboard'}</span>
                  </h3>
                  {editingWidget && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingWidget(null);
                        setNewWidgetTitle('');
                        setNewWidgetBadge('');
                        setNewWidgetContent('');
                        setNewWidgetImageUrl('');
                      }}
                      className="text-xs text-slate-400 hover:text-white underline"
                    >
                      Hủy chế độ sửa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tiêu đề khối (*):</label>
                    <input
                      type="text"
                      value={newWidgetTitle}
                      onChange={(e) => setNewWidgetTitle(e.target.value)}
                      placeholder="VD: Lịch thi thử đợt 1..."
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phân loại khối:</label>
                    <select
                      value={newWidgetType}
                      onChange={(e) => setNewWidgetType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                    >
                      <option value="announcement">📢 Thông báo quan trọng</option>
                      <option value="teacher_shortcut">👨‍🏫 Lối tắt Thầy Cô</option>
                      <option value="banner">🖼️ Banner ảnh nổi bật</option>
                      <option value="hall_of_fame">🏆 Bảng vinh danh thủ khoa</option>
                      <option value="wish_note">🌈 Giấy Note Nguyện ước</option>
                      <option value="custom">✨ Tùy chỉnh tự do</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Độ rộng hàng (Grid Span):</label>
                    <select
                      value={newWidgetGridSpan}
                      onChange={(e) => setNewWidgetGridSpan(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                    >
                      <option value="half">Nửa hàng (1 cột)</option>
                      <option value="full">Toàn hàng ngang (2 cột rộng)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Huy hiệu góc (Badge):</label>
                    <input
                      type="text"
                      value={newWidgetBadge}
                      onChange={(e) => setNewWidgetBadge(e.target.value)}
                      placeholder="VD: HOT, Mới, Quan trọng..."
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Link ảnh minh họa (Image URL):</label>
                    <input
                      type="url"
                      value={newWidgetImageUrl}
                      onChange={(e) => setNewWidgetImageUrl(e.target.value)}
                      placeholder="https://... ảnh banner"
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Màu nền / Hiệu ứng Gradient:</label>
                    <select
                      value={newWidgetColor}
                      onChange={(e) => setNewWidgetColor(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                    >
                      <option value="glass-panel">Mặc định Glassmorphism</option>
                      <option value="bg-indigo-950/40 border-indigo-500/30">Xanh tím Indigo</option>
                      <option value="bg-purple-950/40 border-purple-500/30">Tím huyền bí Purple</option>
                      <option value="bg-amber-950/40 border-amber-500/30">Hổ phách Amber</option>
                      <option value="bg-emerald-950/40 border-emerald-500/30">Xanh lục Emerald</option>
                      <option value="bg-rose-950/40 border-rose-500/30">Hồng ngọc Rose</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">Nội dung chi tiết hiển thị:</label>
                  <textarea
                    rows={3}
                    value={newWidgetContent}
                    onChange={(e) => setNewWidgetContent(e.target.value)}
                    placeholder="Nhập nội dung thông báo, dặn dò hoặc ghi chú học tập..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingWidget ? 'Cập Nhật Khối' : 'Lưu & Đưa Lên Dashboard'}</span>
                  </button>
                </div>
              </form>

              {/* Danh Sách Các Khối Hiện Có */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Các Khối Đang Hoạt Động ({widgets.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Thay đổi sẽ áp dụng ngay tức thì cho mọi học viên</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {widgets.map((w, idx) => (
                    <div
                      key={w.id}
                      className={`p-4 rounded-2xl border flex flex-col justify-between transition ${
                        w.gridSpan === 'full' ? 'md:col-span-2' : 'col-span-1'
                      } ${w.color || 'glass-panel'} border-white/10`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-md bg-white/10 text-[10px] font-mono flex items-center justify-center text-slate-300">
                              #{idx + 1}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold uppercase">
                              {w.type}
                            </span>
                            {w.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/20 text-white font-semibold">
                                {w.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {w.gridSpan === 'full' ? 'Rộng 100%' : 'Rộng 50%'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditWidget(w)}
                              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                              title="Chỉnh sửa khối"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteWidget(w.id, e)}
                              className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                              title="Xóa khối"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-bold text-sm text-white">{w.title}</h4>
                        <p className="text-xs text-slate-300 mt-1 line-clamp-2">{w.content}</p>
                      </div>

                      {w.imageUrl && (
                        <div className="mt-3 h-24 rounded-xl overflow-hidden border border-white/10">
                          <img src={w.imageUrl} alt={w.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ================= 🧭 TRÌNH QUẢN LÝ THANH ĐIỀU HƯỚNG (NAVBAR CUSTOMIZER) ================= */}
              <div className="pt-6 border-t border-white/10 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Compass className="w-5 h-5 text-amber-400" />
                      <span>🧭 Trình Quản Lý Thanh Điều Hướng (Dynamic Navbar Builder)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Thêm tab vùng học tập mới, sửa tên, đổi icon, sắp xếp thứ tự trái/phải hoặc ẩn/xóa các mục trên Navbar
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveNavbarBrand}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Thương Hiệu Navbar</span>
                  </button>
                </div>

                {/* Brand & Slogan Config */}
                <div className="glass-panel p-4 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-300 mb-1">Tên Thương Hiệu (Góc trái):</label>
                    <input
                      type="text"
                      value={navbarConfig.brandName}
                      onChange={(e) => setNavbarConfig({ ...navbarConfig, brandName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Hậu tố Năm / Phiên bản:</label>
                    <input
                      type="text"
                      value={navbarConfig.brandYear}
                      onChange={(e) => setNavbarConfig({ ...navbarConfig, brandYear: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-indigo-300 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1">Slogan nhỏ dưới tên:</label>
                    <input
                      type="text"
                      value={navbarConfig.brandSlogan}
                      onChange={(e) => setNavbarConfig({ ...navbarConfig, brandSlogan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-200 border border-white/10"
                    />
                  </div>
                </div>

                {/* Add / Edit Navbar Item Form */}
                <form onSubmit={handleSaveNavItem} className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>
                        {editingNavItem
                          ? `✏️ Đang sửa mục: "${editingNavItem.label}"`
                          : '➕ Thêm Mục Điều Hướng Mới Lên Navbar'}
                      </span>
                    </span>
                    {editingNavItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNavItem(null);
                          setNewNavLabel('');
                          setNewNavTarget('');
                          setNewNavCustomContent('');
                        }}
                        className="text-slate-400 hover:text-white underline"
                      >
                        Hủy sửa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-slate-300 mb-1">Tên mục hiển thị (*):</label>
                      <input
                        type="text"
                        value={newNavLabel}
                        onChange={(e) => setNewNavLabel(e.target.value)}
                        placeholder="VD: Phòng Thi Thử, Kho Sách..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-semibold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Biểu tượng (Icon):</label>
                      <select
                        value={newNavIcon}
                        onChange={(e) => setNewNavIcon(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                      >
                        <option value="Compass">🧭 La bàn (Compass)</option>
                        <option value="GraduationCap">🎓 Mũ tốt nghiệp</option>
                        <option value="Target">🎯 Mục tiêu (Target)</option>
                        <option value="BookOpen">📖 Sách mở (BookOpen)</option>
                        <option value="MessageSquare">💬 Thảo luận (Message)</option>
                        <option value="Flame">🔥 Ngọn lửa (Flame)</option>
                        <option value="Trophy">🏆 Cúp vàng (Trophy)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Loại đích đến:</label>
                      <select
                        value={newNavType}
                        onChange={(e) => setNewNavType(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                      >
                        <option value="custom_view">✨ Tạo vùng trang mới tự do trên web</option>
                        <option value="tab">🗂️ Mở phân vùng hệ thống có sẵn</option>
                        <option value="external_link">🔗 Mở đường link bên ngoài</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1">Màu nút khi đang chọn (Active):</label>
                      <select
                        value={newNavActiveColor}
                        onChange={(e) => setNewNavActiveColor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                      >
                        <option value="bg-indigo-600">Xanh Indigo chuẩn</option>
                        <option value="bg-gradient-to-r from-purple-600 to-pink-600">Gradient Tím Hồng</option>
                        <option value="bg-gradient-to-r from-emerald-600 to-teal-600">Gradient Xanh Ngọc</option>
                        <option value="bg-gradient-to-r from-amber-500 to-orange-600">Gradient Cam Vàng</option>
                        <option value="bg-rose-600">Đỏ Hồng Rose</option>
                      </select>
                    </div>
                  </div>

                  {newNavType === 'external_link' && (
                    <div>
                      <label className="block text-slate-300 mb-1">Đường dẫn liên kết ngoài (URL):</label>
                      <input
                        type="url"
                        value={newNavTarget}
                        onChange={(e) => setNewNavTarget(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-mono"
                        required
                      />
                    </div>
                  )}

                  {newNavType === 'tab' && (
                    <div>
                      <label className="block text-slate-300 mb-1">Chọn phân vùng đích:</label>
                      <select
                        value={newNavTarget || 'dashboard'}
                        onChange={(e) => setNewNavTarget(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                      >
                        <option value="dashboard">Tổng quan (Dashboard)</option>
                        <option value="thptqg">Ôn thi THPTQG</option>
                        <option value="vact">ĐGNL V-ACT</option>
                        <option value="forum">Diễn đàn Hỏi bài</option>
                      </select>
                    </div>
                  )}

                  {newNavType === 'custom_view' && (
                    <div>
                      <label className="block text-slate-300 mb-1">
                        Nội dung hiển thị của vùng trang mới (Hỗ trợ văn bản, hướng dẫn, link tài liệu):
                      </label>
                      <textarea
                        rows={2}
                        value={newNavCustomContent}
                        onChange={(e) => setNewNavCustomContent(e.target.value)}
                        placeholder="Nhập nội dung giới thiệu, thông báo hoặc tài liệu cho vùng trang mới này..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{editingNavItem ? 'Lưu Thay Đổi Mục Này' : 'Thêm Lên Thanh Điều Hướng'}</span>
                    </button>
                  </div>
                </form>

                {/* List of Current Navbar Items with Reorder Left/Right, Hide/Show, Edit, Delete */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Danh Sách Các Mục Trên Thanh Điều Hướng ({navbarConfig.items.length})
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...navbarConfig.items]
                      .sort((a, b) => a.order - b.order)
                      .map((item, idx) => (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 text-xs transition ${
                            item.isVisible
                              ? 'bg-slate-900/70 border-white/10 text-white'
                              : 'bg-slate-950/40 border-dashed border-white/10 text-slate-500 opacity-60'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-white/10 font-mono text-[10px] flex items-center justify-center text-slate-300 shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold truncate">{item.label}</span>
                                {!item.isVisible && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                    Đang ẩn
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 block truncate">
                                Loại: {item.type === 'tab' ? `Tab (${item.targetTab})` : item.type === 'external_link' ? 'Link ngoài' : 'Trang tự do'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleMoveNavItem(item.id, 'left')}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300"
                              title="Dịch sang trái"
                            >
                              <ArrowLeft className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveNavItem(item.id, 'right')}
                              disabled={idx === navbarConfig.items.length - 1}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-slate-300"
                              title="Dịch sang phải"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleNavVisibility(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-indigo-300"
                              title={item.isVisible ? 'Tạm ẩn mục này' : 'Hiện lại mục này'}
                            >
                              {item.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditNavItemClick(item)}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-amber-300"
                              title="Sửa tên, màu sắc, đích đến"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNavItem(item, e)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                              title="Xóa mục điều hướng"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* ================= 👁️ QUẢN LÝ BỘ ĐẾM "CON MẮT" THỰC TẾ 100% ================= */}
              <div className="pt-6 border-t border-white/10">
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                    <div>
                      <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                        <Eye className="w-4 h-4 text-indigo-400" />
                        <span>👁️ Quản Lý Bộ Đếm "Con Mắt" (Lượt Xem & Sĩ Tử Online Thực Tế)</span>
                      </h3>
                      <p className="text-xs text-slate-400">
                        Đếm thực tế 100% theo phiên truy cập và số tab đang mở — Không dùng số ảo
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleStatsVisibility}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                        statsConfig.isVisible
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border border-white/10'
                      }`}
                    >
                      {statsConfig.isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{statsConfig.isVisible ? 'Đang hiện trên Cover' : 'Đang ẩn trên Cover'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end text-xs">
                    <div>
                      <label className="block text-slate-300 mb-1">Số lượt xem hiện tại (Tự chỉnh):</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={customPageViews}
                          onChange={(e) => setCustomPageViews(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCustomViews}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shrink-0"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleResetViews(1)}
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>🔄 Reset Lượt Xem về 1</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleResetViews(0)}
                      className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-500/30 font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>🔄 Reset Lượt Xem về 0</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 2: LANDING COVER BUILDER ================= */}
          {activeCenter === 2 && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">🎨 Trung tâm 2: Thiết kế Trang Chủ Bên Ngoài</h2>
                  <p className="text-xs text-slate-400">Tùy biến typography, tiêu đề, nút bấm chính và phong cách Landing Page</p>
                </div>
                <button
                  onClick={handleSaveCenter2}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Trang Chủ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Tiêu đề & Slogan</h3>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tiêu đề lớn (Title):</label>
                    <textarea
                      rows={2}
                      value={landingConfig.title}
                      onChange={(e) => setLandingConfig({ ...landingConfig, title: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Phụ đề (Subtitle):</label>
                    <input
                      type="text"
                      value={landingConfig.subtitle}
                      onChange={(e) => setLandingConfig({ ...landingConfig, subtitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mô tả truyền cảm hứng (Slogan):</label>
                    <textarea
                      rows={3}
                      value={landingConfig.slogan}
                      onChange={(e) => setLandingConfig({ ...landingConfig, slogan: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Cỡ chữ tiêu đề:</span>
                      <span className="font-mono text-indigo-400">{landingConfig.titleFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="84"
                      value={landingConfig.titleFontSize}
                      onChange={(e) => setLandingConfig({ ...landingConfig, titleFontSize: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Nút Bấm Chính</h3>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Nội dung nút chính:</label>
                    <input
                      type="text"
                      value={landingConfig.primaryBtnText}
                      onChange={(e) => setLandingConfig({ ...landingConfig, primaryBtnText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Hình dạng nút:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['square', 'rounded', 'pill'] as const).map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => setLandingConfig({ ...landingConfig, primaryBtnShape: shape })}
                          className={`py-2 text-xs font-semibold rounded-xl border transition ${
                            landingConfig.primaryBtnShape === shape
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-900/60 text-slate-300 border-white/10'
                          }`}
                        >
                          {shape === 'square' ? 'Vuông' : shape === 'rounded' ? 'Bo góc nhẹ' : 'Viên thuốc (Pill)'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Kích thước phóng to nút (Scale):</span>
                      <span className="font-mono text-indigo-400">{landingConfig.primaryBtnScale}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.4"
                      step="0.05"
                      value={landingConfig.primaryBtnScale}
                      onChange={(e) => setLandingConfig({ ...landingConfig, primaryBtnScale: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mã CSS Gradient / Màu nền nút:</label>
                    <input
                      type="text"
                      value={landingConfig.primaryBtnBg}
                      onChange={(e) => setLandingConfig({ ...landingConfig, primaryBtnBg: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="primary-glow"
                      checked={landingConfig.primaryBtnGlow}
                      onChange={(e) => setLandingConfig({ ...landingConfig, primaryBtnGlow: e.target.checked })}
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    <label htmlFor="primary-glow" className="text-xs text-slate-300 cursor-pointer">
                      Bật hiệu ứng hào quang phát sáng (Glow / Pulse Animation)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 3: MICRO-UI CUSTOMIZER ================= */}
          {activeCenter === 3 && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">🎛️ Trung tâm 3: Thiết kế Micro-UI & Thẻ Chi Tiết</h2>
                  <p className="text-xs text-slate-400">Chỉnh bo góc thẻ, độ dày viền, màu sắc tiêu đề và nội dung Footer độc lập</p>
                </div>
                <button
                  onClick={handleSaveCenter3}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Micro-UI</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Hình Dáng & Kích Thước Thẻ</h3>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Độ bo góc (Border Radius):</span>
                      <span className="font-mono text-indigo-400">{microUIConfig.borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={microUIConfig.borderRadius}
                      onChange={(e) => setMicroUIConfig({ ...microUIConfig, borderRadius: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Độ dày viền thẻ (Border Width):</span>
                      <span className="font-mono text-indigo-400">{microUIConfig.borderWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={microUIConfig.borderWidth}
                      onChange={(e) => setMicroUIConfig({ ...microUIConfig, borderWidth: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Độ làm mờ nền kính (Backdrop Blur):</span>
                      <span className="font-mono text-indigo-400">{microUIConfig.blurAmount}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={microUIConfig.blurAmount}
                      onChange={(e) => setMicroUIConfig({ ...microUIConfig, blurAmount: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Màu nền thẻ con:</label>
                    <input
                      type="text"
                      value={microUIConfig.cardBgColor}
                      onChange={(e) => setMicroUIConfig({ ...microUIConfig, cardBgColor: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-white/10">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Cấu Hình Chân Trang (Footer Độc Lập)</h3>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tên thương hiệu Footer:</label>
                    <input
                      type="text"
                      value={footerConfig.brandName}
                      onChange={(e) => setFooterConfig({ ...footerConfig, brandName: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Dòng giới thiệu ngắn (Tagline):</label>
                    <textarea
                      rows={2}
                      value={footerConfig.tagline}
                      onChange={(e) => setFooterConfig({ ...footerConfig, tagline: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Bản quyền (Copyright):</label>
                    <input
                      type="text"
                      value={footerConfig.copyrightText}
                      onChange={(e) => setFooterConfig({ ...footerConfig, copyrightText: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Email hỗ trợ:</label>
                      <input
                        type="text"
                        value={footerConfig.contactEmail}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contactEmail: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Hotline:</label>
                      <input
                        type="text"
                        value={footerConfig.contactHotline}
                        onChange={(e) => setFooterConfig({ ...footerConfig, contactHotline: e.target.value })}
                        className="w-full px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 4: BLINK-BLINK & LOADING GIF ================= */}
          {activeCenter === 4 && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">✨ Trung tâm 4: Particle Blink Blink & Loading GIF</h2>
                  <p className="text-xs text-slate-400">Hiệu ứng lấp lánh chạy nền toàn trang và tùy biến hoạt ảnh chờ chuyển tầng</p>
                </div>
                <button
                  onClick={handleSaveCenter4}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Hiệu Ứng</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">Blink-Blink Particle Engine</h3>
                    <button
                      type="button"
                      onClick={() => setBlinkConfig({ ...blinkConfig, enabled: !blinkConfig.enabled })}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        blinkConfig.enabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {blinkConfig.enabled ? 'Đang BẬT' : 'Đang TẮT'}
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Loại hạt hiệu ứng:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'sparkle', label: '✨ Lấp lánh' },
                        { type: 'star', label: '⭐ Ngôi sao' },
                        { type: 'sakura', label: '🌸 Hoa anh đào' },
                        { type: 'snow', label: '❄️ Bông tuyết' },
                        { type: 'lightbulb', label: '💡 Ý tưởng' },
                        { type: 'custom', label: '🖼️ Tự set ảnh' },
                      ].map((item) => (
                        <button
                          key={item.type}
                          type="button"
                          onClick={() => setBlinkConfig({ ...blinkConfig, type: item.type as any })}
                          className={`p-2.5 rounded-xl text-xs font-semibold border transition ${
                            blinkConfig.type === item.type
                              ? 'bg-indigo-600 text-white border-indigo-400'
                              : 'bg-slate-900/60 text-slate-300 border-white/10'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {blinkConfig.type === 'custom' && (
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Link ảnh PNG / GIF hạt tự set:</label>
                      <input
                        type="url"
                        value={blinkConfig.customIconUrl || ''}
                        onChange={(e) => setBlinkConfig({ ...blinkConfig, customIconUrl: e.target.value })}
                        placeholder="https://... ảnh trong suốt PNG"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Số lượng hạt trên màn hình:</span>
                      <span className="font-mono text-indigo-400">{blinkConfig.count}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      value={blinkConfig.count}
                      onChange={(e) => setBlinkConfig({ ...blinkConfig, count: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Kích thước hạt (px):</span>
                      <span className="font-mono text-indigo-400">{blinkConfig.size}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="36"
                      value={blinkConfig.size}
                      onChange={(e) => setBlinkConfig({ ...blinkConfig, size: Number(e.target.value) })}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Màu ánh hào quang phát sáng (Glow Color):</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={blinkConfig.glowColor.startsWith('#') ? blinkConfig.glowColor : '#a855f7'}
                        onChange={(e) => setBlinkConfig({ ...blinkConfig, glowColor: e.target.value })}
                        className="w-10 h-8 rounded-lg cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={blinkConfig.glowColor}
                        onChange={(e) => setBlinkConfig({ ...blinkConfig, glowColor: e.target.value })}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 glass-panel p-5 rounded-2xl border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>🎬 Studio Màn Hình Chờ Chuyển Tầng (Loading GIF)</span>
                    </h3>
                    <button
                      type="button"
                      onClick={handleTriggerLiveLoadingTest}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Chạy thử Loading ngay</span>
                    </button>
                  </div>

                  {/* Upload from Computer or Paste URL */}
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-300">
                      Tải file `.gif` / ảnh từ máy tính hoặc dán đường dẫn URL:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={loadingConfig.gifUrl}
                        onChange={(e) => setLoadingConfig({ ...loadingConfig, gifUrl: e.target.value })}
                        placeholder="https://... hoặc tải file bên cạnh"
                        className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      />
                      <label className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải GIF lên</span>
                        <input
                          type="file"
                          accept="image/gif,image/png,image/jpeg,image/webp"
                          onChange={handleUploadLoadingGifFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preset GIF Gallery */}
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1.5">
                      Kho GIF Động Mẫu (Bấm để chọn nhanh):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {LOADING_GIF_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setLoadingConfig({ ...loadingConfig, gifUrl: preset.url })}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left truncate border transition ${
                            loadingConfig.gifUrl === preset.url
                              ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                              : 'bg-slate-900/70 border-white/10 text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Duration Slider 500ms - 5000ms */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 mb-1">
                      <span>Thời gian hiển thị Loading (0.5s – 5.0s):</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {loadingConfig.durationMs}ms ({(loadingConfig.durationMs / 1000).toFixed(1)}s)
                      </span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="5000"
                      step="100"
                      value={loadingConfig.durationMs}
                      onChange={(e) => setLoadingConfig({ ...loadingConfig, durationMs: Number(e.target.value) })}
                      className="w-full accent-amber-500"
                    />
                  </div>

                  {/* Quote & Progress Bar Color */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-slate-300 mb-1">Câu trích dẫn truyền động lực:</label>
                      <textarea
                        rows={2}
                        value={loadingConfig.quoteText}
                        onChange={(e) => setLoadingConfig({ ...loadingConfig, quoteText: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Màu thanh tiến trình:</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={loadingConfig.progressColor || '#6366f1'}
                          onChange={(e) => setLoadingConfig({ ...loadingConfig, progressColor: e.target.value })}
                          className="w-10 h-9 rounded-lg cursor-pointer bg-transparent"
                        />
                        <input
                          type="text"
                          value={loadingConfig.progressColor || '#6366f1'}
                          onChange={(e) => setLoadingConfig({ ...loadingConfig, progressColor: e.target.value })}
                          className="w-full px-2 py-1.5 text-xs rounded-lg glass-input text-white border border-white/10 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Live Preview Box */}
                  <div className="p-4 rounded-2xl bg-slate-950/90 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-amber-300">👁️ Xem trước màn hình Loading (Live Preview)</span>
                      <span>{(loadingConfig.durationMs / 1000).toFixed(1)} giây</span>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-2.5 py-2">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-lg bg-slate-900">
                        <img
                          src={loadingConfig.gifUrl}
                          alt="Preview Loading GIF"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs italic text-slate-200 max-w-xs line-clamp-2">
                        {loadingConfig.quoteText}
                      </p>
                      <div className="w-48 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full w-3/4 rounded-full transition-all"
                          style={{ backgroundColor: loadingConfig.progressColor || '#6366f1' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 5: LEADERBOARD CONTROL ================= */}
          {activeCenter === 5 && (
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">🏆 Trung tâm 5: Quản lý & Reset Bảng Xếp Hạng</h2>
                  <p className="text-xs text-slate-400">Khởi động mùa giải mới, cộng/trừ giờ thưởng và kiểm duyệt tài khoản học viên</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>🔄 RESET TOÀN BỘ BẢNG XẾP HẠNG</span>
                </button>
              </div>

              {/* Reset Confirmation Modal */}
              {showResetConfirm && (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs space-y-3">
                  <p className="font-bold text-rose-300 text-sm">
                    ⚠️ XÁC NHẬN: Bạn có chắc chắn muốn đưa giờ học của TẤT CẢ học viên về 00:00:00?
                  </p>
                  <p className="text-slate-300">
                    Hành động này thường dùng khi bắt đầu tuần mới hoặc mùa luyện thi mới. Sau khi reset, học viên sẽ đua top lại từ đầu.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleResetEntireLeaderboard}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
                    >
                      Xác nhận Reset ngay
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:text-white"
                    >
                      Hủy thao tác
                    </button>
                  </div>
                </div>
              )}

              {/* Users List Table with Time Modification */}
              <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                  Danh sách học viên ({users.length})
                </h3>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {users.map((u, idx) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <img src={u.avatar} alt={u.displayName} className="w-8 h-8 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <span className="font-bold text-white block truncate">{u.displayName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{u.id} • {u.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-emerald-400 text-sm">
                          {formatTime(u.totalStudySeconds)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAdjustUserTime(u.id, 30)}
                            className="px-2 py-1 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 text-[10px] font-bold"
                            title="Cộng 30 phút thưởng"
                          >
                            +30p
                          </button>
                          <button
                            onClick={() => handleAdjustUserTime(u.id, -30)}
                            className="px-2 py-1 rounded bg-amber-600/30 text-amber-300 hover:bg-amber-600/50 text-[10px] font-bold"
                            title="Trừ 30 phút"
                          >
                            -30p
                          </button>
                          <button
                            onClick={() => handleAdjustUserTime(u.id, -Math.floor(u.totalStudySeconds / 60))}
                            className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px]"
                            title="Reset về 0h"
                          >
                            Về 0
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteUser(u.id, e)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                            title="Xóa học viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 6: STICKER PACKS & LICENSING ================= */}
          {activeCenter === 6 && (
            <div className="max-w-4xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">🎭 Trung tâm 6: Quản lý Bộ Sticker & Cấp Phép</h2>
                  <p className="text-xs text-slate-400">Tạo bộ sticker, tải ảnh lên và bật/tắt quyền sử dụng trong khung bình luận</p>
                </div>
              </div>

              {/* Add New Pack & Upload Sticker forms */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Create Pack Form */}
                <form onSubmit={handleCreateStickerPack} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">+ Tạo Bộ Sticker Mới</h3>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tên bộ Sticker:</label>
                    <input
                      type="text"
                      value={newPackName}
                      onChange={(e) => setNewPackName(e.target.value)}
                      placeholder="VD: Mèo Học Bá, Sĩ Tử 2k8 Quyết Thắng..."
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Biểu tượng Icon (Emoji):</label>
                    <input
                      type="text"
                      value={newPackIcon}
                      onChange={(e) => setNewPackIcon(e.target.value)}
                      placeholder="🐱, 🎯, 🔥..."
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow"
                  >
                    Tạo bộ Sticker
                  </button>
                </form>

                {/* Add Sticker to Pack Form */}
                <form onSubmit={handleAddSticker} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">+ Thêm Sticker Vào Bộ</h3>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Chọn bộ tiếp nhận:</label>
                    <select
                      value={selectedPackForUpload}
                      onChange={(e) => setSelectedPackForUpload(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 bg-slate-900"
                    >
                      {stickerPacks.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tên Sticker:</label>
                    <input
                      type="text"
                      value={newStickerName}
                      onChange={(e) => setNewStickerName(e.target.value)}
                      placeholder="VD: Cố lên, 10 điểm..."
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Link ảnh Sticker (PNG/GIF trong suốt):</label>
                    <input
                      type="url"
                      value={newStickerUrl}
                      onChange={(e) => setNewStickerUrl(e.target.value)}
                      placeholder="https://... ảnh sticker"
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow"
                  >
                    Thêm Sticker
                  </button>
                </form>
              </div>

              {/* Existing Sticker Packs List & License Toggles */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400">
                  Danh Sách Bộ Sticker & Quản Lý Cấp Phép
                </h3>

                {stickerPacks.map((pack) => (
                  <div key={pack.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{pack.icon}</span>
                        <h4 className="font-bold text-sm text-white">{pack.name}</h4>
                        <span className="text-xs text-slate-400">({pack.stickers.length} stickers)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Approval Toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePackApproval(pack.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                            pack.isApproved
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {pack.isApproved ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span>{pack.isApproved ? 'Đã Cấp Phép Cho User' : 'Bị Khóa (Admin Only)'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeletePack(pack.id, e)}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Stickers Grid inside pack */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {pack.stickers.map((stk) => (
                        <div
                          key={stk.id}
                          className="p-2 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center gap-1 text-center relative group"
                        >
                          <img src={stk.url} alt={stk.name} className="w-10 h-10 object-contain" />
                          <span className="text-[10px] text-slate-300 truncate w-full">{stk.name}</span>
                          <button
                            type="button"
                            onClick={() => handleToggleStickerApproval(pack.id, stk.id)}
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              stk.isApproved ? 'bg-emerald-500/30 text-emerald-300' : 'bg-rose-500/30 text-rose-300'
                            }`}
                          >
                            {stk.isApproved ? 'Bật' : 'Tắt'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 7: HỌC LIỆU, HÀNG ĐỢI DUYỆT BÀI & FIREBASE ================= */}
          {activeCenter === 7 && (
            <div className="max-w-5xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white">
                    📂 Trung tâm 7: Hàng Đợi Duyệt Tài Liệu User, Học Liệu & Firebase Cloud
                  </h2>
                  <p className="text-xs text-slate-400">
                    Duyệt tài liệu đóng góp của học viên (+50 S-Coin tự động), cài đặt ngày giờ đếm ngược và Firebase
                  </p>
                </div>
                <button
                  onClick={handleSaveCenter7}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Đếm Ngược</span>
                </button>
              </div>

              {/* v6.1: PENDING USER MATERIAL CONTRIBUTION QUEUE */}
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-amber-950/15 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Inbox className="w-5 h-5 text-amber-400" />
                    <h3 className="font-extrabold text-sm sm:text-base text-white">
                      📥 Hàng Đợi Duyệt Tài Liệu Của User ({pendingMaterials.length + pendingStudyFiles.length} chờ duyệt)
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Duyệt bài tự động thưởng +50 S-Coin cho người đóng góp
                  </span>
                </div>

                {pendingMaterials.length === 0 && pendingStudyFiles.length === 0 ? (
                  <div className="p-6 rounded-xl bg-slate-900/60 border border-white/5 text-center text-xs text-slate-400">
                    🎉 Hiện không có tài liệu nào đang chờ duyệt. Khi học viên bấm <strong>"📤 Đóng góp tài liệu (+50 Coin)"</strong>, tài liệu sẽ xuất hiện tại đây để Admin kiểm duyệt!
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {pendingMaterials.map((mat) => (
                      <div
                        key={mat.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              CHỜ DUYỆT • {mat.type.toUpperCase()}
                            </span>
                            <span className="font-bold text-white text-sm truncate">{mat.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span>Môn/Phân vùng: <strong className="text-indigo-300">{mat.subjectId}</strong></span>
                            <span>•</span>
                            <span>Người gửi: <strong className="text-emerald-300">{mat.submittedBy || mat.author}</strong></span>
                            {mat.submittedById && (
                              <span className="font-mono text-[10px] text-slate-500">({mat.submittedById})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={mat.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Xem thử</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const res = StorageService.approveMaterial(mat.id);
                              setPendingMaterials(StorageService.getPendingMaterials());
                              setMaterials(StorageService.getMaterials());
                              setUsers(StorageService.getAllUsers());
                              onReloadAllData();
                              showToast(
                                `✅ Đã duyệt học liệu "${mat.title}" & thưởng +50 S-Coin cho ${res.rewardedUser || 'học viên'}!`
                              );
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black flex items-center gap-1 shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Duyệt bài (+50 Coin)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              StorageService.deleteMaterial(mat.id);
                              setPendingMaterials(StorageService.getPendingMaterials());
                              onReloadAllData();
                              showToast('🗑️ Đã từ chối & xóa tài liệu chờ duyệt!');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {pendingStudyFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[10px]">
                              FILE CÂY THƯ MỤC • {file.type.toUpperCase()}
                            </span>
                            <span className="font-bold text-white text-sm truncate">{file.title}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span>Môn: <strong className="text-indigo-300">{file.subjectId}</strong></span>
                            <span>•</span>
                            <span>Người gửi: <strong className="text-emerald-300">{file.submittedBy || 'Học viên'}</strong></span>
                            {file.submittedById && (
                              <span className="font-mono text-[10px] text-slate-500">({file.submittedById})</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Xem thử</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const res = StorageService.approveStudyFile(file.id);
                              setPendingStudyFiles(StorageService.getPendingStudyFiles());
                              setUsers(StorageService.getAllUsers());
                              onReloadAllData();
                              showToast(
                                `✅ Đã duyệt file "${file.title}" & thưởng +50 S-Coin cho ${res.rewardedUser || 'học viên'}!`
                              );
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black flex items-center gap-1 shadow"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>✅ Duyệt bài (+50 Coin)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              StorageService.deleteStudyFile(file.id);
                              setPendingStudyFiles(StorageService.getPendingStudyFiles());
                              onReloadAllData();
                              showToast('🗑️ Đã từ chối & xóa file chờ duyệt!');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-bold flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Từ chối</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Countdown Dates Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* THPTQG Countdown */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">Kỳ Thi THPT Quốc Gia</h3>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tiêu đề hiển thị:</label>
                    <input
                      type="text"
                      value={countdownConfig.thptqgTitle}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, thptqgTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Ngày giờ thi (Định dạng YYYY-MM-DDTHH:mm):</label>
                    <input
                      type="datetime-local"
                      value={countdownConfig.thptqgDate}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, thptqgDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mô tả kỳ thi:</label>
                    <textarea
                      rows={2}
                      value={countdownConfig.thptqgDesc}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, thptqgDesc: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                </div>

                {/* V-ACT Countdown */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 text-violet-400">
                    <Layers className="w-5 h-5" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">ĐGNL ĐHQG TP.HCM (V-ACT)</h3>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tiêu đề hiển thị:</label>
                    <input
                      type="text"
                      value={countdownConfig.vactTitle}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, vactTitle: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Ngày giờ thi (Định dạng YYYY-MM-DDTHH:mm):</label>
                    <input
                      type="datetime-local"
                      value={countdownConfig.vactDate}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, vactDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Mô tả kỳ thi:</label>
                    <textarea
                      rows={2}
                      value={countdownConfig.vactDesc}
                      onChange={(e) => setCountdownConfig({ ...countdownConfig, vactDesc: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>
                </div>
              </div>

              {/* Firebase and Materials Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Firebase JSON configuration */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> Cấu hình Firebase Cloud
                  </h3>
                  <p className="text-xs text-slate-400">
                    Dán đoạn JSON config từ Firebase Console để kích hoạt Firestore & Auth live (Hỗ trợ chế độ kép Dual-Storage).
                  </p>
                  <textarea
                    rows={6}
                    value={firebaseJson}
                    onChange={(e) => setFirebaseJson(e.target.value)}
                    placeholder={`{\n  "apiKey": "...",\n  "projectId": "..."\n}`}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl glass-input text-white border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!firebaseJson.trim()) {
                        showToast('Đang ở chế độ Dual-Storage LocalStorage!');
                        return;
                      }
                      try {
                        const parsed = JSON.parse(firebaseJson);
                        StorageService.setFirebaseConfig({ ...parsed, isConfigured: true });
                        showToast('Đã lưu cấu hình Firebase Cloud!');
                      } catch {
                        showToast('⚠️ Định dạng JSON không hợp lệ!');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow"
                  >
                    Lưu & Kích hoạt Firebase
                  </button>
                </div>

                {/* Materials count summary */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> Tổng quan Học Liệu ({materials.length})
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs">
                    {materials.map((m) => (
                      <div key={m.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <span className="font-semibold text-white block truncate">{m.title}</span>
                          <span className="text-[10px] text-slate-400">{m.subjectId} • {m.type.toUpperCase()} • {m.views} lượt xem</span>
                        </div>
                        <button
                          onClick={() => {
                            StorageService.deleteMaterial(m.id);
                            setMaterials(StorageService.getMaterials());
                            onReloadAllData();
                            showToast('Đã xóa học liệu!');
                          }}
                          className="p-1 rounded text-rose-400 hover:bg-rose-500/10 shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 8: QUẢN LÝ USER, ĐỒNG ADMIN & ĐỔI PIN ================= */}
          {activeCenter === 8 && (
            <div className="max-w-5xl space-y-6 pb-20 relative">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    <span>Trung tâm 8: Quản lý User, Ví S-Coin, Đồng Admin & Đổi PIN</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Cộng/trừ S-Coin, phát quà Coin toàn server, xóa tài khoản ảo, phân quyền Đồng Admin và đổi mã PIN
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleGrantGlobalServerCoins(200, e)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition"
                >
                  <Gift className="w-4 h-4" />
                  <span>🎁 Phát Quà +200 S-Coin Toàn Server</span>
                </button>
              </div>

              {/* Floating Bulk Delete Action Bar when selectedUserIds.length > 0 */}
              {selectedUserIds.length > 0 && (
                <div className="sticky top-2 z-30 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/95 via-red-900/95 to-amber-950/95 border border-rose-400/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-xl bg-rose-500 text-white font-black text-xs">
                      Đã chọn {selectedUserIds.length} User
                    </span>
                    <span className="text-xs text-rose-100 font-medium">
                      Sẵn sàng dọn dẹp khỏi hệ thống và Bảng xếp hạng thời gian thực.
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedUserIds([])}
                      className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 text-slate-200 text-xs font-semibold transition"
                    >
                      Bỏ chọn
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkDeleteUsers}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>🔥 Xóa đồng loạt ({selectedUserIds.length}) User đã chọn</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Grid 2 Columns: User Management & PIN Change */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: User List, Bulk Delete & Grant Co-Admin */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Quick Grant Bar */}
                  <form onSubmit={handleQuickGrantCoAdmin} className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Cấp Quyền Đồng Admin Nhanh Bằng #UID hoặc Email</span>
                    </h3>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={quickGrantTarget}
                        onChange={(e) => setQuickGrantTarget(e.target.value)}
                        placeholder="Nhập #UID (VD: user-1, user-2) hoặc email (VD: van@studyhub.edu.vn)..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10"
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-extrabold text-xs shadow flex items-center gap-1.5 shrink-0"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Cấp Đồng Admin</span>
                      </button>
                    </div>
                  </form>

                  {/* Users Table with Bulk Selection & Quick Filters */}
                  {(() => {
                    const filteredUsers = users.filter((u) => {
                      if (!userSearchQuery.trim()) return true;
                      const q = userSearchQuery.toLowerCase();
                      return (
                        u.displayName.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        u.id.toLowerCase().includes(q)
                      );
                    });
                    const deletableFiltered = filteredUsers.filter((u) => u.role !== 'admin');
                    const allSelected =
                      deletableFiltered.length > 0 &&
                      deletableFiltered.every((u) => selectedUserIds.includes(u.id));

                    return (
                      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
                          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                            Danh Sách Tài Khoản ({users.length})
                          </h3>

                          {/* Search Bar */}
                          <div className="relative w-full sm:w-60">
                            <input
                              type="text"
                              value={userSearchQuery}
                              onChange={(e) => setUserSearchQuery(e.target.value)}
                              placeholder="Lọc tên, email, #UID..."
                              className="w-full pl-8 pr-3 py-1 text-xs rounded-lg glass-input text-white border border-white/10"
                            />
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        </div>

                        {/* Bulk Select Header & Quick Filter Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200 hover:text-white select-none">
                            <input
                              type="checkbox"
                              checked={allSelected}
                              onChange={() => handleToggleSelectAllUsers(filteredUsers)}
                              className="w-4 h-4 rounded accent-rose-500 cursor-pointer"
                            />
                            <span>☑️ Chọn tất cả / Bỏ chọn tất cả</span>
                          </label>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={handleSelectZeroHoursUsers}
                              className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition"
                            >
                              Chọn tất cả user có 0 giờ học
                            </button>
                            <button
                              type="button"
                              onClick={handleSelectInactiveUsers}
                              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition"
                            >
                              Chọn các tài khoản ảo/không hoạt động
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                          {filteredUsers.map((u) => {
                            const isCoAdmin = u.role === 'co_admin';
                            const isPrimaryAdmin = u.role === 'admin';
                            const isChecked = selectedUserIds.includes(u.id);

                            return (
                              <div
                                key={u.id}
                                className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                                  isChecked
                                    ? 'bg-rose-950/30 border-rose-500/40'
                                    : 'bg-slate-900/60 border-white/5'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Row Checkbox for Bulk Delete */}
                                  {!isPrimaryAdmin ? (
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleSelectUser(u.id)}
                                      className="w-4 h-4 rounded accent-rose-500 cursor-pointer shrink-0"
                                      title={`Chọn ${u.displayName}`}
                                    />
                                  ) : (
                                    <div className="w-4 h-4 shrink-0" />
                                  )}

                                  <img
                                    src={u.avatar}
                                    alt={u.displayName}
                                    className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                                  />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-bold text-white truncate">{u.displayName}</span>
                                      {isPrimaryAdmin ? (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                          👑 Chủ Sở Hữu
                                        </span>
                                      ) : isCoAdmin ? (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                          ⭐ Đồng Admin
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                                          Học viên
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono block truncate">
                                      #{u.id} • {u.email}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                  <span className="font-mono text-emerald-400 text-xs font-bold">
                                    {formatTime(u.totalStudySeconds)}
                                  </span>

                                  {/* S-Coin Balance & Quick Adjust */}
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30">
                                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                                    <span className="font-mono font-black text-amber-300 text-xs">
                                      {(u.coins ?? 150).toLocaleString()}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={(e) => handleAdjustUserCoins(u, 100, e)}
                                      className="ml-1 px-1.5 py-0.5 rounded bg-emerald-500/30 hover:bg-emerald-500 text-emerald-200 hover:text-slate-950 font-black text-[10px]"
                                      title="Cộng +100 S-Coin"
                                    >
                                      +100
                                    </button>
                                    <button
                                      type="button"
                                      onClick={(e) => handleAdjustUserCoins(u, -50, e)}
                                      className="px-1.5 py-0.5 rounded bg-rose-500/30 hover:bg-rose-500 text-rose-200 hover:text-white font-black text-[10px]"
                                      title="Trừ -50 S-Coin"
                                    >
                                      -50
                                    </button>
                                  </div>

                                  {!isPrimaryAdmin && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleCoAdmin(u.id, u.role)}
                                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                          isCoAdmin
                                            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                                            : 'bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/40'
                                        }`}
                                      >
                                        {isCoAdmin ? (
                                          <>
                                            <UserX className="w-3.5 h-3.5" />
                                            <span>Thu hồi</span>
                                          </>
                                        ) : (
                                          <>
                                            <UserCheck className="w-3.5 h-3.5" />
                                            <span>👑 Cấp Đồng Admin</span>
                                          </>
                                        )}
                                      </button>

                                      <button
                                        type="button"
                                        onClick={(e) => handleSingleDeleteUser(u, e)}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition flex items-center gap-1"
                                        title="Xóa vĩnh viễn tài khoản này"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>🗑️ Xóa User</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Column 3: Change Admin PIN (Mật Mã Bảo Mật) */}
                <div className="space-y-4">
                  <form onSubmit={handleUpdateAdminPin} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-amber-400">
                      <Key className="w-5 h-5" />
                      <h3 className="font-bold text-xs uppercase tracking-wider">Đổi Mật Mã Admin</h3>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      Mật mã PIN này dùng để mở khóa quyền Chủ Sở Hữu và mở bảng Admin Studio. Hãy ghi nhớ cẩn thận!
                    </p>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Mật mã mới (*):</label>
                      <input
                        type="password"
                        value={newAdminPin}
                        onChange={(e) => setNewAdminPin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                        required
                        minLength={4}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Xác nhận mật mã mới (*):</label>
                      <input
                        type="password"
                        value={confirmAdminPin}
                        onChange={(e) => setConfirmAdminPin(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs rounded-xl glass-input text-white border border-white/10 font-mono"
                        required
                        minLength={4}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Cập Nhật Mật Mã Bảo Mật</span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 9: QUẢN LÝ CỬA HÀNG ĐỔI THƯỞNG (SHOP & KHUNG XINH) ================= */}
          {activeCenter === 9 && (
            <div className="max-w-5xl space-y-6 pb-20">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    <span>🛍️ Trung tâm 9: Quản Lý Cửa Hàng Đổi Thưởng (Shop & Khung Avatar Xinh)</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Thêm mới, chỉnh sửa, xóa vật phẩm S-Coin Shop; hỗ trợ tải ảnh PNG/GIF nền trong suốt làm Khung Avatar
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Thêm / Sửa Vật Phẩm Shop */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!shopName.trim()) return;
                    const newItem: ShopItem = {
                      id: editingShopItem ? editingShopItem.id : `shop-custom-${Date.now()}`,
                      name: shopName.trim(),
                      description: shopDesc.trim() || 'Vật phẩm đặc biệt trong Cửa hàng S-Coin.',
                      type: shopType,
                      priceCoins: Math.max(0, Number(shopPrice) || 0),
                      icon: shopIcon.trim() || '✨',
                      badgeText: shopType === 'title' ? (shopBadgeText.trim() || shopName.trim()) : undefined,
                      frameClass: shopType === 'frame' ? shopFrameClass.trim() : undefined,
                      frameImageUrl:
                        shopType === 'frame' && shopFrameImageUrl.trim()
                          ? shopFrameImageUrl.trim()
                          : undefined,
                    };
                    StorageService.saveShopItem(newItem);
                    setShopItems(StorageService.getShopItems());
                    setEditingShopItem(null);
                    setShopName('');
                    setShopDesc('');
                    setShopFrameImageUrl('');
                    setShopBadgeText('');
                    onReloadAllData();
                    showToast(
                      editingShopItem
                        ? `✨ Đã cập nhật vật phẩm "${newItem.name}"!`
                        : `🛍️ Đã thêm "${newItem.name}" vào Cửa hàng Đổi thưởng!`
                    );
                  }}
                  className="lg:col-span-1 glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-3.5 text-xs"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="font-extrabold text-amber-400 uppercase tracking-wider">
                      {editingShopItem ? '✏️ Chỉnh sửa Vật Phẩm' : '➕ Tạo Vật Phẩm / Khung Mới'}
                    </h3>
                    {editingShopItem && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingShopItem(null);
                          setShopName('');
                          setShopDesc('');
                          setShopFrameImageUrl('');
                        }}
                        className="text-slate-400 hover:text-white underline"
                      >
                        Hủy sửa
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Loại vật phẩm:</label>
                    <select
                      value={shopType}
                      onChange={(e) => setShopType(e.target.value as ShopItem['type'])}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 bg-slate-900 font-bold"
                    >
                      <option value="frame">🖼️ Khung Avatar (Viền CSS hoặc Ảnh PNG/GIF)</option>
                      <option value="title">👑 Danh Hiệu Vinh Danh (Title Badge)</option>
                      <option value="ticket">🎟️ Vé Mở Khóa Tài Liệu VIP</option>
                      <option value="booster">⚡ Thẻ Nhân Đôi S-Coin (24 Giờ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tên vật phẩm (*):</label>
                    <input
                      type="text"
                      required
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      placeholder="VD: Khung Rồng Vàng Bách Khoa, Danh Hiệu Học Bá..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Giá S-Coin:</label>
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={shopPrice}
                        onChange={(e) => setShopPrice(Math.max(0, Number(e.target.value)))}
                        className="w-full px-3 py-2 rounded-xl glass-input text-amber-300 border border-white/10 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Icon / Emoji:</label>
                      <input
                        type="text"
                        value={shopIcon}
                        onChange={(e) => setShopIcon(e.target.value)}
                        placeholder="👑, 🌸, 🔥..."
                        className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                      />
                    </div>
                  </div>

                  {shopType === 'title' && (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Chữ hiển thị trên Huy hiệu Danh hiệu:
                      </label>
                      <input
                        type="text"
                        value={shopBadgeText}
                        onChange={(e) => setShopBadgeText(e.target.value)}
                        placeholder="VD: 👑 Chiến Thần V-ACT 1000+"
                        className="w-full px-3 py-2 rounded-xl glass-input text-amber-300 border border-white/10 font-bold"
                      />
                    </div>
                  )}

                  {shopType === 'frame' && (
                    <div className="space-y-3 p-3 rounded-xl bg-slate-900/80 border border-white/10">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Kiểu viền phát sáng CSS:
                        </label>
                        <select
                          value={shopFrameClass}
                          onChange={(e) => setShopFrameClass(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg glass-input text-white border border-white/10 bg-slate-900"
                        >
                          <option value="ring-2 ring-amber-400 shadow-lg shadow-amber-500/40">✨ Viền Vàng Hoàng Kim</option>
                          <option value="ring-2 ring-fuchsia-400 shadow-lg shadow-fuchsia-500/40">🔮 Viền Tím Tinh Vân</option>
                          <option value="ring-2 ring-cyan-400 shadow-lg shadow-cyan-500/40">💎 Viền Xanh Băng Giá</option>
                          <option value="ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/40">🍀 Viền Lục Bảo Thủ Khoa</option>
                          <option value="ring-2 ring-rose-400 shadow-lg shadow-rose-500/40">🌸 Viền Hồng Anh Đào</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Ảnh Khung PNG/GIF trong suốt (Tùy chọn):
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={shopFrameImageUrl}
                            onChange={(e) => setShopFrameImageUrl(e.target.value)}
                            placeholder="Dán URL PNG/GIF hoặc tải file..."
                            className="flex-1 px-2.5 py-1.5 rounded-lg glass-input text-white border border-white/10"
                          />
                          <label className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer flex items-center gap-1 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Tải khung</span>
                            <input
                              type="file"
                              accept="image/png,image/gif,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = () => {
                                  if (typeof reader.result === 'string') {
                                    setShopFrameImageUrl(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Live Avatar Frame Preview */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                            alt="Avatar Preview"
                            className={`w-12 h-12 rounded-full object-cover ${shopFrameClass}`}
                          />
                          {shopFrameImageUrl && (
                            <img
                              src={shopFrameImageUrl}
                              alt="Frame Overlay"
                              className="absolute inset-0 w-14 h-14 object-contain pointer-events-none scale-110"
                            />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <strong className="text-white block">Xem trước Khung Avatar</strong>
                          Hiển thị trực tiếp trên Navbar, Hồ sơ và Bảng xếp hạng.
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mô tả vật phẩm:</label>
                    <textarea
                      rows={2}
                      value={shopDesc}
                      onChange={(e) => setShopDesc(e.target.value)}
                      placeholder="Mô tả quyền lợi hoặc hiệu ứng của vật phẩm..."
                      className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow-lg"
                  >
                    {editingShopItem ? '💾 Lưu Cập Nhật Vật Phẩm' : '➕ Thêm Vào Cửa Hàng S-Coin'}
                  </button>
                </form>

                {/* Danh sách Vật phẩm trong Shop */}
                <div className="lg:col-span-2 space-y-3">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                    Danh Sách Vật Phẩm Đang Bán Trong Shop ({shopItems.length})
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {shopItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-amber-500/40 flex flex-col justify-between gap-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            {item.type === 'frame' ? (
                              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                <img
                                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                                  alt={item.name}
                                  className={`w-10 h-10 rounded-full object-cover ${item.frameClass || ''}`}
                                />
                                {item.frameImageUrl && (
                                  <img
                                    src={item.frameImageUrl}
                                    alt="Overlay"
                                    className="absolute inset-0 w-12 h-12 object-contain pointer-events-none scale-110"
                                  />
                                )}
                              </div>
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                                {item.icon}
                              </div>
                            )}
                            <div>
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                {item.type.toUpperCase()} • {item.priceCoins} Coin
                              </span>
                              <h4 className="font-bold text-sm text-white mt-1">{item.name}</h4>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingShopItem(item);
                                setShopName(item.name);
                                setShopDesc(item.description);
                                setShopType(item.type);
                                setShopPrice(item.priceCoins);
                                setShopIcon(item.icon);
                                setShopBadgeText(item.badgeText || '');
                                setShopFrameClass(item.frameClass || 'ring-2 ring-amber-400 shadow-lg shadow-amber-500/40');
                                setShopFrameImageUrl(item.frameImageUrl || '');
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                              title="Sửa vật phẩm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                StorageService.deleteShopItem(item.id);
                                setShopItems(StorageService.getShopItems());
                                onReloadAllData();
                                showToast(`🗑️ Đã xóa vật phẩm "${item.name}" khỏi Cửa hàng!`);
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                              title="Xóa vật phẩm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TRUNG TÂM 10: QUẢN LÝ PHÂN TẦNG TRƯỜNG ➔ NGÀNH ➔ PHƯƠNG THỨC & ĐIỂM CHUẨN ================= */}
          {activeCenter === 10 && (() => {
            const activeAdminUni =
              uniFormulas.find((u) => u.id === selectedAdminUniId) || uniFormulas[0];
            const adminMajors = activeAdminUni?.majors || [];
            const activeAdminMajor =
              adminMajors.find((m) => m.id === selectedAdminMajorId) || adminMajors[0];
            const adminMethods = activeAdminMajor?.methods || [];

            const persistUniList = (nextList: UniversityFormulaProfile[], toastMsg?: string) => {
              StorageService.saveAllUniversityFormulas(nextList);
              setUniFormulas(nextList);
              onReloadAllData();
              if (toastMsg) showToast(toastMsg);
            };

            return (
              <div className="max-w-6xl space-y-6 pb-24">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-cyan-400" />
                      <span>
                        🧮 Trung tâm 10: Quản Lý Máy Tính Điểm Phân Tầng (Trường ➔ Ngành ➔ Phương Thức & Điểm Chuẩn)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Chỉnh sửa toàn diện dữ liệu 3 tầng: Tag Trường Đại Học, Tag Ngành Đào Tạo, Tag Phương Thức Xét Tuyển, Điểm Chuẩn 2026, Công Thức và Dòng Note Lưu Ý
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const reset = StorageService.resetUniversityFormulasToDefault();
                      setUniFormulas(reset);
                      setUniDisclaimerNote(StorageService.getUniversityDisclaimerNote());
                      setSelectedAdminUniId(reset[0]?.id || '');
                      setSelectedAdminMajorId(reset[0]?.majors?.[0]?.id || '');
                      onReloadAllData();
                      showToast('🔄 Đã khôi phục bộ dữ liệu Trường - Ngành - Điểm chuẩn 2026 mặc định!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Khôi phục dữ liệu mẫu 2026</span>
                  </button>
                </div>

                {/* BLOCK A: GLOBAL DISCLAIMER NOTE EDITOR */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                      <span>📌 Dòng Note Lưu Ý Hiển Thị Trên Khung Máy Tính Điểm (Chỉnh sửa trực tiếp):</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUniDisclaimerNote(DEFAULT_UNIVERSITY_DISCLAIMER_NOTE);
                          StorageService.saveUniversityDisclaimerNote(
                            DEFAULT_UNIVERSITY_DISCLAIMER_NOTE
                          );
                          showToast('🔄 Đã đặt lại dòng Note mặc định năm 2026!');
                        }}
                        className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] font-semibold"
                      >
                        Đặt lại câu gốc
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          StorageService.saveUniversityDisclaimerNote(uniDisclaimerNote);
                          showToast('💾 Đã lưu dòng Note hiển thị trên Máy tính điểm!');
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Dòng Note</span>
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={2}
                    value={uniDisclaimerNote}
                    onChange={(e) => setUniDisclaimerNote(e.target.value)}
                    placeholder="Nên xem đề án đào tạo ngành của trường đại học mình chọn để tìm hiểu sâu thêm. Số liệu từ năm 2026, có thể biến động trong năm sau."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/30 text-amber-200 font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* BLOCK B: TIER 1 (UNIVERSITIES) & TIER 2 (MAJORS) SIDE-BY-SIDE */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TIER 1: QUẢN LÝ TAG TRƯỜNG ĐẠI HỌC */}
                  <div className="glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                        🎓 Tầng 1: Quản Lý Tag Trường Đại Học ({uniFormulas.length} trường)
                      </h3>
                      {editingFormula && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingFormula(null);
                            setUniTag('');
                            setUniCode('');
                          }}
                          className="text-[11px] text-slate-400 hover:text-white underline"
                        >
                          Hủy sửa trường
                        </button>
                      )}
                    </div>

                    {/* Add / Edit University Form */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!uniTag.trim()) return;
                        if (editingFormula) {
                          const next = uniFormulas.map((u) =>
                            u.id === editingFormula.id
                              ? {
                                  ...u,
                                  universityTag: uniTag.trim(),
                                  universityCode: uniCode.trim() || 'UNI',
                                  color: uniColor,
                                }
                              : u
                          );
                          persistUniList(next, `🎓 Đã cập nhật Tag trường "${uniTag.trim()}"!`);
                          setEditingFormula(null);
                        } else {
                          const newUniId = `uni-${Date.now()}`;
                          const newMajId = `maj-${Date.now()}`;
                          const newMetId = `met-${Date.now()}`;
                          const newProfile: UniversityFormulaProfile = {
                            id: newUniId,
                            universityTag: uniTag.trim(),
                            universityCode: uniCode.trim() || 'UNI',
                            color: uniColor,
                            scaleMax: 30,
                            benchmarkScore: 26.5,
                            formulaExpression: 'TOAN + MON2 + MON3 + UUTIEN',
                            note: 'Công thức xét tuyển chuẩn do Admin thiết lập.',
                            variables: [
                              { key: 'TOAN', label: 'Điểm Môn Toán', max: 10, defaultVal: 8.8 },
                              { key: 'MON2', label: 'Điểm Môn 2', max: 10, defaultVal: 8.5 },
                              { key: 'MON3', label: 'Điểm Môn 3', max: 10, defaultVal: 8.5 },
                              { key: 'UUTIEN', label: 'Điểm Ưu tiên', max: 2.75, defaultVal: 0 },
                            ],
                            majors: [
                              {
                                id: newMajId,
                                name: 'Ngành Đào Tạo Tiêu Biểu',
                                code: '7480101',
                                methods: [
                                  {
                                    id: newMetId,
                                    name: 'Phương thức Điểm thi THPTQG 2026',
                                    benchmarkScore: 26.5,
                                    scaleMax: 30,
                                    formulaExpression: 'TOAN + MON2 + MON3 + UUTIEN',
                                    variables: [
                                      { key: 'TOAN', label: 'Điểm Môn Toán', max: 10, defaultVal: 8.8 },
                                      { key: 'MON2', label: 'Điểm Môn 2', max: 10, defaultVal: 8.5 },
                                      { key: 'MON3', label: 'Điểm Môn 3', max: 10, defaultVal: 8.5 },
                                      { key: 'UUTIEN', label: 'Điểm Ưu tiên', max: 2.75, defaultVal: 0 },
                                    ],
                                    note: 'Xét tổng điểm 3 môn THPTQG + Điểm ưu tiên.',
                                  },
                                ],
                              },
                            ],
                          };
                          const next = [...uniFormulas, newProfile];
                          persistUniList(next, `➕ Đã thêm Trường "${newProfile.universityTag}"!`);
                          setSelectedAdminUniId(newUniId);
                          setSelectedAdminMajorId(newMajId);
                        }
                        setUniTag('');
                        setUniCode('');
                      }}
                      className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                    >
                      <input
                        type="text"
                        required
                        value={uniTag}
                        onChange={(e) => setUniTag(e.target.value)}
                        placeholder="Tên Tag Trường ĐH (VD: ĐH Bách Khoa TP.HCM)"
                        className="sm:col-span-5 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-bold"
                      />
                      <input
                        type="text"
                        value={uniCode}
                        onChange={(e) => setUniCode(e.target.value)}
                        placeholder="Mã (QSB)"
                        className="sm:col-span-2 px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-cyan-300 font-mono font-bold"
                      />
                      <select
                        value={uniColor}
                        onChange={(e) => setUniColor(e.target.value)}
                        className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-white"
                      >
                        <option value="from-blue-600 to-cyan-500">Xanh Bách Khoa</option>
                        <option value="from-rose-600 to-amber-500">Đỏ Ngoại Thương</option>
                        <option value="from-indigo-600 to-purple-600">Tím Kinh Tế</option>
                        <option value="from-emerald-600 to-teal-500">Xanh ĐHQG</option>
                      </select>
                      <button
                        type="submit"
                        className="sm:col-span-2 py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black"
                      >
                        {editingFormula ? 'Lưu' : '+ Thêm'}
                      </button>
                    </form>

                    {/* Universities List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {uniFormulas.map((u) => {
                        const isSelected = activeAdminUni?.id === u.id;
                        return (
                          <div
                            key={u.id}
                            onClick={() => {
                              setSelectedAdminUniId(u.id);
                              setSelectedAdminMajorId(u.majors?.[0]?.id || '');
                              setEditingMethod(null);
                            }}
                            className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                              isSelected
                                ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-md'
                                : 'bg-slate-900/70 hover:bg-slate-900 border-white/10 text-slate-300'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-[10px]">
                                  {u.universityCode}
                                </span>
                                <span className="font-bold text-xs truncate">{u.universityTag}</span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                Đang có {u.majors?.length || 0} ngành đào tạo — Bấm để quản lý ngành
                              </span>
                            </div>
                            <div
                              className="flex items-center gap-1 shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFormula(u);
                                  setUniTag(u.universityTag);
                                  setUniCode(u.universityCode);
                                  setUniColor(u.color);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                title="Sửa tên/mã trường"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const next = uniFormulas.filter((item) => item.id !== u.id);
                                  persistUniList(next, `🗑️ Đã xóa Trường "${u.universityTag}"!`);
                                  if (selectedAdminUniId === u.id) {
                                    setSelectedAdminUniId(next[0]?.id || '');
                                    setSelectedAdminMajorId(next[0]?.majors?.[0]?.id || '');
                                  }
                                }}
                                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                                title="Xóa trường này"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* TIER 2: QUẢN LÝ TAG NGÀNH ĐÀO TẠO CỦA TRƯỜNG ĐANG CHỌN */}
                  <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-indigo-300 truncate">
                        📚 Tầng 2: Ngành Đào Tạo —{' '}
                        <span className="text-white">
                          {activeAdminUni ? activeAdminUni.universityTag : 'Chưa chọn trường'}
                        </span>
                      </h3>
                      {editingMajor && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMajor(null);
                            setMajorName('');
                            setMajorCode('');
                          }}
                          className="text-[11px] text-slate-400 hover:text-white underline shrink-0"
                        >
                          Hủy sửa ngành
                        </button>
                      )}
                    </div>

                    {activeAdminUni ? (
                      <>
                        {/* Add / Edit Major Form */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            if (!majorName.trim()) return;
                            const currentMajors = activeAdminUni.majors || [];
                            let updatedMajors: UniversityMajor[];

                            if (editingMajor) {
                              updatedMajors = currentMajors.map((m) =>
                                m.id === editingMajor.id
                                  ? { ...m, name: majorName.trim(), code: majorCode.trim() }
                                  : m
                              );
                            } else {
                              const newMaj: UniversityMajor = {
                                id: `maj-${Date.now()}`,
                                name: majorName.trim(),
                                code: majorCode.trim() || '700',
                                methods: [
                                  {
                                    id: `met-${Date.now()}`,
                                    name: 'Phương thức Xét tuyển Tổng hợp / Điểm thi 2026',
                                    benchmarkScore: activeAdminUni.benchmarkScore || 27.0,
                                    scaleMax: activeAdminUni.scaleMax || 30,
                                    formulaExpression:
                                      activeAdminUni.formulaExpression || 'TOAN + MON2 + MON3 + UUTIEN',
                                    variables:
                                      activeAdminUni.variables?.length > 0
                                        ? activeAdminUni.variables
                                        : [
                                            { key: 'TOAN', label: 'Điểm Môn Toán', max: 10, defaultVal: 8.8 },
                                            { key: 'MON2', label: 'Điểm Môn 2', max: 10, defaultVal: 8.5 },
                                            { key: 'MON3', label: 'Điểm Môn 3', max: 10, defaultVal: 8.5 },
                                            { key: 'UUTIEN', label: 'Điểm Ưu tiên', max: 2.75, defaultVal: 0 },
                                          ],
                                    note: activeAdminUni.note || 'Xét tuyển theo đề án 2026 của trường.',
                                  },
                                ],
                              };
                              updatedMajors = [...currentMajors, newMaj];
                              setSelectedAdminMajorId(newMaj.id);
                            }

                            const nextUnis = uniFormulas.map((u) =>
                              u.id === activeAdminUni.id ? { ...u, majors: updatedMajors } : u
                            );
                            persistUniList(
                              nextUnis,
                              editingMajor
                                ? `📚 Đã cập nhật ngành "${majorName.trim()}"!`
                                : `➕ Đã thêm ngành "${majorName.trim()}" vào ${activeAdminUni.universityCode}!`
                            );
                            setEditingMajor(null);
                            setMajorName('');
                            setMajorCode('');
                          }}
                          className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs"
                        >
                          <input
                            type="text"
                            required
                            value={majorName}
                            onChange={(e) => setMajorName(e.target.value)}
                            placeholder="Tên Tag Ngành (VD: Khoa học Máy tính, Logistics...)"
                            className="sm:col-span-7 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white font-bold"
                          />
                          <input
                            type="text"
                            value={majorCode}
                            onChange={(e) => setMajorCode(e.target.value)}
                            placeholder="Mã ngành (106)"
                            className="sm:col-span-3 px-2.5 py-2 rounded-xl bg-slate-950 border border-white/10 text-indigo-300 font-mono font-bold"
                          />
                          <button
                            type="submit"
                            className="sm:col-span-2 py-2 px-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black"
                          >
                            {editingMajor ? 'Lưu' : '+ Thêm'}
                          </button>
                        </form>

                        {/* Majors List */}
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {adminMajors.map((maj) => {
                            const isSelected = activeAdminMajor?.id === maj.id;
                            return (
                              <div
                                key={maj.id}
                                onClick={() => {
                                  setSelectedAdminMajorId(maj.id);
                                  setEditingMethod(null);
                                }}
                                className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between gap-2 ${
                                  isSelected
                                    ? 'bg-indigo-500/20 border-indigo-400 text-white shadow-md'
                                    : 'bg-slate-900/70 hover:bg-slate-900 border-white/10 text-slate-300'
                                }`}
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    {maj.code && (
                                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                                        {maj.code}
                                      </span>
                                    )}
                                    <span className="font-bold text-xs truncate">{maj.name}</span>
                                  </div>
                                  <span className="text-[11px] text-slate-400 block mt-0.5">
                                    Có {maj.methods.length} phương thức xét tuyển — Bấm để sửa Điểm chuẩn
                                  </span>
                                </div>
                                <div
                                  className="flex items-center gap-1 shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingMajor(maj);
                                      setMajorName(maj.name);
                                      setMajorCode(maj.code || '');
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                                    title="Sửa ngành"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedMajors = adminMajors.filter((m) => m.id !== maj.id);
                                      const nextUnis = uniFormulas.map((u) =>
                                        u.id === activeAdminUni.id ? { ...u, majors: updatedMajors } : u
                                      );
                                      persistUniList(nextUnis, `🗑️ Đã xóa ngành "${maj.name}"!`);
                                      if (selectedAdminMajorId === maj.id) {
                                        setSelectedAdminMajorId(updatedMajors[0]?.id || '');
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                                    title="Xóa ngành này"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-400 py-8 text-center">
                        Hãy chọn hoặc tạo một Trường Đại Học ở Cột 1 trước.
                      </div>
                    )}
                  </div>
                </div>

                {/* BLOCK C: TIER 3 (ADMISSION METHODS, BENCHMARK SCORE & FORMULA BUILDER FOR SELECTED MAJOR) */}
                {activeAdminUni && activeAdminMajor && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left (5 cols): List of Admission Methods & Instant Benchmark Score Editor */}
                    <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-4">
                      <div className="border-b border-white/10 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Tầng 3: Phương thức & Điểm chuẩn
                        </span>
                        <h3 className="text-sm font-black text-white mt-1.5">
                          🎯 Ngành: <span className="text-amber-300">{activeAdminMajor.name}</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Trường: {activeAdminUni.universityTag} • Sửa nhanh Điểm chuẩn ngay bên dưới
                        </p>
                      </div>

                      <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                        {adminMethods.map((met) => (
                          <div
                            key={met.id}
                            className={`p-4 rounded-2xl border space-y-2.5 transition ${
                              editingMethod?.id === met.id
                                ? 'bg-amber-500/15 border-amber-400'
                                : 'bg-slate-900/80 border-white/10 hover:border-amber-500/40'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                                  Thang {met.scaleMax} • Chuẩn: {met.benchmarkScore}
                                </span>
                                <h4 className="font-bold text-xs text-white mt-1">{met.name}</h4>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingMethod(met);
                                    setMethodName(met.name);
                                    setUniScaleMax(met.scaleMax);
                                    setUniBenchmark(met.benchmarkScore);
                                    setUniExpression(met.formulaExpression);
                                    setUniNote(met.note || '');
                                    setUniVariables(met.variables);
                                    setTestFormulaResult(null);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px] flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3" />
                                  <span>Sửa CT</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const nextMethods = adminMethods.filter((item) => item.id !== met.id);
                                    const nextMajors = adminMajors.map((m) =>
                                      m.id === activeAdminMajor.id ? { ...m, methods: nextMethods } : m
                                    );
                                    const nextUnis = uniFormulas.map((u) =>
                                      u.id === activeAdminUni.id ? { ...u, majors: nextMajors } : u
                                    );
                                    persistUniList(
                                      nextUnis,
                                      `🗑️ Đã xóa phương thức "${met.name}"!`
                                    );
                                  }}
                                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20"
                                  title="Xóa phương thức xét tuyển này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Quick Inline Benchmark Score Input */}
                            <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-white/10 text-xs">
                              <span className="text-slate-300 font-semibold">
                                🎯 Điểm chuẩn (Thang {met.scaleMax}):
                              </span>
                              <input
                                type="number"
                                step="0.05"
                                value={met.benchmarkScore}
                                onChange={(e) => {
                                  const newScore = parseFloat(e.target.value) || 0;
                                  const nextMethods = adminMethods.map((item) =>
                                    item.id === met.id ? { ...item, benchmarkScore: newScore } : item
                                  );
                                  const nextMajors = adminMajors.map((m) =>
                                    m.id === activeAdminMajor.id ? { ...m, methods: nextMethods } : m
                                  );
                                  const nextUnis = uniFormulas.map((u) =>
                                    u.id === activeAdminUni.id ? { ...u, majors: nextMajors } : u
                                  );
                                  persistUniList(nextUnis);
                                }}
                                className="w-24 px-2.5 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300 font-mono font-black text-right"
                              />
                            </div>

                            <div className="p-2 rounded-lg bg-slate-950/70 border border-white/5 font-mono text-[10px] text-cyan-300 break-all">
                              CT: {met.formulaExpression}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right (7 cols): Add / Edit Admission Method, Variables & Mathematical Formula */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!methodName.trim() || !uniExpression.trim()) return;
                        const methodObj: UniversityAdmissionMethod = {
                          id: editingMethod ? editingMethod.id : `met-${Date.now()}`,
                          name: methodName.trim(),
                          benchmarkScore: Number(uniBenchmark) || 0,
                          scaleMax: Number(uniScaleMax) || 100,
                          formulaExpression: uniExpression.trim(),
                          variables: uniVariables,
                          note: uniNote.trim() || 'Cấu hình từ Admin Studio.',
                        };

                        const nextMethods = editingMethod
                          ? adminMethods.map((item) =>
                              item.id === editingMethod.id ? methodObj : item
                            )
                          : [...adminMethods, methodObj];

                        const nextMajors = adminMajors.map((m) =>
                          m.id === activeAdminMajor.id ? { ...m, methods: nextMethods } : m
                        );

                        const nextUnis = uniFormulas.map((u) =>
                          u.id === activeAdminUni.id ? { ...u, majors: nextMajors } : u
                        );

                        persistUniList(
                          nextUnis,
                          editingMethod
                            ? `💾 Đã lưu cập nhật phương thức "${methodObj.name}" (Điểm chuẩn: ${methodObj.benchmarkScore})!`
                            : `➕ Đã thêm phương thức "${methodObj.name}" cho ngành ${activeAdminMajor.name}!`
                        );
                        setEditingMethod(null);
                        setMethodName('');
                        setUniNote('');
                      }}
                      className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-cyan-500/30 space-y-4 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <h3 className="font-extrabold text-cyan-400 uppercase tracking-wider">
                          {editingMethod
                            ? `✏️ Đang sửa Phương thức: ${editingMethod.name}`
                            : `➕ Thêm Phương Thức Xét Tuyển & Điểm Chuẩn Mới cho ngành "${activeAdminMajor.name}"`}
                        </h3>
                        {editingMethod && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingMethod(null);
                              setMethodName('');
                              setUniNote('');
                            }}
                            className="text-slate-400 hover:text-white underline"
                          >
                            Hủy sửa
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6">
                          <label className="block text-slate-300 font-semibold mb-1">
                            Tên Tag Phương Thức Xét Tuyển (*):
                          </label>
                          <input
                            type="text"
                            required
                            value={methodName}
                            onChange={(e) => setMethodName(e.target.value)}
                            placeholder="VD: Phương thức Điểm thi ĐGNL V-ACT / Xét tuyển Tổng hợp..."
                            className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-bold"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-slate-300 font-semibold mb-1">
                            Điểm Chuẩn Ngành (*):
                          </label>
                          <input
                            type="number"
                            step="0.05"
                            required
                            value={uniBenchmark}
                            onChange={(e) => setUniBenchmark(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-xl glass-input text-amber-300 border border-amber-500/40 font-mono font-black"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-slate-300 font-semibold mb-1">
                            Thang Điểm Tối Đa:
                          </label>
                          <input
                            type="number"
                            value={uniScaleMax}
                            onChange={(e) => setUniScaleMax(Number(e.target.value))}
                            placeholder="30, 100, 1200"
                            className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-mono"
                          />
                        </div>
                      </div>

                      {/* Quick Formula Templates */}
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1.5">
                          ⚡ Chọn nhanh Mẫu Công Thức & Biến Số Chuẩn:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setMethodName(
                                methodName || 'Xét tuyển Tổng hợp (ĐGNL 70% + THPT 20% + Học bạ 10%)'
                              );
                              setUniScaleMax(100);
                              setUniBenchmark(82.5);
                              setUniExpression(
                                '(VACT / 12) * 0.7 + ((TOAN + MON2 + MON3) / 3 * 10) * 0.2 + (HOCBA / 3 * 10) * 0.1 + UUTIEN'
                              );
                              setUniVariables([
                                { key: 'VACT', label: 'Điểm ĐGNL V-ACT (Thang 1200)', max: 1200, defaultVal: 920 },
                                { key: 'TOAN', label: 'Điểm Thi THPT Môn Toán', max: 10, defaultVal: 8.8 },
                                { key: 'MON2', label: 'Điểm Thi THPT Môn 2', max: 10, defaultVal: 8.5 },
                                { key: 'MON3', label: 'Điểm Thi THPT Môn 3', max: 10, defaultVal: 8.2 },
                                { key: 'HOCBA', label: 'Điểm TB Học Bạ 3 Môn (Thang 30)', max: 30, defaultVal: 26.5 },
                                { key: 'UUTIEN', label: 'Điểm Ưu Tiên (Thang 100)', max: 10, defaultVal: 0 },
                              ]);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 font-bold text-[11px]"
                          >
                            Mẫu Thang 100 (Bách Khoa)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMethodName(methodName || 'Xét điểm thi Tốt nghiệp THPTQG 2026');
                              setUniScaleMax(30);
                              setUniBenchmark(27.5);
                              setUniExpression('TOAN + MON2 + MON3 + UUTIEN');
                              setUniVariables([
                                { key: 'TOAN', label: 'Điểm Môn Toán', max: 10, defaultVal: 9.0 },
                                { key: 'MON2', label: 'Điểm Môn 2 (Lý/Văn)', max: 10, defaultVal: 8.8 },
                                { key: 'MON3', label: 'Điểm Môn 3 (Hóa/Anh)', max: 10, defaultVal: 8.8 },
                                { key: 'UUTIEN', label: 'Điểm Ưu tiên KV/ĐT', max: 2.75, defaultVal: 0 },
                              ]);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-[11px]"
                          >
                            Mẫu Thang 30 (3 môn THPTQG)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMethodName(
                                methodName || 'Xét điểm THPTQG (Nhân hệ số 2 môn chính quy thang 30)'
                              );
                              setUniScaleMax(30);
                              setUniBenchmark(28.0);
                              setUniExpression('(TOAN * 2 + MON2 + ANH) * 0.75 + UUTIEN');
                              setUniVariables([
                                { key: 'TOAN', label: 'Điểm Môn Nhân Hệ Số 2 (Toán)', max: 10, defaultVal: 9.0 },
                                { key: 'MON2', label: 'Điểm Môn 2', max: 10, defaultVal: 8.5 },
                                { key: 'ANH', label: 'Điểm Môn Tiếng Anh', max: 10, defaultVal: 9.0 },
                                { key: 'UUTIEN', label: 'Điểm Ưu tiên', max: 2.75, defaultVal: 0 },
                              ]);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-[11px]"
                          >
                            Mẫu Thang 30 (Nhân đôi môn chính)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setMethodName(
                                methodName || 'Xét điểm thi ĐGNL ĐHQG TP.HCM (V-ACT Thang 1200)'
                              );
                              setUniScaleMax(1200);
                              setUniBenchmark(950);
                              setUniExpression('VACT + CONG + UUTIEN');
                              setUniVariables([
                                { key: 'VACT', label: 'Điểm thi ĐGNL V-ACT (Thang 1200)', max: 1200, defaultVal: 940 },
                                { key: 'CONG', label: 'Điểm cộng HSG / IELTS', max: 100, defaultVal: 15 },
                                { key: 'UUTIEN', label: 'Điểm ưu tiên (Thang 1200)', max: 90, defaultVal: 0 },
                              ]);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-[11px]"
                          >
                            Mẫu Thang 1200 (ĐGNL V-ACT)
                          </button>
                        </div>
                      </div>

                      {/* Variables List */}
                      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">
                            Các biến số đầu vào (Học sinh sẽ nhập điểm các ô này):
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setUniVariables((prev) => [
                                ...prev,
                                {
                                  key: `MON_${prev.length + 1}`,
                                  label: `Điểm thành phần ${prev.length + 1}`,
                                  max: 10,
                                  defaultVal: 8,
                                },
                              ])
                            }
                            className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[11px]"
                          >
                            + Thêm biến số
                          </button>
                        </div>

                        <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                          {uniVariables.map((v, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                              <input
                                type="text"
                                value={v.key}
                                onChange={(e) => {
                                  const next = [...uniVariables];
                                  next[idx] = {
                                    ...v,
                                    key: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
                                  };
                                  setUniVariables(next);
                                }}
                                placeholder="Mã biến"
                                className="col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-cyan-300 font-mono font-bold text-xs"
                              />
                              <input
                                type="text"
                                value={v.label}
                                onChange={(e) => {
                                  const next = [...uniVariables];
                                  next[idx] = { ...v, label: e.target.value };
                                  setUniVariables(next);
                                }}
                                placeholder="Tên hiển thị"
                                className="col-span-5 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs"
                              />
                              <input
                                type="number"
                                value={v.max}
                                onChange={(e) => {
                                  const next = [...uniVariables];
                                  next[idx] = { ...v, max: Number(e.target.value) };
                                  setUniVariables(next);
                                }}
                                placeholder="Thang"
                                className="col-span-3 px-2 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-slate-300 font-mono text-xs"
                                title="Điểm tối đa của biến này"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setUniVariables((prev) => prev.filter((_, i) => i !== idx))
                                }
                                className="col-span-1 p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-lg flex justify-center"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Formula Expression */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-slate-300 font-semibold">
                            Biểu thức toán học (`formulaExpression`) (*):
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const sampleVals: Record<string, number> = {};
                              uniVariables.forEach((v) => {
                                sampleVals[v.key] = v.defaultVal;
                              });
                              const res = StorageService.evaluateUniversityFormula(
                                uniExpression,
                                sampleVals
                              );
                              if (res.error) {
                                setTestFormulaResult(`❌ ${res.error}`);
                              } else {
                                setTestFormulaResult(
                                  `✅ Kết quả chạy thử với điểm mặc định: ${res.score} / ${uniScaleMax} điểm (Điểm chuẩn: ${uniBenchmark})`
                                );
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px]"
                          >
                            ⚡ Test thử công thức
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={uniExpression}
                          onChange={(e) => setUniExpression(e.target.value)}
                          placeholder="VD: (VACT / 12) * 0.7 + ((TOAN + MON2 + MON3) / 3 * 10) * 0.2 + UUTIEN"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-cyan-500/40 text-amber-300 font-mono font-bold text-xs"
                        />
                        {testFormulaResult && (
                          <div className="mt-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-white/10 text-[11px] font-bold text-emerald-300">
                            {testFormulaResult}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">
                          Ghi chú phương thức xét tuyển (hiển thị kèm theo ngành):
                        </label>
                        <textarea
                          rows={2}
                          value={uniNote}
                          onChange={(e) => setUniNote(e.target.value)}
                          placeholder="Giải thích tỷ trọng điểm ĐGNL, điểm THPTQG, quy đổi IELTS..."
                          className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg"
                      >
                        {editingMethod
                          ? `💾 Lưu Cập Nhật Phương Thức & Điểm Chuẩn (${uniBenchmark})`
                          : `➕ Lưu Phương Thức Xét Tuyển & Điểm Chuẩn Mới`}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })()}
        </main>
      </div>

      {/* Fullscreen Live Loading Screen Preview when Admin clicks "Chạy thử Loading ngay" */}
      {showFullLoadingPreview && (
        <div
          onClick={() => setShowFullLoadingPreview(false)}
          className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer"
        >
          <div className="w-36 h-36 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl mb-6">
            <img src={loadingConfig.gifUrl} alt="Loading Preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-base sm:text-lg font-bold text-white max-w-lg mb-4 italic">
            {loadingConfig.quoteText}
          </p>
          <div className="w-64 h-2.5 rounded-full bg-slate-800 overflow-hidden mb-3">
            <div
              className="h-full w-full animate-pulse rounded-full"
              style={{ backgroundColor: loadingConfig.progressColor || '#6366f1' }}
            />
          </div>
          <span className="text-xs text-slate-400">
            Đang chạy thử màn hình Loading ({loadingConfig.durationMs}ms) — Bấm bất kỳ đâu để đóng ngay
          </span>
        </div>
      )}
    </div>
  );
};
