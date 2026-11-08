import React, { useState, useEffect, useRef } from 'react';
import { StorageService } from './services/storage';
import {
  User,
  BackgroundConfig,
  AdminCustomButton,
  LoadingConfig,
  DashboardWidget,
  StudyMaterial,
  Song,
  SiteStats,
  BlinkBlinkConfig,
  LandingCoverConfig,
  MicroUIConfig,
  FooterConfig,
  ExamCountdownConfig,
  NavbarConfig,
  StatsConfig,
  StudyStreakInfo,
} from './types';
import { calculateGracePeriod, GRACE_PERIOD_SECONDS } from './utils/timer';
import { CoverScreen } from './components/CoverScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { StudyZoneTHPTQG } from './components/StudyZoneTHPTQG';
import { StudyZoneVACT } from './components/StudyZoneVACT';
import { ForumQAView } from './components/ForumQAView';
import { LeaderboardModal } from './components/LeaderboardModal';
import { DraggableMusicPlayer } from './components/DraggableMusicPlayer';
import { BlinkBlinkEngine } from './components/BlinkBlinkEngine';
import { AdminStudio } from './components/AdminStudio';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import { AdminPinModal } from './components/AdminPinModal';
import { AdminSectionBgModal } from './components/AdminSectionBgModal';
import { AdminFirebaseModal } from './components/AdminFirebaseModal';
import { CustomButtonModal } from './components/CustomButtonModal';
import { WidgetEditorModal } from './components/WidgetEditorModal';
import { MaterialEditorModal } from './components/MaterialEditorModal';
import { EyeStatsAdminModal } from './components/EyeStatsAdminModal';
import { PomodoroAmbientMixer } from './components/PomodoroAmbientMixer';
import { ExamSplitScreenOMRModal } from './components/ExamSplitScreenOMRModal';
import { StudyArcadeModal } from './components/StudyArcadeModal';
import { UserPersonalizationModal } from './components/UserPersonalizationModal';
import { PrivateMistakeBookmarkModal } from './components/PrivateMistakeBookmarkModal';
import { UniversityScoreCalculatorModal } from './components/UniversityScoreCalculatorModal';

export default function App() {
  // --- Stage & Navigation State ---
  const [currentStage, setCurrentStage] = useState<'cover' | 'loading' | 'workspace'>('cover');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => StorageService.getTheme());

  // --- Core Application Data ---
  const [user, setUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<User[]>(() => StorageService.getAllUsers());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => StorageService.isAdminMode());
  const effectiveIsAdmin = isAdmin || StorageService.isUserAdmin(user);
  const [stats, setStats] = useState<SiteStats>(() => StorageService.getStats());
  const [statsConfig, setStatsConfig] = useState<StatsConfig>(() => StorageService.getStatsConfig());
  const [navbarConfig, setNavbarConfig] = useState<NavbarConfig>(() => StorageService.getNavbarConfig());
  const [streakInfo, setStreakInfo] = useState<StudyStreakInfo>(() => StorageService.getStreakInfo());
  const [coins, setCoins] = useState<number>(() => StorageService.getCoins());
  const [backgrounds, setBackgrounds] = useState<Record<string, BackgroundConfig>>(() =>
    StorageService.getEffectiveBackgrounds()
  );
  const [customButtons, setCustomButtons] = useState<AdminCustomButton[]>(() =>
    StorageService.getCustomButtons()
  );
  const [loadingConfig, setLoadingConfig] = useState<LoadingConfig>(() =>
    StorageService.getLoadingConfig()
  );
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => StorageService.getWidgets());
  const [materials, setMaterials] = useState<StudyMaterial[]>(() => StorageService.getMaterials());
  const [songs, setSongs] = useState<Song[]>(() => StorageService.getSongs());

  // --- Version 2.0 Configurations ---
  const [blinkConfig, setBlinkConfig] = useState<BlinkBlinkConfig>(() =>
    StorageService.getEffectiveBlinkConfig()
  );
  const [landingConfig, setLandingConfig] = useState<LandingCoverConfig>(() =>
    StorageService.getLandingCoverConfig()
  );
  const [microUIConfig, setMicroUIConfig] = useState<MicroUIConfig>(() =>
    StorageService.getMicroUIConfig()
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(() =>
    StorageService.getFooterConfig()
  );
  const [countdownConfig, setCountdownConfig] = useState<ExamCountdownConfig>(() =>
    StorageService.getExamCountdownConfig()
  );

  // --- Session & Smart 3-Minute Study Timer ---
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const sessionSecondsRef = useRef(0);

  // --- Modals State ---
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isAdminPinOpen, setIsAdminPinOpen] = useState(false);
  const [isAdminStudioOpen, setIsAdminStudioOpen] = useState(false);
  const [isFirebaseConfigOpen, setIsFirebaseConfigOpen] = useState(false);
  const [isEyeStatsAdminOpen, setIsEyeStatsAdminOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [mistakeBookmarkModal, setMistakeBookmarkModal] = useState<{
    isOpen: boolean;
    tab?: 'mistakes' | 'bookmarks';
  }>({ isOpen: false, tab: 'mistakes' });
  const [isScoreCalculatorOpen, setIsScoreCalculatorOpen] = useState(false);
  const [arcadeModal, setArcadeModal] = useState<{
    isOpen: boolean;
    tab?: 'checkin' | 'wheel' | 'quiz' | 'memory' | 'catch10' | 'shop';
  }>({ isOpen: false, tab: 'checkin' });
  const [appToast, setAppToast] = useState<{
    msg: string;
    type?: 'success' | 'info' | 'warning';
  } | null>(null);
  const [activeExamOMR, setActiveExamOMR] = useState<{
    isOpen: boolean;
    title?: string;
    mode?: 'thptqg' | 'vact';
  }>({ isOpen: false });

  const showAppToast = (msg: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setAppToast({ msg, type });
    setTimeout(() => setAppToast(null), 3500);
  };

  // Section background modal
  const [activeBgSection, setActiveBgSection] = useState<{ id: string; name: string } | null>(null);

  // Custom Button Editor modal
  const [activeEditingButton, setActiveEditingButton] = useState<AdminCustomButton | null | 'new'>(null);

  // Widget Editor modal
  const [activeEditingWidget, setActiveEditingWidget] = useState<DashboardWidget | null | 'new'>(null);

  // Material Editor modal
  const [activeEditingMaterial, setActiveEditingMaterial] = useState<{
    mat?: StudyMaterial;
    defaultSubjectId?: string;
    defaultSubCat?: string;
  } | null>(null);

  // --- URL Autostart check (?autostart=1 skips cover straight to workspace) & Real-time Page View ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('autostart') === '1') {
        setCurrentStage('workspace');
      }
      StorageService.incrementPageView();
      setStats(StorageService.getStats());
      setStatsConfig(StorageService.getStatsConfig());
    }
  }, []);

  // Periodic online tab count refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(StorageService.getStats());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync with BroadcastChannel & same-tab CustomEvent across components
  useEffect(() => {
    const unsubscribe = StorageService.subscribe((eventType) => {
      if (
        eventType === 'USER_AUTH_CHANGED' ||
        eventType === 'LEADERBOARD_UPDATED' ||
        eventType === 'user_profile' ||
        eventType === 'users'
      ) {
        setUser(StorageService.getCurrentUser());
        setAllUsers(StorageService.getAllUsers());
        setCoins(StorageService.getCoins());
      } else if (eventType.startsWith('coins') || eventType === 'checkin' || eventType === 'shop') {
        setCoins(StorageService.getCoins());
        setUser(StorageService.getCurrentUser());
        setAllUsers(StorageService.getAllUsers());
      } else if (eventType === 'ADMIN_STATE_CHANGED') {
        setIsAdmin(StorageService.isAdminMode());
      } else if (eventType === 'BACKGROUND_CHANGED' || eventType === 'USER_PERSONALIZATION_CHANGED') {
        setBackgrounds(StorageService.getEffectiveBackgrounds());
        setBlinkConfig(StorageService.getEffectiveBlinkConfig());
      } else if (eventType === 'BUTTONS_CHANGED') {
        setCustomButtons(StorageService.getCustomButtons());
      } else if (eventType === 'LOADING_CONFIG_CHANGED') {
        setLoadingConfig(StorageService.getLoadingConfig());
      } else if (eventType === 'WIDGETS_CHANGED') {
        setWidgets(StorageService.getWidgets());
      } else if (eventType === 'MATERIALS_CHANGED' || eventType === 'material_unlocks') {
        setMaterials(StorageService.getMaterials());
        setCoins(StorageService.getCoins());
      } else if (eventType === 'SONGS_CHANGED') {
        setSongs(StorageService.getSongs());
      } else if (eventType === 'STATS_UPDATED') {
        setStats(StorageService.getStats());
        setStatsConfig(StorageService.getStatsConfig());
      } else if (eventType === 'NAVBAR_CHANGED') {
        setNavbarConfig(StorageService.getNavbarConfig());
      } else if (
        eventType === 'STREAK_CHANGED' ||
        eventType === 'DAILY_TASKS_CHANGED' ||
        eventType === 'streak'
      ) {
        setStreakInfo(StorageService.getStreakInfo());
      } else if (eventType === 'BLINK_BLINK_CHANGED') {
        setBlinkConfig(StorageService.getEffectiveBlinkConfig());
      } else if (eventType === 'LANDING_COVER_CHANGED') {
        setLandingConfig(StorageService.getLandingCoverConfig());
      } else if (eventType === 'MICRO_UI_CHANGED') {
        setMicroUIConfig(StorageService.getMicroUIConfig());
      } else if (eventType === 'FOOTER_CONFIG_CHANGED') {
        setFooterConfig(StorageService.getFooterConfig());
      } else if (eventType === 'EXAM_COUNTDOWN_CHANGED') {
        setCountdownConfig(StorageService.getExamCountdownConfig());
      }
    });
    return unsubscribe;
  }, []);

  // Real-time Session, 3-Minute Grace Period & 5-Minute (300s) Daily Streak Timer Loop
  useEffect(() => {
    if (currentStage !== 'workspace') return;

    const timer = setInterval(() => {
      // 1. Update 5-Minute (300s) Daily Streak Progress
      const streakRes = StorageService.incrementDailyStreakProgress(1);
      setStreakInfo(streakRes.streakInfo);
      if (streakRes.activatedJustNow) {
        setCoins(StorageService.getCoins());
        showAppToast(
          `🔥 TUYỆT ĐỈNH ! Bạn đã học đủ 5 phút hôm nay: Chuỗi Streak tăng lên ${streakRes.streakInfo.currentStreak} ngày & Thưởng +50 S-Coin!`,
          'success'
        );
      }

      // 2. Update 3-Minute Grace Period & Total Leaderboard Study Time
      const nextSeconds = sessionSecondsRef.current + 1;
      sessionSecondsRef.current = nextSeconds;
      setSessionSeconds(nextSeconds);
      if (nextSeconds > GRACE_PERIOD_SECONDS && StorageService.getCurrentUser()) {
        StorageService.incrementStudyTime(1);
        setUser(StorageService.getCurrentUser());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStage, Boolean(user)]);

  const handleEnterWorkspace = () => {
    setCurrentStage('loading');
    setTimeout(() => {
      setCurrentStage('workspace');
      sessionSecondsRef.current = 0;
      setSessionSeconds(0);
    }, loadingConfig.durationMs || 1500);
  };

  const graceState = calculateGracePeriod(sessionSeconds);

  const handleSaveBackground = (newCfg: BackgroundConfig) => {
    StorageService.updateSectionBackground(newCfg.sectionId, newCfg);
    setBackgrounds(StorageService.getEffectiveBackgrounds());
  };

  const handleSaveButton = (btn: AdminCustomButton) => {
    StorageService.saveCustomButton(btn);
    setCustomButtons(StorageService.getCustomButtons());
    setActiveEditingButton(null);
  };

  const handleDeleteButton = (id: string) => {
    StorageService.deleteCustomButton(id);
    setCustomButtons(StorageService.getCustomButtons());
    setActiveEditingButton(null);
  };

  const handleSaveWidget = (widget: DashboardWidget) => {
    StorageService.saveWidget(widget);
    setWidgets(StorageService.getWidgets());
    setActiveEditingWidget(null);
  };

  const handleDeleteWidget = (id: string) => {
    StorageService.deleteWidget(id);
    setWidgets(StorageService.getWidgets());
    setActiveEditingWidget(null);
  };

  const handleSaveMaterial = (mat: StudyMaterial) => {
    const finalMat: StudyMaterial = effectiveIsAdmin
      ? { ...mat, approvalStatus: 'approved' }
      : {
          ...mat,
          approvalStatus: 'pending',
          submittedBy: user?.displayName || mat.author || 'Sĩ tử đóng góp',
          submittedById: user?.id,
        };
    StorageService.saveMaterial(finalMat);
    setMaterials(StorageService.getMaterials());
    setActiveEditingMaterial(null);
    if (!effectiveIsAdmin) {
      showAppToast(
        '📤 Đã gửi tài liệu vào Hàng Đợi Duyệt của Admin! Bạn sẽ tự động nhận +50 S-Coin ngay khi được duyệt.',
        'success'
      );
    }
  };

  const handleDeleteMaterial = (id: string) => {
    StorageService.deleteMaterial(id);
    setMaterials(StorageService.getMaterials());
  };

  const handleIncrementMaterialView = (id: string) => {
    StorageService.incrementMaterialView(id);
    setMaterials(StorageService.getMaterials());
  };

  const handleAddSong = (newSong: Song) => {
    StorageService.saveSong(newSong);
    setSongs(StorageService.getSongs());
  };

  const reloadAllData = () => {
    setAllUsers(StorageService.getAllUsers());
    setUser(StorageService.getCurrentUser());
    setMaterials(StorageService.getMaterials());
    setWidgets(StorageService.getWidgets());
    setCustomButtons(StorageService.getCustomButtons());
    setNavbarConfig(StorageService.getNavbarConfig());
    setStats(StorageService.getStats());
    setStatsConfig(StorageService.getStatsConfig());
    setStreakInfo(StorageService.getStreakInfo());
    setCoins(StorageService.getCoins());
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    StorageService.setTheme(nextTheme);
  };

  const activeCustomNavView = navbarConfig.items.find(
    (item) => item.type === 'custom_view' && (item.targetTab === activeTab || item.id === activeTab)
  );

  return (
    <div className={`min-h-screen text-slate-100 ${theme === 'light' ? 'light-mode bg-slate-100 text-slate-900' : 'bg-slate-950'}`}>
      {/* Global Toast Notification */}
      {appToast && (
        <div
          className={`fixed top-20 right-4 z-[150] px-5 py-3 rounded-2xl font-bold text-xs shadow-2xl border flex items-center gap-2.5 animate-bounce ${
            appToast.type === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 border-emerald-300'
          }`}
        >
          <span>{appToast.msg}</span>
        </div>
      )}

      {/* BACKGROUND PARTICLE BLINK-BLINK ENGINE */}
      <BlinkBlinkEngine config={blinkConfig} />

      {/* TIER 1: COVER SCREEN */}
      {currentStage === 'cover' && (
        <CoverScreen
          onEnterWorkspace={handleEnterWorkspace}
          isAdmin={effectiveIsAdmin}
          bgConfig={backgrounds['cover'] || backgrounds.cover}
          landingConfig={landingConfig}
          stats={stats}
          statsConfig={statsConfig}
          customButtons={customButtons}
          onOpenBgEditor={() => setActiveBgSection({ id: 'cover', name: 'Cover Screen (Trang chủ bên ngoài)' })}
          onOpenButtonEditor={(btn) => setActiveEditingButton(btn || 'new')}
          onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
          onOpenEyeStatsAdmin={() => setIsEyeStatsAdminOpen(true)}
        />
      )}

      {/* TRANSITION: LOADING GIF SCREEN */}
      {currentStage === 'loading' && (
        <LoadingScreen
          config={loadingConfig}
          isAdmin={effectiveIsAdmin}
          onUpdateConfig={(cfg) => {
            StorageService.saveLoadingConfig(cfg);
            setLoadingConfig(cfg);
          }}
        />
      )}

      {/* TIER 2: MAIN WORKSPACE */}
      {currentStage === 'workspace' && (
        <div className="flex flex-col min-h-screen">
          {/* Fixed Navbar */}
          <Navbar
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            user={user}
            graceState={graceState}
            navbarConfig={navbarConfig}
            streakDays={streakInfo.currentStreak}
            streakInfo={streakInfo}
            coins={coins}
            onOpenArcade={(tab) => setArcadeModal({ isOpen: true, tab: tab || 'checkin' })}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenLeaderboard={() => {
              setAllUsers(StorageService.getAllUsers());
              setIsLeaderboardOpen(true);
            }}
            onOpenFirebaseConfig={() => setIsFirebaseConfigOpen(true)}
            onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
            onOpenNavbarCustomizer={() => setIsAdminStudioOpen(true)}
            onOpenPomodoro={() => setIsPomodoroOpen((prev) => !prev)}
            onOpenPersonalization={() => setIsPersonalizationOpen(true)}
            onOpenMistakeNotebook={() => setMistakeBookmarkModal({ isOpen: true, tab: 'mistakes' })}
            onOpenScoreCalculator={() => setIsScoreCalculatorOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            isAdmin={effectiveIsAdmin}
            bgConfig={backgrounds['navbar'] || backgrounds.navbar}
            onOpenBgEditor={() => setActiveBgSection({ id: 'navbar', name: 'Thanh điều hướng (Navbar)' })}
          />

          {/* Active Study View */}
          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <DashboardView
                widgets={widgets}
                isAdmin={effectiveIsAdmin}
                countdownConfig={countdownConfig}
                microUIConfig={microUIConfig}
                onOpenWidgetEditor={(w) => setActiveEditingWidget(w || 'new')}
                onNavigateToTab={setActiveTab}
                bgConfig={backgrounds['dashboard'] || backgrounds.dashboard}
                onOpenBgEditor={() => setActiveBgSection({ id: 'dashboard', name: 'Bàn học & Dashboard Tổng quan' })}
                onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
                onOpenPomodoro={() => setIsPomodoroOpen(true)}
                onOpenExamOMR={(title, mode) => setActiveExamOMR({ isOpen: true, title, mode })}
                onOpenArcade={() => setArcadeModal({ isOpen: true, tab: 'checkin' })}
                onOpenPersonalization={() => setIsPersonalizationOpen(true)}
                onOpenMistakeNotebook={(tab) => setMistakeBookmarkModal({ isOpen: true, tab: tab || 'mistakes' })}
                onOpenScoreCalculator={() => setIsScoreCalculatorOpen(true)}
                theme={theme}
              />
            )}

            {activeTab === 'thptqg' && (
              <StudyZoneTHPTQG
                materials={materials}
                isAdmin={effectiveIsAdmin}
                onOpenMaterialEditor={(mat, defaultSubjectId, defaultSubCat) =>
                  setActiveEditingMaterial({ mat, defaultSubjectId, defaultSubCat })
                }
                onDeleteMaterial={handleDeleteMaterial}
                onIncrementView={handleIncrementMaterialView}
                bgConfig={backgrounds['thptqg'] || backgrounds.thptqg}
                onOpenBgEditor={() => setActiveBgSection({ id: 'thptqg', name: 'Phân vùng Ôn thi THPT Quốc Gia' })}
                onOpenExamOMR={(title, mode) => setActiveExamOMR({ isOpen: true, title, mode })}
                theme={theme}
              />
            )}

            {activeTab === 'vact' && (
              <StudyZoneVACT
                materials={materials}
                isAdmin={effectiveIsAdmin}
                onOpenMaterialEditor={(mat, defaultSubjectId, defaultSubCat) =>
                  setActiveEditingMaterial({ mat, defaultSubjectId, defaultSubCat })
                }
                onDeleteMaterial={handleDeleteMaterial}
                onIncrementView={handleIncrementMaterialView}
                bgConfig={backgrounds['vact'] || backgrounds.vact}
                onOpenBgEditor={() => setActiveBgSection({ id: 'vact', name: 'Phân vùng ĐGNL ĐHQG TP.HCM (V-ACT)' })}
                onOpenExamOMR={(title, mode) => setActiveExamOMR({ isOpen: true, title, mode })}
                theme={theme}
              />
            )}

            {activeTab === 'forum' && (
              <ForumQAView
                user={user}
                isAdmin={effectiveIsAdmin}
                onOpenAuth={() => setIsAuthOpen(true)}
                bgConfig={backgrounds['forum'] || backgrounds.forum}
                theme={theme}
              />
            )}

            {/* Dynamic Custom Navbar Page (Created via Admin Studio Navbar Customizer) */}
            {activeCustomNavView && (
              <div className="min-h-[calc(100vh-4rem)] pt-8 pb-24 px-4 sm:px-8 max-w-5xl mx-auto">
                <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        Chuyên mục mở rộng
                      </span>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                        {activeCustomNavView.label}
                      </h1>
                    </div>
                    {effectiveIsAdmin && (
                      <button
                        type="button"
                        onClick={() => setIsAdminStudioOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                      >
                        ✏️ Sửa trang này trong Studio
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {activeCustomNavView.customContent ||
                      `Chào mừng bạn đến với chuyên mục "${activeCustomNavView.label}". Admin có thể cập nhật nội dung, tài liệu hoặc thông báo tại đây trong Admin Studio.`}
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* DRAGGABLE FLOATING SPOTIFY MUSIC PLAYER */}
          <DraggableMusicPlayer
            songs={songs}
            onAddSong={handleAddSong}
            bgConfig={backgrounds['music'] || backgrounds.music}
          />

          {/* Main Footer with independent branding & secret lock */}
          <Footer
            onOpenAdminPin={() => setIsAdminPinOpen(true)}
            isAdmin={effectiveIsAdmin}
            bgConfig={backgrounds['footer'] || backgrounds.footer}
            footerConfig={footerConfig}
            onOpenBgEditor={() => setActiveBgSection({ id: 'footer', name: 'Chân trang (Footer)' })}
            onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
          />
        </div>
      )}

      {/* --- MODALS & DIALOGS --- */}

      {/* Eye Stats Real-time Admin Reset & Customizer Modal */}
      <EyeStatsAdminModal
        isOpen={isEyeStatsAdminOpen}
        onClose={() => setIsEyeStatsAdminOpen(false)}
        onStatsUpdated={() => {
          setStats(StorageService.getStats());
          setStatsConfig(StorageService.getStatsConfig());
        }}
      />

      {/* Pomodoro Timer & Ambient White Noise Mixer */}
      <PomodoroAmbientMixer
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      {/* Split-Screen Exam Paper & Interactive OMR Answer Sheet */}
      <ExamSplitScreenOMRModal
        isOpen={activeExamOMR.isOpen}
        onClose={() => setActiveExamOMR({ isOpen: false })}
        examTitle={activeExamOMR.title}
        defaultMode={activeExamOMR.mode}
      />

      {/* S-Coin Study Arcade (7-Day Check-In, 4 Minigames & Prestige Shop) */}
      <StudyArcadeModal
        isOpen={arcadeModal.isOpen}
        initialTab={arcadeModal.tab}
        onClose={() => {
          setArcadeModal((prev) => ({ ...prev, isOpen: false }));
          setCoins(StorageService.getCoins());
          setUser(StorageService.getCurrentUser());
          setAllUsers(StorageService.getAllUsers());
        }}
        showToast={showAppToast}
      />

      {/* Full-Screen 👑 ADMIN STUDIO */}
      <AdminStudio
        isOpen={isAdminStudioOpen}
        onClose={() => setIsAdminStudioOpen(false)}
        onSaveLandingCover={(cfg) => setLandingConfig(cfg)}
        onSaveMicroUI={(cfg) => setMicroUIConfig(cfg)}
        onSaveBlinkBlink={(cfg) => setBlinkConfig(cfg)}
        onSaveLoading={(cfg) => setLoadingConfig(cfg)}
        onSaveExamCountdown={(cfg) => setCountdownConfig(cfg)}
        onSaveFooter={(cfg) => setFooterConfig(cfg)}
        onReloadAllData={reloadAllData}
      />

      {/* Auth Modal (Dual Login: Google OAuth & Quick Gmail) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setAllUsers(StorageService.getAllUsers());
        }}
      />

      {/* User Profile Modal */}
      {user && (
        <UserProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
          onUserUpdated={(updated) => {
            setUser(updated);
            setAllUsers(StorageService.getAllUsers());
          }}
          onLogout={() => {
            StorageService.logout();
            setUser(null);
          }}
        />
      )}

      {/* Real-time Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        users={allUsers}
        currentUser={user}
      />

      {/* Hidden Admin PIN Modal (Zero Leaked Hints, strict security) */}
      <AdminPinModal
        isOpen={isAdminPinOpen}
        onClose={() => setIsAdminPinOpen(false)}
        isAdmin={isAdmin}
        onAdminStateChange={(active) => setIsAdmin(active)}
        onOpenAdminStudio={() => setIsAdminStudioOpen(true)}
      />

      {/* Admin Visual Background Customizer Modal */}
      {activeBgSection && (
        <AdminSectionBgModal
          isOpen={Boolean(activeBgSection)}
          onClose={() => setActiveBgSection(null)}
          sectionId={activeBgSection.id}
          sectionName={activeBgSection.name}
          currentConfig={backgrounds[activeBgSection.id] || backgrounds.dashboard}
          onSave={handleSaveBackground}
        />
      )}

      {/* Admin Firebase JSON Configuration Modal */}
      <AdminFirebaseModal
        isOpen={isFirebaseConfigOpen}
        onClose={() => setIsFirebaseConfigOpen(false)}
      />

      {/* Custom Button Editor Modal */}
      {activeEditingButton && (
        <CustomButtonModal
          isOpen={Boolean(activeEditingButton)}
          onClose={() => setActiveEditingButton(null)}
          button={activeEditingButton === 'new' ? null : activeEditingButton}
          onSave={handleSaveButton}
          onDelete={handleDeleteButton}
        />
      )}

      {/* Widget Editor Modal */}
      {activeEditingWidget && (
        <WidgetEditorModal
          isOpen={Boolean(activeEditingWidget)}
          onClose={() => setActiveEditingWidget(null)}
          widget={activeEditingWidget === 'new' ? null : activeEditingWidget}
          onSave={handleSaveWidget}
          onDelete={handleDeleteWidget}
        />
      )}

      {/* Material Editor Modal */}
      {activeEditingMaterial && (
        <MaterialEditorModal
          isOpen={Boolean(activeEditingMaterial)}
          onClose={() => setActiveEditingMaterial(null)}
          material={activeEditingMaterial.mat}
          defaultSubjectId={activeEditingMaterial.defaultSubjectId}
          defaultSubCategory={activeEditingMaterial.defaultSubCat}
          isAdmin={effectiveIsAdmin}
          availableSubjects={[
            { id: 'toan', name: 'Toán học (THPTQG)' },
            { id: 'van', name: 'Ngữ văn (THPTQG)' },
            { id: 'anh', name: 'Tiếng Anh (THPTQG)' },
            { id: 'ly', name: 'Vật lý (THPTQG)' },
            { id: 'hoa', name: 'Hóa học (THPTQG)' },
            { id: 'sinh', name: 'Sinh học (THPTQG)' },
            { id: 'su', name: 'Lịch sử (THPTQG)' },
            { id: 'dia', name: 'Địa lý (THPTQG)' },
            { id: 'gdkt', name: 'GDKT & PL (THPTQG)' },
            { id: 'vact-part1', name: 'Phần 1: Sử dụng ngôn ngữ (V-ACT)' },
            { id: 'vact-part2', name: 'Phần 2: Toán học & Logic (V-ACT)' },
            { id: 'vact-part3', name: 'Phần 3: Giải quyết vấn đề (V-ACT)' },
            { id: 'vact-part4', name: 'Phần 4: Kho đề thực chiến (V-ACT)' },
          ]}
          onSave={handleSaveMaterial}
          onDelete={handleDeleteMaterial}
        />
      )}

      {/* v6.1: User Personalization Modal (Blink-Blink & Personal Study Backgrounds) */}
      <UserPersonalizationModal
        isOpen={isPersonalizationOpen}
        onClose={() => setIsPersonalizationOpen(false)}
        onConfigUpdated={() => {
          setBackgrounds(StorageService.getEffectiveBackgrounds());
          setBlinkConfig(StorageService.getEffectiveBlinkConfig());
        }}
        showToast={showAppToast}
      />

      {/* v6.1: Account-Private Mistake Notebook & Bookmarks Modal */}
      <PrivateMistakeBookmarkModal
        isOpen={mistakeBookmarkModal.isOpen}
        initialTab={mistakeBookmarkModal.tab}
        onClose={() => setMistakeBookmarkModal((prev) => ({ ...prev, isOpen: false }))}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        showToast={showAppToast}
      />

      {/* v6.1: University Admission Score Calculator Modal */}
      <UniversityScoreCalculatorModal
        isOpen={isScoreCalculatorOpen}
        onClose={() => setIsScoreCalculatorOpen(false)}
      />
    </div>
  );
}
