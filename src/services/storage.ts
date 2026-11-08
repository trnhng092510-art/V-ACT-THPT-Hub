import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  type Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import {
  db as provisionedDb,
  auth as provisionedAuth,
  firebaseConfig as provisionedConfig,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  User,
  BackgroundConfig,
  AdminCustomButton,
  LoadingConfig,
  DashboardWidget,
  StudyMaterial,
  Song,
  FirebaseConfigState,
  SiteStats,
  BlinkBlinkConfig,
  LandingCoverConfig,
  MicroUIConfig,
  StickerPack,
  StickerItem,
  ForumPost,
  ForumComment,
  FooterConfig,
  ExamCountdownConfig,
  Teacher,
  StudyFolder,
  StudyFileItem,
  WishNote,
  ForumLayoutType,
  ForumPostReactions,
  Role,
  StatsConfig,
  NavbarConfig,
  NavbarItem,
  DailyTask,
  StudyStreakInfo,
  Flashcard,
  ExamOMRSubmission,
  MaterialUnlockRecord,
  CheckInState,
  ShopItem,
  MistakeItem,
  BookmarkRecord,
  UniversityFormulaProfile,
} from '../types';
import {
  DEFAULT_BACKGROUNDS,
  DEFAULT_CUSTOM_BUTTONS,
  DEFAULT_LOADING_CONFIG,
  DEFAULT_WIDGETS,
  INITIAL_MATERIALS,
  INITIAL_SONGS,
  INITIAL_LEADERBOARD_USERS,
  DEFAULT_BLINK_BLINK,
  DEFAULT_LANDING_COVER,
  DEFAULT_MICRO_UI,
  DEFAULT_FOOTER_CONFIG,
  DEFAULT_EXAM_COUNTDOWN,
  INITIAL_STICKER_PACKS,
  INITIAL_FORUM_POSTS,
  INITIAL_FORUM_COMMENTS,
  INITIAL_TEACHERS,
  INITIAL_FOLDERS,
  INITIAL_STUDY_FILES,
  INITIAL_WISH_NOTES,
  DEFAULT_STATS_CONFIG,
  DEFAULT_NAVBAR_CONFIG,
  INITIAL_DAILY_TASKS,
  INITIAL_FLASHCARDS,
  INITIAL_SHOP_ITEMS,
  INITIAL_UNIVERSITY_FORMULAS,
  DEFAULT_UNIVERSITY_DISCLAIMER_NOTE,
} from '../data/initialData';
import { generateUid } from '../utils/timer';

const KEYS = {
  CURRENT_USER: 'studyhub_current_user',
  ALL_USERS: 'studyhub_all_users',
  ADMIN_PIN: 'studyhub_admin_pin',
  IS_ADMIN: 'studyhub_is_admin_mode',
  BACKGROUNDS: 'studyhub_section_backgrounds',
  CUSTOM_BUTTONS: 'studyhub_custom_buttons',
  LOADING_CONFIG: 'studyhub_loading_config',
  WIDGETS: 'studyhub_dashboard_widgets',
  MATERIALS: 'studyhub_materials',
  SONGS: 'studyhub_songs',
  FIREBASE_CONFIG: 'studyhub_firebase_config',
  PAGE_VIEWS: 'studyhub_page_views',
  THEME: 'studyhub_color_theme',

  // v2.0 Keys
  BLINK_BLINK: 'studyhub_blink_blink',
  LANDING_COVER: 'studyhub_landing_cover',
  MICRO_UI: 'studyhub_micro_ui',
  FOOTER_CONFIG: 'studyhub_footer_config',
  EXAM_COUNTDOWN: 'studyhub_exam_countdown',
  STICKER_PACKS: 'studyhub_sticker_packs',
  FORUM_POSTS: 'studyhub_forum_posts',
  FORUM_COMMENTS: 'studyhub_forum_comments',

  // v3.0 Keys
  TEACHERS: 'studyhub_teachers',
  FOLDERS: 'studyhub_folders',
  STUDY_FILES: 'studyhub_study_files',
  WISH_NOTES: 'studyhub_wish_notes',
  FORUM_LAYOUT: 'studyhub_forum_layout',

  // v4.1 Keys
  STATS_CONFIG: 'studyhub_stats_config',
  ACTIVE_TABS: 'studyhub_active_tabs',
  SESSION_COUNTED: 'studyhub_session_counted',
  NAVBAR_CONFIG: 'studyhub_navbar_config',
  DAILY_TASKS: 'studyhub_daily_tasks',
  STUDY_STREAK: 'studyhub_study_streak',
  FLASHCARDS: 'studyhub_flashcards',
  EXAM_SUBMISSIONS: 'studyhub_exam_submissions',

  // v5.0 & v6.1 Keys
  GUEST_COINS: 'studyhub_guest_coins',
  GUEST_VIP_TICKETS: 'studyhub_guest_vip_tickets',
  GUEST_UNLOCKED_TITLES: 'studyhub_guest_unlocked_titles',
  GUEST_UNLOCKED_FRAMES: 'studyhub_guest_unlocked_frames',
  GUEST_EQUIPPED_TITLE: 'studyhub_guest_equipped_title',
  GUEST_EQUIPPED_FRAME: 'studyhub_guest_equipped_frame',
  GUEST_EQUIPPED_FRAME_IMG: 'studyhub_guest_equipped_frame_img',
  GUEST_DOUBLE_COIN_UNTIL: 'studyhub_guest_double_coin_until',
  CHECKIN_STATE: 'studyhub_checkin_state',
  MATERIAL_UNLOCKS: 'studyhub_material_unlocks',
  SHOP_ITEMS: 'studyhub_shop_items',
  UNIVERSITY_FORMULAS: 'studyhub_university_formulas',
  UNIVERSITY_DISCLAIMER_NOTE: 'studyhub_university_disclaimer_note',
};

// Unique Browser Tab ID for 100% Real-Time Online Tab Counter
const CURRENT_TAB_ID = typeof window !== 'undefined'
  ? (window.sessionStorage.getItem('studyhub_tab_id') || (() => {
      const id = 'tab_' + Math.random().toString(36).slice(2, 9);
      try {
        window.sessionStorage.setItem('studyhub_tab_id', id);
      } catch {}
      return id;
    })())
  : 'node_tab';

function registerTabHeartbeat() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_TABS);
    const tabs: Record<string, number> = raw ? JSON.parse(raw) : {};
    const now = Date.now();
    tabs[CURRENT_TAB_ID] = now;
    // Prune stale tabs older than 6 seconds
    for (const [id, ts] of Object.entries(tabs)) {
      if (now - ts > 6000) {
        delete tabs[id];
      }
    }
    localStorage.setItem(KEYS.ACTIVE_TABS, JSON.stringify(tabs));
  } catch {}
}

function unregisterTab() {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEYS.ACTIVE_TABS);
    if (!raw) return;
    const tabs: Record<string, number> = JSON.parse(raw);
    delete tabs[CURRENT_TAB_ID];
    localStorage.setItem(KEYS.ACTIVE_TABS, JSON.stringify(tabs));
  } catch {}
}

if (typeof window !== 'undefined') {
  registerTabHeartbeat();
  window.setInterval(registerTabHeartbeat, 2500);
  window.addEventListener('beforeunload', unregisterTab);
}

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('studyhub_live_bus');
  } catch (e) {
    console.warn('BroadcastChannel not supported', e);
  }
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = provisionedAuth;
let firebaseDb: Firestore | null = provisionedDb;

// Helper to sanitize document IDs to match ^[a-zA-Z0-9_\-]+$ (max 128 chars)
function sanitizeDocId(id: string): string {
  const cleaned = id.replace(/[^a-zA-Z0-9_\-]/g, '-').slice(0, 128);
  return cleaned || `doc-${Date.now()}`;
}

export const StorageService = {
  // --- Firebase Initialization & Status ---
  getFirebaseConfig(): FirebaseConfigState {
    const raw = localStorage.getItem(KEYS.FIREBASE_CONFIG);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.apiKey && parsed.projectId) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return {
      apiKey: provisionedConfig.apiKey || '',
      authDomain: provisionedConfig.authDomain || '',
      projectId: provisionedConfig.projectId || '',
      storageBucket: provisionedConfig.storageBucket || '',
      messagingSenderId: provisionedConfig.messagingSenderId || '',
      appId: provisionedConfig.appId || '',
      isConfigured: Boolean(provisionedConfig.apiKey && provisionedConfig.projectId),
    };
  },

  setFirebaseConfig(config: FirebaseConfigState): { success: boolean; message: string } {
    try {
      localStorage.setItem(KEYS.FIREBASE_CONFIG, JSON.stringify(config));
      if (config.apiKey && config.projectId) {
        if (getApps().length === 0) {
          firebaseApp = initializeApp(config);
        }
        firebaseAuth = firebaseApp ? getAuth(firebaseApp) : provisionedAuth;
        firebaseDb = firebaseApp ? getFirestore(firebaseApp) : provisionedDb;
        return { success: true, message: 'Đã kết nối Firebase thành công!' };
      }
      firebaseAuth = provisionedAuth;
      firebaseDb = provisionedDb;
      return { success: true, message: 'Đã lưu cấu hình (sử dụng dự án v-act-thptqg-study-hub)' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Lỗi khởi tạo Firebase' };
    }
  },

  isFirebaseActive(): boolean {
    const cfg = this.getFirebaseConfig();
    return Boolean(cfg.isConfigured && cfg.apiKey && cfg.projectId);
  },

  // --- Cloud Firestore Sync Helper (Dual-Storage + handleFirestoreError) ---
  async syncUserToFirestore(user: User): Promise<void> {
    if (!firebaseDb || !firebaseAuth?.currentUser) return;
    const uid = sanitizeDocId(firebaseAuth.currentUser.uid);
    const userPath = `users/${uid}`;
    const privatePath = `users/${uid}/private/info`;
    try {
      const batch = writeBatch(firebaseDb);
      batch.set(doc(firebaseDb, 'users', uid), {
        id: uid,
        ownerId: uid,
        displayName: (user.displayName || 'Sĩ tử 2026').slice(0, 100),
        avatar: (user.avatar || '').slice(0, 1000),
        bio: (user.bio || '').slice(0, 500),
        totalStudySeconds: Math.max(0, Math.min(315360000, Math.floor(user.totalStudySeconds || 0))),
        isOnline: Boolean(user.isOnline),
        role: user.role === 'admin' || user.role === 'co_admin' ? user.role : 'user',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (user.email) {
        batch.set(doc(firebaseDb, 'users', uid, 'private', 'info'), {
          ownerId: uid,
          email: user.email.slice(0, 254),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `${userPath} & ${privatePath}`);
    }
  },

  // --- Page Views & Online Stats (100% Real-Time Tracking) ---
  getActiveOnlineTabCount(): number {
    if (typeof window === 'undefined') return 1;
    try {
      const raw = localStorage.getItem(KEYS.ACTIVE_TABS);
      if (!raw) return 1;
      const tabs: Record<string, number> = JSON.parse(raw);
      const now = Date.now();
      let count = 0;
      for (const [_, ts] of Object.entries(tabs)) {
        if (now - ts <= 6000) {
          count++;
        }
      }
      return Math.max(1, count); // Current viewer is guaranteed online = 1
    } catch {
      return 1;
    }
  },

  getStatsConfig(): StatsConfig {
    try {
      const raw = localStorage.getItem(KEYS.STATS_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch {}
    return DEFAULT_STATS_CONFIG;
  },

  saveStatsConfig(config: StatsConfig): void {
    try {
      localStorage.setItem(KEYS.STATS_CONFIG, JSON.stringify(config));
      localStorage.setItem(KEYS.PAGE_VIEWS, config.totalViews.toString());
      this.broadcast('STATS_UPDATED');
    } catch {}
  },

  getStats(): SiteStats {
    const config = this.getStatsConfig();
    return {
      totalViews: config.totalViews,
      onlineCount: this.getActiveOnlineTabCount(),
    };
  },

  incrementPageView(): number {
    if (typeof window === 'undefined') return 1;
    try {
      const config = this.getStatsConfig();
      // Count exactly +1 per unique browser session
      const hasCounted = sessionStorage.getItem(KEYS.SESSION_COUNTED);
      if (!hasCounted) {
        config.totalViews = Math.max(1, (config.totalViews || 0) + 1);
        this.saveStatsConfig(config);
        sessionStorage.setItem(KEYS.SESSION_COUNTED, 'true');
      }
      return config.totalViews;
    } catch {
      return 1;
    }
  },

  resetPageViews(baseValue = 1): void {
    const config = this.getStatsConfig();
    config.totalViews = Math.max(0, baseValue);
    this.saveStatsConfig(config);
  },

  setPageViews(value: number): void {
    const config = this.getStatsConfig();
    config.totalViews = Math.max(0, value);
    this.saveStatsConfig(config);
  },

  // --- Current User & Authentication ---
  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      this.upsertUser(user);
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
    this.broadcast('USER_AUTH_CHANGED');
  },

  getAllUsers(): User[] {
    try {
      const raw = localStorage.getItem(KEYS.ALL_USERS);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(INITIAL_LEADERBOARD_USERS));
      return INITIAL_LEADERBOARD_USERS;
    } catch {
      return INITIAL_LEADERBOARD_USERS;
    }
  },

  upsertUser(user: User): void {
    try {
      const users = this.getAllUsers();
      const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...user };
      } else {
        users.push(user);
      }
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
      this.broadcast('LEADERBOARD_UPDATED');
    } catch (e) {
      console.error('Failed to upsert user', e);
    }
  },

  deleteUser(userId: string): void {
    const users = this.getAllUsers().filter((u) => u.id !== userId);
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      this.setCurrentUser(null);
    }
    this.broadcast('LEADERBOARD_UPDATED');
  },

  bulkDeleteUsers(userIds: string[]): void {
    const idSet = new Set(userIds);
    const users = this.getAllUsers().filter((u) => !idSet.has(u.id));
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current && idSet.has(current.id)) {
      this.setCurrentUser(null);
    }
    this.broadcast('LEADERBOARD_UPDATED');
  },

  adjustUserStudyTime(userId: string, newSeconds: number): void {
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.totalStudySeconds = Math.max(0, newSeconds);
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        current.totalStudySeconds = target.totalStudySeconds;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(current));
      }
      this.broadcast('LEADERBOARD_UPDATED');
    }
  },

  resetAllStudyTime(): void {
    const users = this.getAllUsers().map((u) => ({
      ...u,
      totalStudySeconds: 0,
    }));
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current) {
      current.totalStudySeconds = 0;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(current));
    }
    this.broadcast('LEADERBOARD_UPDATED');
  },

  async loginWithGoogle(): Promise<{ success: boolean; user?: User; error?: string }> {
    const cfg = this.getFirebaseConfig();
    const activeAuth = firebaseAuth || provisionedAuth;
    if (cfg.isConfigured && cfg.apiKey && activeAuth) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await signInWithPopup(activeAuth, provider);
        const gUser = res.user;
        const emailLower = (gUser.email || 'user@gmail.com').toLowerCase();
        const existing = this.getAllUsers().find((u) => u.email.toLowerCase() === emailLower);
        const isBootstrappedOwner = emailLower === 'trnhng092510@gmail.com';

        const userObj: User = {
          id: sanitizeDocId(gUser.uid || (existing ? existing.id : generateUid())),
          email: gUser.email || 'user@gmail.com',
          displayName: (gUser.displayName || 'Sĩ tử THPTQG').slice(0, 100),
          avatar: (gUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop').slice(0, 1000),
          bio: existing ? existing.bio : 'Mục tiêu 27+ Khối A00 & 950+ V-ACT',
          totalStudySeconds: existing ? existing.totalStudySeconds : 0,
          isOnline: true,
          lastActive: Date.now(),
          role: isBootstrappedOwner ? 'admin' : existing?.role || 'user',
          createdAt: existing ? existing.createdAt : Date.now(),
        };

        this.setCurrentUser(userObj);
        if (isBootstrappedOwner) {
          this.setAdminMode(true);
        }
        await this.syncUserToFirestore(userObj);
        return { success: true, user: userObj };
      } catch (err: any) {
        console.warn('Firebase popup error, falling back to simulated Google login:', err);
      }
    }

    const demoEmail = 'student.vietnam2026@gmail.com';
    const existing = this.getAllUsers().find((u) => u.email.toLowerCase() === demoEmail);
    const fallbackUser: User = {
      id: existing ? existing.id : generateUid(),
      email: demoEmail,
      displayName: 'Nguyễn Văn Minh (Google Auth)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop',
      bio: 'Sĩ tử 2k8 - Quyết tâm Thủ khoa ĐGNL ĐHQG TP.HCM',
      totalStudySeconds: existing ? existing.totalStudySeconds : 1200,
      isOnline: true,
      lastActive: Date.now(),
      role: 'user',
      createdAt: existing ? existing.createdAt : Date.now(),
    };

    this.setCurrentUser(fallbackUser);
    return { success: true, user: fallbackUser };
  },

  loginWithQuickGmail(email: string, displayName: string, passwordIdentifier: string): { success: boolean; user: User } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || 'Học viên Chăm chỉ';
    const users = this.getAllUsers();
    let user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        id: generateUid(),
        email: cleanEmail,
        displayName: cleanName,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
        bio: 'Mục tiêu 27+ Khối A00 - 950+ V-ACT',
        totalStudySeconds: 0,
        isOnline: true,
        lastActive: Date.now(),
        role: 'user',
        createdAt: Date.now(),
      };
    } else {
      user.displayName = cleanName;
      user.isOnline = true;
      user.lastActive = Date.now();
    }

    this.setCurrentUser(user);
    return { success: true, user };
  },

  logout(): void {
    const current = this.getCurrentUser();
    if (current) {
      current.isOnline = false;
      this.upsertUser(current);
    }
    this.setCurrentUser(null);
  },

  updateUserProfile(updates: Partial<User>): User | null {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated: User = { ...current, ...updates };
    this.setCurrentUser(updated);
    return updated;
  },

  incrementStudyTime(seconds: number): number {
    const current = this.getCurrentUser();
    if (!current) return 0;
    const newTotal = (current.totalStudySeconds || 0) + seconds;
    current.totalStudySeconds = newTotal;
    current.isOnline = true;
    current.lastActive = Date.now();
    this.setCurrentUser(current);
    return newTotal;
  },

  // --- Admin PIN & Mode ---
  getAdminPin(): string {
    return localStorage.getItem(KEYS.ADMIN_PIN) || '2026';
  },

  setAdminPin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(KEYS.ADMIN_PIN, newPin.trim());
    return true;
  },

  verifyAdminPin(pin: string): boolean {
    const actual = this.getAdminPin();
    const valid = pin.trim() === actual;
    if (valid) {
      localStorage.setItem(KEYS.IS_ADMIN, 'true');
      this.broadcast('ADMIN_STATE_CHANGED');
    }
    return valid;
  },

  isAdminMode(): boolean {
    try {
      return localStorage.getItem(KEYS.IS_ADMIN) === 'true';
    } catch {
      return false;
    }
  },

  setAdminMode(active: boolean): void {
    if (active) {
      localStorage.setItem(KEYS.IS_ADMIN, 'true');
    } else {
      localStorage.removeItem(KEYS.IS_ADMIN);
    }
    this.broadcast('ADMIN_STATE_CHANGED');
  },

  // --- Section Backgrounds ---
  getBackgrounds(): Record<string, BackgroundConfig> {
    try {
      const raw = localStorage.getItem(KEYS.BACKGROUNDS);
      if (raw) {
        return { ...DEFAULT_BACKGROUNDS, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_BACKGROUNDS;
  },

  updateSectionBackground(sectionId: string, config: BackgroundConfig): void {
    const current = this.getBackgrounds();
    current[sectionId] = config;
    localStorage.setItem(KEYS.BACKGROUNDS, JSON.stringify(current));
    this.broadcast('BACKGROUND_CHANGED');
  },

  // --- Custom Landing Buttons ---
  getCustomButtons(): AdminCustomButton[] {
    try {
      const raw = localStorage.getItem(KEYS.CUSTOM_BUTTONS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.CUSTOM_BUTTONS, JSON.stringify(DEFAULT_CUSTOM_BUTTONS));
    return DEFAULT_CUSTOM_BUTTONS;
  },

  saveCustomButton(button: AdminCustomButton): void {
    const buttons = this.getCustomButtons();
    const idx = buttons.findIndex((b) => b.id === button.id);
    if (idx >= 0) {
      buttons[idx] = button;
    } else {
      buttons.push(button);
    }
    localStorage.setItem(KEYS.CUSTOM_BUTTONS, JSON.stringify(buttons));
    this.broadcast('BUTTONS_CHANGED');
  },

  deleteCustomButton(buttonId: string): void {
    const buttons = this.getCustomButtons().filter((b) => b.id !== buttonId);
    localStorage.setItem(KEYS.CUSTOM_BUTTONS, JSON.stringify(buttons));
    this.broadcast('BUTTONS_CHANGED');
  },

  // --- Loading Config ---
  getLoadingConfig(): LoadingConfig {
    try {
      const raw = localStorage.getItem(KEYS.LOADING_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_LOADING_CONFIG;
  },

  saveLoadingConfig(config: LoadingConfig): void {
    localStorage.setItem(KEYS.LOADING_CONFIG, JSON.stringify(config));
    this.broadcast('LOADING_CONFIG_CHANGED');
  },

  // --- BlinkBlink Particle Engine ---
  getBlinkBlinkConfig(): BlinkBlinkConfig {
    try {
      const raw = localStorage.getItem(KEYS.BLINK_BLINK);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_BLINK_BLINK;
  },

  saveBlinkBlinkConfig(config: BlinkBlinkConfig): void {
    localStorage.setItem(KEYS.BLINK_BLINK, JSON.stringify(config));
    this.broadcast('BLINK_BLINK_CHANGED');
  },

  // --- Landing Cover Builder Config ---
  getLandingCoverConfig(): LandingCoverConfig {
    try {
      const raw = localStorage.getItem(KEYS.LANDING_COVER);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_LANDING_COVER;
  },

  saveLandingCoverConfig(config: LandingCoverConfig): void {
    localStorage.setItem(KEYS.LANDING_COVER, JSON.stringify(config));
    this.broadcast('LANDING_COVER_CHANGED');
  },

  // --- Micro-UI Config ---
  getMicroUIConfig(): MicroUIConfig {
    try {
      const raw = localStorage.getItem(KEYS.MICRO_UI);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_MICRO_UI;
  },

  saveMicroUIConfig(config: MicroUIConfig): void {
    localStorage.setItem(KEYS.MICRO_UI, JSON.stringify(config));
    this.broadcast('MICRO_UI_CHANGED');
  },

  // --- Footer Config ---
  getFooterConfig(): FooterConfig {
    try {
      const raw = localStorage.getItem(KEYS.FOOTER_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_FOOTER_CONFIG;
  },

  saveFooterConfig(config: FooterConfig): void {
    localStorage.setItem(KEYS.FOOTER_CONFIG, JSON.stringify(config));
    this.broadcast('FOOTER_CONFIG_CHANGED');
  },

  // --- Exam Countdown Config ---
  getExamCountdownConfig(): ExamCountdownConfig {
    try {
      const raw = localStorage.getItem(KEYS.EXAM_COUNTDOWN);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_EXAM_COUNTDOWN;
  },

  saveExamCountdownConfig(config: ExamCountdownConfig): void {
    localStorage.setItem(KEYS.EXAM_COUNTDOWN, JSON.stringify(config));
    this.broadcast('EXAM_COUNTDOWN_CHANGED');
  },

  // --- Sticker Packs Management ---
  getStickerPacks(): StickerPack[] {
    try {
      const raw = localStorage.getItem(KEYS.STICKER_PACKS);
      if (raw && !raw.includes('api.iconify.design')) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(INITIAL_STICKER_PACKS));
    return INITIAL_STICKER_PACKS;
  },

  saveStickerPack(pack: StickerPack): void {
    const packs = this.getStickerPacks();
    const idx = packs.findIndex((p) => p.id === pack.id);
    if (idx >= 0) {
      packs[idx] = pack;
    } else {
      packs.push(pack);
    }
    localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
    this.broadcast('STICKERS_CHANGED');
  },

  deleteStickerPack(packId: string): void {
    const packs = this.getStickerPacks().filter((p) => p.id !== packId);
    localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
    this.broadcast('STICKERS_CHANGED');
  },

  toggleStickerPackApproval(packId: string): void {
    const packs = this.getStickerPacks();
    const target = packs.find((p) => p.id === packId);
    if (target) {
      target.isApproved = !target.isApproved;
      localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
      this.broadcast('STICKERS_CHANGED');
    }
  },

  toggleStickerApproval(packId: string, stickerId: string): void {
    const packs = this.getStickerPacks();
    const pack = packs.find((p) => p.id === packId);
    if (pack) {
      const sticker = pack.stickers.find((s) => s.id === stickerId);
      if (sticker) {
        sticker.isApproved = !sticker.isApproved;
        localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
        this.broadcast('STICKERS_CHANGED');
      }
    }
  },

  addStickerToPack(packId: string, sticker: StickerItem): void {
    const packs = this.getStickerPacks();
    const pack = packs.find((p) => p.id === packId);
    if (pack) {
      pack.stickers.push(sticker);
      localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
      this.broadcast('STICKERS_CHANGED');
    }
  },

  deleteStickerFromPack(packId: string, stickerId: string): void {
    const packs = this.getStickerPacks();
    const pack = packs.find((p) => p.id === packId);
    if (pack) {
      pack.stickers = pack.stickers.filter((s) => s.id !== stickerId);
      localStorage.setItem(KEYS.STICKER_PACKS, JSON.stringify(packs));
      this.broadcast('STICKERS_CHANGED');
    }
  },

  // Get approved stickers for comments in Q&A
  getApprovedStickers(): { packName: string; stickers: StickerItem[] }[] {
    const packs = this.getStickerPacks().filter((p) => p.isApproved);
    return packs.map((p) => ({
      packName: p.name,
      stickers: p.stickers.filter((s) => s.isApproved),
    })).filter((p) => p.stickers.length > 0);
  },

  // --- Forum Q&A Posts & Comments ---
  getForumPosts(): ForumPost[] {
    try {
      const raw = localStorage.getItem(KEYS.FORUM_POSTS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(INITIAL_FORUM_POSTS));
    return INITIAL_FORUM_POSTS;
  },

  saveForumPost(post: ForumPost): void {
    const posts = this.getForumPosts();
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) {
      posts[idx] = post;
    } else {
      posts.unshift(post);
    }
    localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
    this.broadcast('FORUM_CHANGED');
  },

  deleteForumPost(postId: string): void {
    const posts = this.getForumPosts().filter((p) => p.id !== postId);
    localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
    // Also delete comments
    const comments = this.getForumComments().filter((c) => c.postId !== postId);
    localStorage.setItem(KEYS.FORUM_COMMENTS, JSON.stringify(comments));
    this.broadcast('FORUM_CHANGED');
  },

  togglePinForumPost(postId: string): void {
    const posts = this.getForumPosts();
    const target = posts.find((p) => p.id === postId);
    if (target) {
      target.isPinned = !target.isPinned;
      localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
      this.broadcast('FORUM_CHANGED');
    }
  },

  toggleResolvePost(postId: string): void {
    const posts = this.getForumPosts();
    const target = posts.find((p) => p.id === postId);
    if (target) {
      target.status = target.status === 'resolved' ? 'open' : 'resolved';
      localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
      this.broadcast('FORUM_CHANGED');
    }
  },

  getForumComments(postId?: string): ForumComment[] {
    let all: ForumComment[] = [];
    try {
      const raw = localStorage.getItem(KEYS.FORUM_COMMENTS);
      if (raw && !raw.includes('api.iconify.design')) {
        all = JSON.parse(raw);
      } else {
        localStorage.setItem(KEYS.FORUM_COMMENTS, JSON.stringify(INITIAL_FORUM_COMMENTS));
        all = INITIAL_FORUM_COMMENTS;
      }
    } catch {
      all = INITIAL_FORUM_COMMENTS;
    }
    if (postId) {
      return all.filter((c) => c.postId === postId);
    }
    return all;
  },

  saveForumComment(comment: ForumComment): void {
    const all = this.getForumComments();
    all.push(comment);
    localStorage.setItem(KEYS.FORUM_COMMENTS, JSON.stringify(all));

    // Update comment count on post
    const posts = this.getForumPosts();
    const post = posts.find((p) => p.id === comment.postId);
    if (post) {
      post.commentsCount = all.filter((c) => c.postId === post.id).length;
      localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
    }
    this.broadcast('FORUM_CHANGED');
  },

  deleteForumComment(commentId: string): void {
    const all = this.getForumComments();
    const target = all.find((c) => c.id === commentId);
    const updated = all.filter((c) => c.id !== commentId);
    localStorage.setItem(KEYS.FORUM_COMMENTS, JSON.stringify(updated));

    if (target) {
      const posts = this.getForumPosts();
      const post = posts.find((p) => p.id === target.postId);
      if (post) {
        post.commentsCount = updated.filter((c) => c.postId === post.id).length;
        localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
      }
    }
    this.broadcast('FORUM_CHANGED');
  },

  togglePinSolutionComment(commentId: string): void {
    const all = this.getForumComments();
    const target = all.find((c) => c.id === commentId);
    if (target) {
      target.isPinnedSolution = !target.isPinnedSolution;
      localStorage.setItem(KEYS.FORUM_COMMENTS, JSON.stringify(all));
      this.broadcast('FORUM_CHANGED');
    }
  },

  // --- Dashboard Widgets ---
  getWidgets(): DashboardWidget[] {
    try {
      const raw = localStorage.getItem(KEYS.WIDGETS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.WIDGETS, JSON.stringify(DEFAULT_WIDGETS));
    return DEFAULT_WIDGETS;
  },

  saveWidget(widget: DashboardWidget): void {
    const widgets = this.getWidgets();
    const idx = widgets.findIndex((w) => w.id === widget.id);
    if (idx >= 0) {
      widgets[idx] = widget;
    } else {
      widgets.push(widget);
    }
    localStorage.setItem(KEYS.WIDGETS, JSON.stringify(widgets));
    this.broadcast('WIDGETS_CHANGED');
  },

  deleteWidget(widgetId: string): void {
    const widgets = this.getWidgets().filter((w) => w.id !== widgetId);
    localStorage.setItem(KEYS.WIDGETS, JSON.stringify(widgets));
    this.broadcast('WIDGETS_CHANGED');
  },

  // --- Study Materials ---
  getMaterials(includePending = false): StudyMaterial[] {
    let list: StudyMaterial[] = INITIAL_MATERIALS;
    try {
      const raw = localStorage.getItem(KEYS.MATERIALS);
      if (raw !== null) {
        list = JSON.parse(raw);
      } else {
        localStorage.setItem(KEYS.MATERIALS, JSON.stringify(INITIAL_MATERIALS));
      }
    } catch {
      list = INITIAL_MATERIALS;
    }
    if (includePending) return list;
    return list.filter((m) => m.approvalStatus !== 'pending');
  },

  getPendingMaterials(): StudyMaterial[] {
    return this.getMaterials(true).filter((m) => m.approvalStatus === 'pending');
  },

  approveMaterial(matId: string): { success: boolean; rewardedUser?: string } {
    const all = this.getMaterials(true);
    const target = all.find((m) => m.id === matId);
    if (!target) return { success: false };
    target.approvalStatus = 'approved';
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(all));

    // Reward +50 S-Coin to the user who contributed
    if (target.submittedById) {
      const users = this.getAllUsers();
      const contributor = users.find((u) => u.id === target.submittedById);
      if (contributor) {
        this.adminSetUserCoins(contributor.id, (contributor.coins ?? 150) + 50);
      } else {
        this.addCoins(50);
      }
    } else {
      this.addCoins(50);
    }

    this.broadcast('MATERIALS_CHANGED');
    return { success: true, rewardedUser: target.submittedBy || 'Sĩ tử đóng góp' };
  },

  saveMaterial(mat: StudyMaterial): void {
    const mats = this.getMaterials(true);
    const idx = mats.findIndex((m) => m.id === mat.id);
    if (idx >= 0) {
      mats[idx] = mat;
    } else {
      mats.unshift(mat);
    }
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(mats));
    this.broadcast('MATERIALS_CHANGED');
  },

  deleteMaterial(matId: string): void {
    const mats = this.getMaterials(true).filter((m) => m.id !== matId);
    localStorage.setItem(KEYS.MATERIALS, JSON.stringify(mats));
    this.broadcast('MATERIALS_CHANGED');
  },

  incrementMaterialView(matId: string): void {
    const mats = this.getMaterials();
    const target = mats.find((m) => m.id === matId);
    if (target) {
      target.views += 1;
      localStorage.setItem(KEYS.MATERIALS, JSON.stringify(mats));
    }
  },

  // --- Music Playlist ---
  getSongs(): Song[] {
    try {
      const raw = localStorage.getItem(KEYS.SONGS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.SONGS, JSON.stringify(INITIAL_SONGS));
    return INITIAL_SONGS;
  },

  saveSong(song: Song): void {
    const songs = this.getSongs();
    songs.push(song);
    localStorage.setItem(KEYS.SONGS, JSON.stringify(songs));
    this.broadcast('SONGS_CHANGED');
  },

  // --- Theme Management ---
  getTheme(): 'dark' | 'light' {
    try {
      const raw = localStorage.getItem(KEYS.THEME);
      if (raw === 'light' || raw === 'dark') return raw;
    } catch {
      // ignore
    }
    return 'dark';
  },

  setTheme(theme: 'dark' | 'light'): void {
    localStorage.setItem(KEYS.THEME, theme);
    this.broadcast('THEME_CHANGED');
  },

  // --- Co-Admin & Role Management ---
  isUserAdmin(user?: User | null): boolean {
    if (this.isAdminMode()) return true;
    const u = user !== undefined ? user : this.getCurrentUser();
    return u?.role === 'admin' || u?.role === 'co_admin';
  },

  setUserRole(userId: string, role: Role): void {
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId || u.email.toLowerCase() === userId.toLowerCase());
    if (target) {
      target.role = role;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
      const current = this.getCurrentUser();
      if (current && (current.id === target.id || current.email.toLowerCase() === target.email.toLowerCase())) {
        current.role = role;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(current));
      }
      this.broadcast('USER_AUTH_CHANGED');
      this.broadcast('LEADERBOARD_UPDATED');
    }
  },

  updateAdminPin(newPin: string): boolean {
    if (!newPin || newPin.trim().length < 4) return false;
    localStorage.setItem(KEYS.ADMIN_PIN, newPin.trim());
    this.broadcast('ADMIN_STATE_CHANGED');
    return true;
  },

  // --- Wish Notes (Bảng Quyết Tâm & Nguyện Ước Đa Sắc) ---
  getWishNotes(): WishNote[] {
    try {
      const raw = localStorage.getItem(KEYS.WISH_NOTES);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.WISH_NOTES, JSON.stringify(INITIAL_WISH_NOTES));
    return INITIAL_WISH_NOTES;
  },

  saveWishNote(note: WishNote): void {
    const notes = this.getWishNotes();
    const idx = notes.findIndex((n) => n.id === note.id);
    if (idx >= 0) {
      notes[idx] = note;
    } else {
      notes.unshift(note);
    }
    localStorage.setItem(KEYS.WISH_NOTES, JSON.stringify(notes));
    this.broadcast('WISH_NOTES_CHANGED');
  },

  deleteWishNote(noteId: string): void {
    const notes = this.getWishNotes().filter((n) => n.id !== noteId);
    localStorage.setItem(KEYS.WISH_NOTES, JSON.stringify(notes));
    this.broadcast('WISH_NOTES_CHANGED');
  },

  toggleLikeWishNote(noteId: string, userIdOrIp?: string): void {
    const notes = this.getWishNotes();
    const target = notes.find((n) => n.id === noteId);
    if (target) {
      const user = userIdOrIp || 'current-user';
      if (!target.likedBy) target.likedBy = [];
      const already = target.likedBy.includes(user);
      const currentLikes = target.likesCount ?? target.likes ?? 0;
      if (already) {
        target.likedBy = target.likedBy.filter((id) => id !== user);
        const next = Math.max(0, currentLikes - 1);
        target.likesCount = next;
        target.likes = next;
      } else {
        target.likedBy.push(user);
        const next = currentLikes + 1;
        target.likesCount = next;
        target.likes = next;
      }
      localStorage.setItem(KEYS.WISH_NOTES, JSON.stringify(notes));
      this.broadcast('WISH_NOTES_CHANGED');
    }
  },

  // --- Teachers Management ---
  getTeachers(subjectId?: string): Teacher[] {
    let all: Teacher[] = [];
    try {
      const raw = localStorage.getItem(KEYS.TEACHERS);
      if (raw) {
        all = JSON.parse(raw);
      } else {
        localStorage.setItem(KEYS.TEACHERS, JSON.stringify(INITIAL_TEACHERS));
        all = INITIAL_TEACHERS;
      }
    } catch {
      all = INITIAL_TEACHERS;
    }
    if (subjectId) {
      return all.filter((t) => t.subjectId === subjectId);
    }
    return all;
  },

  saveTeacher(teacher: Teacher): void {
    const all = this.getTeachers();
    const idx = all.findIndex((t) => t.id === teacher.id);
    if (idx >= 0) {
      all[idx] = teacher;
    } else {
      all.push(teacher);
    }
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(all));
    this.broadcast('TEACHERS_CHANGED');
  },

  deleteTeacher(teacherId: string): void {
    const all = this.getTeachers().filter((t) => t.id !== teacherId);
    localStorage.setItem(KEYS.TEACHERS, JSON.stringify(all));
    this.broadcast('TEACHERS_CHANGED');
  },

  // --- Nested Folders ---
  getFolders(subjectId?: string, parentId?: string, teacherId?: string): StudyFolder[] {
    let all: StudyFolder[] = [];
    try {
      const raw = localStorage.getItem(KEYS.FOLDERS);
      if (raw) {
        all = JSON.parse(raw);
      } else {
        localStorage.setItem(KEYS.FOLDERS, JSON.stringify(INITIAL_FOLDERS));
        all = INITIAL_FOLDERS;
      }
    } catch {
      all = INITIAL_FOLDERS;
    }
    return all.filter((f) => {
      if (subjectId && f.subjectId !== subjectId) return false;
      if (teacherId && f.teacherId !== teacherId) return false;
      if (parentId !== undefined && f.parentId !== parentId) return false;
      return true;
    });
  },

  getAllFolders(): StudyFolder[] {
    try {
      const raw = localStorage.getItem(KEYS.FOLDERS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.FOLDERS, JSON.stringify(INITIAL_FOLDERS));
    return INITIAL_FOLDERS;
  },

  saveFolder(folder: StudyFolder): void {
    const all = this.getAllFolders();
    const idx = all.findIndex((f) => f.id === folder.id);
    if (idx >= 0) {
      all[idx] = folder;
    } else {
      all.push(folder);
    }
    localStorage.setItem(KEYS.FOLDERS, JSON.stringify(all));
    this.broadcast('FOLDERS_CHANGED');
  },

  deleteFolder(folderId: string): void {
    const all = this.getAllFolders().filter((f) => f.id !== folderId && f.parentId !== folderId);
    localStorage.setItem(KEYS.FOLDERS, JSON.stringify(all));
    this.broadcast('FOLDERS_CHANGED');
  },

  // --- Study Files & Links ---
  getStudyFiles(folderId?: string, subjectId?: string, teacherId?: string): StudyFileItem[] {
    const all = this.getAllStudyFiles().filter((f) => f.approvalStatus !== 'pending');
    return all.filter((f) => {
      if (folderId !== undefined && f.folderId !== folderId) return false;
      if (subjectId && f.subjectId !== subjectId) return false;
      if (teacherId && f.teacherId !== teacherId) return false;
      return true;
    });
  },

  getPendingStudyFiles(): StudyFileItem[] {
    return this.getAllStudyFiles().filter((f) => f.approvalStatus === 'pending');
  },

  approveStudyFile(fileId: string): { success: boolean; rewardedUser?: string } {
    const all = this.getAllStudyFiles();
    const target = all.find((f) => f.id === fileId);
    if (!target) return { success: false };
    target.approvalStatus = 'approved';
    localStorage.setItem(KEYS.STUDY_FILES, JSON.stringify(all));

    if (target.submittedById) {
      const users = this.getAllUsers();
      const contributor = users.find((u) => u.id === target.submittedById);
      if (contributor) {
        this.adminSetUserCoins(contributor.id, (contributor.coins ?? 150) + 50);
      } else {
        this.addCoins(50);
      }
    } else {
      this.addCoins(50);
    }

    this.broadcast('STUDY_FILES_CHANGED');
    return { success: true, rewardedUser: target.submittedBy || 'Sĩ tử đóng góp' };
  },

  getAllStudyFiles(): StudyFileItem[] {
    try {
      const raw = localStorage.getItem(KEYS.STUDY_FILES);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // ignore
    }
    localStorage.setItem(KEYS.STUDY_FILES, JSON.stringify(INITIAL_STUDY_FILES));
    return INITIAL_STUDY_FILES;
  },

  saveStudyFile(file: StudyFileItem): void {
    const all = this.getAllStudyFiles();
    const idx = all.findIndex((f) => f.id === file.id);
    if (idx >= 0) {
      all[idx] = file;
    } else {
      all.unshift(file);
    }
    localStorage.setItem(KEYS.STUDY_FILES, JSON.stringify(all));
    this.broadcast('STUDY_FILES_CHANGED');
  },

  deleteStudyFile(fileId: string): void {
    const all = this.getAllStudyFiles().filter((f) => f.id !== fileId);
    localStorage.setItem(KEYS.STUDY_FILES, JSON.stringify(all));
    this.broadcast('STUDY_FILES_CHANGED');
  },

  incrementStudyFileView(fileId: string): void {
    const all = this.getAllStudyFiles();
    const target = all.find((f) => f.id === fileId);
    if (target) {
      target.views = (target.views || 0) + 1;
      localStorage.setItem(KEYS.STUDY_FILES, JSON.stringify(all));
    }
  },

  // --- Forum Layout & Reactions ---
  getForumLayout(): ForumLayoutType {
    try {
      const raw = localStorage.getItem(KEYS.FORUM_LAYOUT);
      if (raw && ['feed', 'grid', 'kanban', 'compact'].includes(raw)) {
        return raw as ForumLayoutType;
      }
    } catch {
      // ignore
    }
    return 'feed';
  },

  setForumLayout(layout: ForumLayoutType): void {
    localStorage.setItem(KEYS.FORUM_LAYOUT, layout);
    this.broadcast('FORUM_LAYOUT_CHANGED');
  },

  toggleForumReaction(
    postId: string,
    userId: string,
    reactionType: 'heart' | 'fire' | 'bulb' | 'clap'
  ): ForumPost | null {
    const posts = this.getForumPosts();
    const target = posts.find((p) => p.id === postId);
    if (!target) return null;

    if (!target.reactions) {
      target.reactions = { heart: 0, fire: 0, bulb: 0, clap: 0, userReactions: {} };
    }
    if (!target.reactions.userReactions) {
      target.reactions.userReactions = {};
    }

    const userList = target.reactions.userReactions[userId] || [];
    const already = userList.includes(reactionType);

    if (already) {
      target.reactions.userReactions[userId] = userList.filter((r) => r !== reactionType);
      target.reactions[reactionType] = Math.max(0, (target.reactions[reactionType] || 1) - 1);
    } else {
      target.reactions.userReactions[userId] = [...userList, reactionType];
      target.reactions[reactionType] = (target.reactions[reactionType] || 0) + 1;
    }

    localStorage.setItem(KEYS.FORUM_POSTS, JSON.stringify(posts));
    this.broadcast('FORUM_CHANGED');
    return target;
  },

  // --- Dynamic Navbar Configuration (v4.1) ---
  getNavbarConfig(): NavbarConfig {
    try {
      const raw = localStorage.getItem(KEYS.NAVBAR_CONFIG);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.NAVBAR_CONFIG, JSON.stringify(DEFAULT_NAVBAR_CONFIG));
    return DEFAULT_NAVBAR_CONFIG;
  },

  saveNavbarConfig(config: NavbarConfig): void {
    localStorage.setItem(KEYS.NAVBAR_CONFIG, JSON.stringify(config));
    this.broadcast('NAVBAR_CHANGED');
  },

  addNavbarItem(item: NavbarItem): void {
    const config = this.getNavbarConfig();
    config.items.push(item);
    this.saveNavbarConfig(config);
  },

  updateNavbarItem(item: NavbarItem): void {
    const config = this.getNavbarConfig();
    const idx = config.items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      config.items[idx] = item;
      this.saveNavbarConfig(config);
    }
  },

  deleteNavbarItem(itemId: string): void {
    const config = this.getNavbarConfig();
    config.items = config.items.filter((i) => i.id !== itemId);
    this.saveNavbarConfig(config);
  },

  reorderNavbarItem(itemId: string, direction: 'left' | 'right'): void {
    const config = this.getNavbarConfig();
    const idx = config.items.findIndex((i) => i.id === itemId);
    if (idx < 0) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= config.items.length) return;
    const temp = config.items[idx];
    config.items[idx] = config.items[targetIdx];
    config.items[targetIdx] = temp;
    // update order numbers
    config.items.forEach((item, index) => {
      item.order = index;
    });
    this.saveNavbarConfig(config);
  },

  deleteSong(songId: string): void {
    const songs = this.getSongs().filter((s) => s.id !== songId);
    localStorage.setItem(KEYS.SONGS, JSON.stringify(songs));
    this.broadcast('SONGS_CHANGED');
  },

  // --- Daily Study Tasks (v4.1) ---
  getDailyTasks(): DailyTask[] {
    try {
      const raw = localStorage.getItem(KEYS.DAILY_TASKS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.DAILY_TASKS, JSON.stringify(INITIAL_DAILY_TASKS));
    return INITIAL_DAILY_TASKS;
  },

  saveDailyTasks(tasks: DailyTask[]): void {
    localStorage.setItem(KEYS.DAILY_TASKS, JSON.stringify(tasks));
    this.broadcast('DAILY_TASKS_CHANGED');
  },

  addDailyTask(task: DailyTask): void {
    const tasks = this.getDailyTasks();
    tasks.unshift(task);
    this.saveDailyTasks(tasks);
  },

  toggleDailyTask(taskId: string): boolean {
    const tasks = this.getDailyTasks();
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      target.completed = !target.completed;
      this.saveDailyTasks(tasks);
      return target.completed;
    }
    return false;
  },

  deleteDailyTask(taskId: string): void {
    const tasks = this.getDailyTasks().filter((t) => t.id !== taskId);
    this.saveDailyTasks(tasks);
  },

  // --- Study Streak Tracking (v5.0: Requires 5 Minutes = 300s in Workspace to Activate) ---
  getStreakInfo(): StudyStreakInfo {
    const today = new Date().toISOString().split('T')[0];
    try {
      const raw = localStorage.getItem(KEYS.STUDY_STREAK);
      if (raw) {
        const parsed: StudyStreakInfo = JSON.parse(raw);
        if (parsed.todayDate !== today) {
          parsed.todayDate = today;
          parsed.todayStudySeconds = 0;
          parsed.todayCompleted = parsed.lastStudyDate === today;
          localStorage.setItem(KEYS.STUDY_STREAK, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch {}
    // Default initial streak: yesterday was studied (3 days streak), today not yet completed (0/300s)
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const initial: StudyStreakInfo = {
      currentStreak: 3,
      lastStudyDate: yesterday,
      totalDaysStudied: 12,
      todayDate: today,
      todayStudySeconds: 0,
      todayCompleted: false,
    };
    localStorage.setItem(KEYS.STUDY_STREAK, JSON.stringify(initial));
    return initial;
  },

  recordStudyStreakDay(): void {
    // Legacy compatibility: ensures streak info is initialized, but does NOT bypass the 300s rule
    this.getStreakInfo();
  },

  incrementDailyStreakProgress(seconds: number): {
    activatedJustNow: boolean;
    streakInfo: StudyStreakInfo;
    remainingSeconds: number;
  } {
    const today = new Date().toISOString().split('T')[0];
    const info = this.getStreakInfo();
    if (info.todayDate !== today) {
      info.todayDate = today;
      info.todayStudySeconds = 0;
      info.todayCompleted = false;
    }

    info.todayStudySeconds = Math.max(0, (info.todayStudySeconds || 0) + seconds);
    let activatedJustNow = false;

    if (!info.todayCompleted && info.todayStudySeconds >= 300) {
      info.todayCompleted = true;
      if (info.lastStudyDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        if (info.lastStudyDate === yesterday) {
          info.currentStreak = (info.currentStreak || 0) + 1;
        } else {
          info.currentStreak = Math.max(1, (info.currentStreak || 0) + 1);
        }
        info.lastStudyDate = today;
        info.totalDaysStudied = (info.totalDaysStudied || 0) + 1;
      }
      activatedJustNow = true;
      // Reward +50 S-Coins for activating daily 5-minute streak!
      this.addCoins(50);
    }

    localStorage.setItem(KEYS.STUDY_STREAK, JSON.stringify(info));
    if (activatedJustNow || info.todayStudySeconds % 5 === 0) {
      this.broadcast('STREAK_CHANGED');
    }

    const remainingSeconds = info.todayCompleted ? 0 : Math.max(0, 300 - (info.todayStudySeconds || 0));
    return { activatedJustNow, streakInfo: info, remainingSeconds };
  },

  // --- S-Coin Ecosystem, Check-In, Shop & Timed Material Unlocks (v5.0) ---
  getCoins(): number {
    const user = this.getCurrentUser();
    if (user && typeof user.coins === 'number') {
      return Math.max(0, user.coins);
    }
    try {
      const raw = localStorage.getItem(KEYS.GUEST_COINS);
      if (raw !== null) {
        return Math.max(0, parseInt(raw, 10) || 0);
      }
    } catch {}
    // Default starter coins for new users so they can test unlocking or spinning right away
    localStorage.setItem(KEYS.GUEST_COINS, '150');
    if (user) {
      user.coins = 150;
      this.setCurrentUser(user);
    }
    return 150;
  },

  isDoubleCoinActive(): boolean {
    const user = this.getCurrentUser();
    const until = user?.doubleCoinUntil || Number(localStorage.getItem(KEYS.GUEST_DOUBLE_COIN_UNTIL) || 0);
    return until > Date.now();
  },

  addCoins(amount: number, applyMultiplier = true): number {
    const clean = Math.max(0, Math.floor(amount));
    const finalAmount = applyMultiplier && this.isDoubleCoinActive() ? clean * 2 : clean;
    const currentBalance = this.getCoins();
    const nextBalance = currentBalance + finalAmount;

    localStorage.setItem(KEYS.GUEST_COINS, String(nextBalance));
    const user = this.getCurrentUser();
    if (user) {
      user.coins = nextBalance;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      this.upsertUser(user);
    }
    this.broadcast('COINS_UPDATED');
    return nextBalance;
  },

  spendCoins(amount: number): { success: boolean; newBalance: number; message?: string } {
    const cost = Math.max(0, Math.floor(amount));
    const currentBalance = this.getCoins();
    if (currentBalance < cost) {
      return {
        success: false,
        newBalance: currentBalance,
        message: `Bạn cần ${cost} S-Coin (hiện có ${currentBalance} S-Coin). Hãy Điểm danh hoặc chơi Minigame để nhận thêm!`,
      };
    }
    const nextBalance = currentBalance - cost;
    localStorage.setItem(KEYS.GUEST_COINS, String(nextBalance));
    const user = this.getCurrentUser();
    if (user) {
      user.coins = nextBalance;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      this.upsertUser(user);
    }
    this.broadcast('COINS_UPDATED');
    return { success: true, newBalance: nextBalance };
  },

  getVipTickets(): number {
    const user = this.getCurrentUser();
    if (user && typeof user.vipTickets === 'number') {
      return Math.max(0, user.vipTickets);
    }
    const raw = localStorage.getItem(KEYS.GUEST_VIP_TICKETS);
    return raw ? Math.max(0, parseInt(raw, 10) || 0) : 1; // 1 starter VIP ticket
  },

  addVipTickets(count: number): number {
    const next = Math.max(0, this.getVipTickets() + count);
    localStorage.setItem(KEYS.GUEST_VIP_TICKETS, String(next));
    const user = this.getCurrentUser();
    if (user) {
      user.vipTickets = next;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      this.upsertUser(user);
    }
    this.broadcast('COINS_UPDATED');
    return next;
  },

  adminSetUserCoins(userId: string, newCoins: number): void {
    const clean = Math.max(0, Math.floor(newCoins));
    const users = this.getAllUsers();
    const target = users.find((u) => u.id === userId);
    if (target) {
      target.coins = clean;
      localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    }
    const current = this.getCurrentUser();
    if (current && current.id === userId) {
      current.coins = clean;
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(current));
      localStorage.setItem(KEYS.GUEST_COINS, String(clean));
    }
    this.broadcast('COINS_UPDATED');
    this.broadcast('LEADERBOARD_UPDATED');
  },

  adminGrantGlobalCoins(amount: number): void {
    const bonus = Math.max(1, Math.floor(amount));
    const users = this.getAllUsers().map((u) => ({
      ...u,
      coins: Math.max(0, (u.coins ?? 150) + bonus),
    }));
    localStorage.setItem(KEYS.ALL_USERS, JSON.stringify(users));
    const current = this.getCurrentUser();
    if (current) {
      current.coins = Math.max(0, (current.coins ?? this.getCoins()) + bonus);
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(current));
      localStorage.setItem(KEYS.GUEST_COINS, String(current.coins));
    } else {
      const nextGuest = this.getCoins() + bonus;
      localStorage.setItem(KEYS.GUEST_COINS, String(nextGuest));
    }
    this.broadcast('COINS_UPDATED');
    this.broadcast('LEADERBOARD_UPDATED');
  },

  // --- 7-Day Daily Check-In Calendar ---
  getCheckInState(): CheckInState {
    try {
      const raw = localStorage.getItem(KEYS.CHECKIN_STATE);
      if (raw) return JSON.parse(raw);
    } catch {}
    const initial: CheckInState = {
      lastCheckInDate: '',
      consecutiveDays: 0,
      claimedDays: [],
      totalCheckIns: 0,
    };
    localStorage.setItem(KEYS.CHECKIN_STATE, JSON.stringify(initial));
    return initial;
  },

  claimDailyCheckIn(): {
    success: boolean;
    rewardCoins: number;
    bonusTicket: boolean;
    dayNumber: number;
    message: string;
  } {
    const today = new Date().toISOString().split('T')[0];
    const state = this.getCheckInState();
    if (state.lastCheckInDate === today) {
      return {
        success: false,
        rewardCoins: 0,
        bonusTicket: false,
        dayNumber: state.consecutiveDays || 1,
        message: 'Bạn đã điểm danh nhận quà hôm nay rồi! Hãy quay lại vào ngày mai nhé.',
      };
    }

    const REWARDS = [20, 30, 50, 70, 100, 150, 200];
    const nextDay = ((state.consecutiveDays || 0) % 7) + 1;
    const rewardCoins = REWARDS[nextDay - 1] || 50;
    const bonusTicket = nextDay === 7;

    state.lastCheckInDate = today;
    state.consecutiveDays = nextDay;
    state.totalCheckIns = (state.totalCheckIns || 0) + 1;
    if (nextDay === 1) {
      state.claimedDays = [1];
    } else if (!state.claimedDays.includes(nextDay)) {
      state.claimedDays.push(nextDay);
    }

    localStorage.setItem(KEYS.CHECKIN_STATE, JSON.stringify(state));
    this.addCoins(rewardCoins, false);
    if (bonusTicket) {
      this.addVipTickets(1);
    }
    this.broadcast('CHECKIN_UPDATED');

    return {
      success: true,
      rewardCoins,
      bonusTicket,
      dayNumber: nextDay,
      message: bonusTicket
        ? `🎉 Điểm danh Ngày 7 thành công! Nhận +${rewardCoins} S-Coin & +1 Vé Mở Khóa VIP!`
        : `🎉 Điểm danh Ngày ${nextDay} thành công! Bạn nhận được +${rewardCoins} S-Coin!`,
    };
  },

  // --- Coin Prestige Shop & Admin Custom Shop Builder (v6.1) ---
  getShopItems(): ShopItem[] {
    try {
      const raw = localStorage.getItem(KEYS.SHOP_ITEMS);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.SHOP_ITEMS, JSON.stringify(INITIAL_SHOP_ITEMS));
    return INITIAL_SHOP_ITEMS;
  },

  saveShopItem(item: ShopItem): void {
    const items = this.getShopItems();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(KEYS.SHOP_ITEMS, JSON.stringify(items));
    this.broadcast('SHOP_UPDATED');
  },

  deleteShopItem(itemId: string): void {
    const items = this.getShopItems().filter((i) => i.id !== itemId);
    localStorage.setItem(KEYS.SHOP_ITEMS, JSON.stringify(items));
    this.broadcast('SHOP_UPDATED');
  },

  getUserCosmetics(): {
    unlockedTitles: string[];
    unlockedFrames: string[];
    equippedTitle: string;
    equippedFrame: string;
    equippedFrameImageUrl: string;
  } {
    const user = this.getCurrentUser();
    if (user) {
      return {
        unlockedTitles: user.unlockedTitles || [],
        unlockedFrames: user.unlockedFrames || [],
        equippedTitle: user.equippedTitle || '',
        equippedFrame: user.equippedFrame || '',
        equippedFrameImageUrl: user.equippedFrameImageUrl || '',
      };
    }
    try {
      return {
        unlockedTitles: JSON.parse(localStorage.getItem(KEYS.GUEST_UNLOCKED_TITLES) || '[]'),
        unlockedFrames: JSON.parse(localStorage.getItem(KEYS.GUEST_UNLOCKED_FRAMES) || '[]'),
        equippedTitle: localStorage.getItem(KEYS.GUEST_EQUIPPED_TITLE) || '',
        equippedFrame: localStorage.getItem(KEYS.GUEST_EQUIPPED_FRAME) || '',
        equippedFrameImageUrl: localStorage.getItem(KEYS.GUEST_EQUIPPED_FRAME_IMG) || '',
      };
    } catch {
      return {
        unlockedTitles: [],
        unlockedFrames: [],
        equippedTitle: '',
        equippedFrame: '',
        equippedFrameImageUrl: '',
      };
    }
  },

  purchaseShopItem(itemId: string): { success: boolean; message: string } {
    const items = this.getShopItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Vật phẩm không tồn tại!' };

    const cosmetics = this.getUserCosmetics();
    const frameKey = item.frameImageUrl || item.frameClass || item.id;
    if (item.type === 'title' && item.badgeText && cosmetics.unlockedTitles.includes(item.badgeText)) {
      this.equipCosmetic('title', item.badgeText);
      return { success: true, message: `Đã trang bị danh hiệu "${item.badgeText}"!` };
    }
    if (item.type === 'frame' && cosmetics.unlockedFrames.includes(frameKey)) {
      this.equipCosmetic('frame', item.frameClass || '', item.frameImageUrl || '');
      return { success: true, message: `Đã trang bị khung Avatar "${item.name}"!` };
    }

    const spend = this.spendCoins(item.priceCoins);
    if (!spend.success) {
      return { success: false, message: spend.message || 'Không đủ S-Coin!' };
    }

    const user = this.getCurrentUser();
    if (item.type === 'title' && item.badgeText) {
      const nextTitles = Array.from(new Set([...cosmetics.unlockedTitles, item.badgeText]));
      localStorage.setItem(KEYS.GUEST_UNLOCKED_TITLES, JSON.stringify(nextTitles));
      localStorage.setItem(KEYS.GUEST_EQUIPPED_TITLE, item.badgeText);
      if (user) {
        user.unlockedTitles = nextTitles;
        user.equippedTitle = item.badgeText;
        this.setCurrentUser(user);
      }
      this.broadcast('USER_AUTH_CHANGED');
      this.broadcast('LEADERBOARD_UPDATED');
      return { success: true, message: `🎉 Đổi thành công & đã đeo danh hiệu "${item.badgeText}"!` };
    }

    if (item.type === 'frame') {
      const nextFrames = Array.from(new Set([...cosmetics.unlockedFrames, frameKey]));
      localStorage.setItem(KEYS.GUEST_UNLOCKED_FRAMES, JSON.stringify(nextFrames));
      localStorage.setItem(KEYS.GUEST_EQUIPPED_FRAME, item.frameClass || '');
      localStorage.setItem(KEYS.GUEST_EQUIPPED_FRAME_IMG, item.frameImageUrl || '');
      if (user) {
        user.unlockedFrames = nextFrames;
        user.equippedFrame = item.frameClass || '';
        user.equippedFrameImageUrl = item.frameImageUrl || '';
        this.setCurrentUser(user);
      }
      this.broadcast('USER_AUTH_CHANGED');
      this.broadcast('LEADERBOARD_UPDATED');
      return { success: true, message: `🎉 Đổi thành công & đã trang bị "${item.name}"!` };
    }

    if (item.type === 'booster') {
      const until = Date.now() + 24 * 3600 * 1000;
      localStorage.setItem(KEYS.GUEST_DOUBLE_COIN_UNTIL, String(until));
      if (user) {
        user.doubleCoinUntil = until;
        this.setCurrentUser(user);
      }
      this.broadcast('COINS_UPDATED');
      return { success: true, message: '⚡ Đã kích hoạt Thẻ x2 S-Coin trong suốt 24 giờ tới!' };
    }

    if (item.type === 'ticket') {
      this.addVipTickets(1);
      return { success: true, message: '🎟️ Đã nhận +1 Vé Mở Khóa Tài Liệu VIP!' };
    }

    return { success: true, message: 'Đổi thưởng thành công!' };
  },

  equipCosmetic(type: 'title' | 'frame', value: string, frameImageUrl?: string): void {
    const user = this.getCurrentUser();
    if (type === 'title') {
      localStorage.setItem(KEYS.GUEST_EQUIPPED_TITLE, value);
      if (user) {
        user.equippedTitle = value;
        this.setCurrentUser(user);
      }
    } else {
      localStorage.setItem(KEYS.GUEST_EQUIPPED_FRAME, value);
      localStorage.setItem(KEYS.GUEST_EQUIPPED_FRAME_IMG, frameImageUrl || '');
      if (user) {
        user.equippedFrame = value;
        user.equippedFrameImageUrl = frameImageUrl || '';
        this.setCurrentUser(user);
      }
    }
    this.broadcast('USER_AUTH_CHANGED');
    this.broadcast('LEADERBOARD_UPDATED');
  },

  // --- User Personalization: Blink-Blink & Section Backgrounds per User (v6.1) ---
  getEffectiveBlinkConfig(): BlinkBlinkConfig {
    const userId = this.getCurrentUser()?.id || 'guest';
    try {
      const raw = localStorage.getItem(`studyhub_user_blink_${userId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return this.getBlinkBlinkConfig();
  },

  saveUserBlinkConfig(cfg: BlinkBlinkConfig): void {
    const userId = this.getCurrentUser()?.id || 'guest';
    localStorage.setItem(`studyhub_user_blink_${userId}`, JSON.stringify(cfg));
    this.broadcast('BLINK_BLINK_CHANGED');
  },

  resetUserBlinkConfig(): void {
    const userId = this.getCurrentUser()?.id || 'guest';
    localStorage.removeItem(`studyhub_user_blink_${userId}`);
    this.broadcast('BLINK_BLINK_CHANGED');
  },

  getEffectiveBackgrounds(): Record<string, BackgroundConfig> {
    const adminBgs = this.getBackgrounds();
    const userId = this.getCurrentUser()?.id || 'guest';
    try {
      const raw = localStorage.getItem(`studyhub_user_bg_${userId}`);
      if (raw) {
        const userOverrides = JSON.parse(raw);
        return { ...adminBgs, ...userOverrides };
      }
    } catch {}
    return adminBgs;
  },

  saveUserSectionBackground(sectionId: string, cfg: BackgroundConfig): void {
    const userId = this.getCurrentUser()?.id || 'guest';
    let current: Record<string, BackgroundConfig> = {};
    try {
      const raw = localStorage.getItem(`studyhub_user_bg_${userId}`);
      if (raw) current = JSON.parse(raw);
    } catch {}
    current[sectionId] = cfg;
    localStorage.setItem(`studyhub_user_bg_${userId}`, JSON.stringify(current));
    this.broadcast('BACKGROUND_CHANGED');
  },

  resetUserBackgrounds(): void {
    const userId = this.getCurrentUser()?.id || 'guest';
    localStorage.removeItem(`studyhub_user_bg_${userId}`);
    this.broadcast('BACKGROUND_CHANGED');
  },

  // --- Account-Isolated Private Mistake Notebook & Bookmarks (v6.1) ---
  getMistakes(userId?: string): MistakeItem[] {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(`studyhub_mistakes_${userId}`);
      if (raw !== null) {
        const list: MistakeItem[] = JSON.parse(raw);
        return list.filter((m) => m.ownerId === userId);
      }
    } catch {}
    return [];
  },

  saveMistake(userId: string, item: MistakeItem): void {
    if (!userId) return;
    const list = this.getMistakes(userId);
    const cleanItem: MistakeItem = { ...item, ownerId: userId };
    const idx = list.findIndex((m) => m.id === cleanItem.id);
    if (idx >= 0) {
      list[idx] = cleanItem;
    } else {
      list.unshift(cleanItem);
    }
    localStorage.setItem(`studyhub_mistakes_${userId}`, JSON.stringify(list));
    this.broadcast('MISTAKES_CHANGED');
  },

  deleteMistake(userId: string, mistakeId: string): void {
    if (!userId) return;
    const list = this.getMistakes(userId).filter((m) => m.id !== mistakeId);
    localStorage.setItem(`studyhub_mistakes_${userId}`, JSON.stringify(list));
    this.broadcast('MISTAKES_CHANGED');
  },

  toggleMistakeStatus(userId: string, mistakeId: string): void {
    if (!userId) return;
    const list = this.getMistakes(userId);
    const target = list.find((m) => m.id === mistakeId);
    if (target) {
      target.status = target.status === 'mastered' ? 'need_review' : 'mastered';
      localStorage.setItem(`studyhub_mistakes_${userId}`, JSON.stringify(list));
      this.broadcast('MISTAKES_CHANGED');
    }
  },

  getBookmarks(userId?: string): BookmarkRecord[] {
    if (!userId) return [];
    try {
      const raw = localStorage.getItem(`studyhub_bookmarks_${userId}`);
      if (raw !== null) {
        const list: BookmarkRecord[] = JSON.parse(raw);
        return list.filter((b) => b.ownerId === userId);
      }
    } catch {}
    return [];
  },

  isBookmarked(userId: string | undefined, materialId: string): boolean {
    if (!userId) return false;
    return this.getBookmarks(userId).some((b) => b.materialId === materialId);
  },

  toggleBookmark(
    userId: string,
    record: Omit<BookmarkRecord, 'id' | 'ownerId' | 'savedAt'>
  ): { added: boolean } {
    const list = this.getBookmarks(userId);
    const existingIdx = list.findIndex((b) => b.materialId === record.materialId);
    if (existingIdx >= 0) {
      const updated = list.filter((b) => b.materialId !== record.materialId);
      localStorage.setItem(`studyhub_bookmarks_${userId}`, JSON.stringify(updated));
      this.broadcast('BOOKMARKS_CHANGED');
      return { added: false };
    } else {
      const newRec: BookmarkRecord = {
        ...record,
        id: `bm-${Date.now()}`,
        ownerId: userId,
        savedAt: Date.now(),
      };
      list.unshift(newRec);
      localStorage.setItem(`studyhub_bookmarks_${userId}`, JSON.stringify(list));
      this.broadcast('BOOKMARKS_CHANGED');
      return { added: true };
    }
  },

  removeBookmark(userId: string, materialId: string): void {
    if (!userId) return;
    const updated = this.getBookmarks(userId).filter((b) => b.materialId !== materialId);
    localStorage.setItem(`studyhub_bookmarks_${userId}`, JSON.stringify(updated));
    this.broadcast('BOOKMARKS_CHANGED');
  },

  // --- University Admission Score Formula Builder & Calculator (v6.1 / 3-Tier Cascade) ---
  getUniversityFormulas(): UniversityFormulaProfile[] {
    try {
      const raw = localStorage.getItem(KEYS.UNIVERSITY_FORMULAS);
      if (raw !== null) {
        const parsed: UniversityFormulaProfile[] = JSON.parse(raw);
        let mutated = false;
        const normalized = parsed.map((prof) => {
          if (prof.majors && prof.majors.length > 0) {
            return prof;
          }
          mutated = true;
          const preset = INITIAL_UNIVERSITY_FORMULAS.find((i) => i.id === prof.id);
          if (preset && preset.majors && preset.majors.length > 0) {
            return {
              ...prof,
              universityTag: preset.universityTag,
              majors: preset.majors,
            };
          }
          return {
            ...prof,
            majors: [
              {
                id: `maj-${prof.id}-1`,
                name: 'Ngành Đào Tạo Tiêu Biểu (Chương trình Chuẩn)',
                code: prof.universityCode || '001',
                methods: [
                  {
                    id: `met-${prof.id}-1`,
                    name: 'Phương thức Xét tuyển Tổng hợp / Điểm thi 2026',
                    benchmarkScore: prof.benchmarkScore,
                    scaleMax: prof.scaleMax,
                    formulaExpression: prof.formulaExpression,
                    variables: prof.variables,
                    note: prof.note,
                  },
                ],
              },
            ],
          };
        });
        if (mutated) {
          localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch {}
    localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(INITIAL_UNIVERSITY_FORMULAS));
    return INITIAL_UNIVERSITY_FORMULAS;
  },

  saveUniversityFormula(profile: UniversityFormulaProfile): void {
    const list = this.getUniversityFormulas();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = profile;
    } else {
      list.unshift(profile);
    }
    localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(list));
    this.broadcast('UNIVERSITY_FORMULAS_CHANGED');
  },

  saveAllUniversityFormulas(list: UniversityFormulaProfile[]): void {
    localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(list));
    this.broadcast('UNIVERSITY_FORMULAS_CHANGED');
  },

  resetUniversityFormulasToDefault(): UniversityFormulaProfile[] {
    localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(INITIAL_UNIVERSITY_FORMULAS));
    localStorage.setItem(KEYS.UNIVERSITY_DISCLAIMER_NOTE, DEFAULT_UNIVERSITY_DISCLAIMER_NOTE);
    this.broadcast('UNIVERSITY_FORMULAS_CHANGED');
    return INITIAL_UNIVERSITY_FORMULAS;
  },

  deleteUniversityFormula(id: string): void {
    const list = this.getUniversityFormulas().filter((p) => p.id !== id);
    localStorage.setItem(KEYS.UNIVERSITY_FORMULAS, JSON.stringify(list));
    this.broadcast('UNIVERSITY_FORMULAS_CHANGED');
  },

  getUniversityDisclaimerNote(): string {
    try {
      const raw = localStorage.getItem(KEYS.UNIVERSITY_DISCLAIMER_NOTE);
      if (raw !== null && raw.trim().length > 0) return raw;
    } catch {}
    return DEFAULT_UNIVERSITY_DISCLAIMER_NOTE;
  },

  saveUniversityDisclaimerNote(note: string): void {
    const clean = note.trim() || DEFAULT_UNIVERSITY_DISCLAIMER_NOTE;
    localStorage.setItem(KEYS.UNIVERSITY_DISCLAIMER_NOTE, clean);
    this.broadcast('UNIVERSITY_FORMULAS_CHANGED');
  },

  evaluateUniversityFormula(
    expression: string,
    values: Record<string, number>
  ): { valid: boolean; score: number; error?: string } {
    try {
      let expr = expression.toUpperCase();
      // Sort keys by length descending so MON1 doesn't partially replace inside longer names
      const sortedKeys = Object.keys(values).sort((a, b) => b.length - a.length);
      for (const k of sortedKeys) {
        const val = Number.isFinite(values[k]) ? values[k] : 0;
        const regex = new RegExp(`\\b${k.toUpperCase()}\\b`, 'g');
        expr = expr.replace(regex, `(${val})`);
      }
      // Replace any remaining uppercase variable tokens with 0
      expr = expr.replace(/\b[A-Z_][A-Z0-9_]*\b/g, '0');
      // Only allow numbers, operators, parentheses, decimal points, and spaces
      if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        return { valid: false, score: 0, error: 'Biểu thức chứa ký tự không hợp lệ' };
      }
      // Evaluate safely
      const fn = new Function(`return (${expr});`);
      const rawScore = Number(fn());
      if (!Number.isFinite(rawScore)) {
        return { valid: false, score: 0, error: 'Phép tính chia cho 0 hoặc vô định' };
      }
      return { valid: true, score: Math.round(rawScore * 100) / 100 };
    } catch {
      return { valid: false, score: 0, error: 'Lỗi cú pháp công thức toán học' };
    }
  },

  // --- Material & File Coin Lock + Timed Access Expiration (v5.0) ---
  getMaterialUnlocks(): Record<string, MaterialUnlockRecord> {
    try {
      const raw = localStorage.getItem(KEYS.MATERIAL_UNLOCKS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {};
  },

  getMaterialUnlockStatus(
    itemId: string,
    priceCoins?: number
  ): {
    isFree: boolean;
    isUnlocked: boolean;
    isExpired: boolean;
    expiresAt: number | null;
    remainingMs: number | null;
  } {
    const cost = priceCoins || 0;
    if (cost <= 0) {
      return { isFree: true, isUnlocked: true, isExpired: false, expiresAt: null, remainingMs: null };
    }
    // Admin / Co-Admin always bypass locks
    if (this.isUserAdmin()) {
      return { isFree: false, isUnlocked: true, isExpired: false, expiresAt: null, remainingMs: null };
    }
    const unlocks = this.getMaterialUnlocks();
    const record = unlocks[itemId];
    if (!record) {
      return { isFree: false, isUnlocked: false, isExpired: false, expiresAt: null, remainingMs: null };
    }
    if (record.expiresAt === null) {
      return { isFree: false, isUnlocked: true, isExpired: false, expiresAt: null, remainingMs: null };
    }
    const now = Date.now();
    if (now >= record.expiresAt) {
      return { isFree: false, isUnlocked: false, isExpired: true, expiresAt: record.expiresAt, remainingMs: 0 };
    }
    return {
      isFree: false,
      isUnlocked: true,
      isExpired: false,
      expiresAt: record.expiresAt,
      remainingMs: record.expiresAt - now,
    };
  },

  unlockMaterialWithCoins(
    itemId: string,
    priceCoins: number,
    accessDurationHours?: number,
    useVipTicket = false
  ): { success: boolean; message: string } {
    if (useVipTicket) {
      const tickets = this.getVipTickets();
      if (tickets <= 0) {
        return { success: false, message: 'Bạn không còn Vé Mở Khóa VIP nào!' };
      }
      this.addVipTickets(-1);
    } else {
      const spend = this.spendCoins(priceCoins);
      if (!spend.success) {
        return { success: false, message: spend.message || 'Không đủ S-Coin!' };
      }
    }

    const now = Date.now();
    const hours = accessDurationHours && accessDurationHours > 0 ? accessDurationHours : 0;
    const expiresAt = hours > 0 ? now + hours * 3600 * 1000 : null;

    const unlocks = this.getMaterialUnlocks();
    unlocks[itemId] = {
      itemId,
      unlockedAt: now,
      expiresAt,
    };
    localStorage.setItem(KEYS.MATERIAL_UNLOCKS, JSON.stringify(unlocks));
    this.broadcast('MATERIAL_UNLOCKS_CHANGED');

    const durationText = hours > 0 ? `trong ${hours} giờ` : 'Vĩnh viễn';
    return {
      success: true,
      message: `🔓 Mở khóa tài liệu thành công (${durationText})!`,
    };
  },

  formatRemainingUnlockTime(remainingMs: number | null): string {
    if (remainingMs === null) return '♾️ Vĩnh viễn';
    if (remainingMs <= 0) return 'Đã hết hạn';
    const totalMinutes = Math.ceil(remainingMs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const mins = totalMinutes % 60;
    if (days > 0) return `Còn ${days} ngày ${hours}g`;
    if (hours > 0) return `Còn ${hours}g ${mins}p`;
    return `Còn ${mins} phút`;
  },

  // --- 3D Flashcards (v4.1) ---
  getFlashcards(): Flashcard[] {
    try {
      const raw = localStorage.getItem(KEYS.FLASHCARDS);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(INITIAL_FLASHCARDS));
    return INITIAL_FLASHCARDS;
  },

  saveFlashcard(card: Flashcard): void {
    const cards = this.getFlashcards();
    const idx = cards.findIndex((c) => c.id === card.id);
    if (idx >= 0) {
      cards[idx] = card;
    } else {
      cards.unshift(card);
    }
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
    this.broadcast('FLASHCARDS_CHANGED');
  },

  deleteFlashcard(cardId: string): void {
    const cards = this.getFlashcards().filter((c) => c.id !== cardId);
    localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
    this.broadcast('FLASHCARDS_CHANGED');
  },

  toggleMasterFlashcard(cardId: string): void {
    const cards = this.getFlashcards();
    const target = cards.find((c) => c.id === cardId);
    if (target) {
      target.mastered = !target.mastered;
      localStorage.setItem(KEYS.FLASHCARDS, JSON.stringify(cards));
      this.broadcast('FLASHCARDS_CHANGED');
    }
  },

  // --- Split Screen Exam OMR Submissions (v4.1) ---
  getExamSubmissions(): ExamOMRSubmission[] {
    try {
      const raw = localStorage.getItem(KEYS.EXAM_SUBMISSIONS);
      if (raw !== null) return JSON.parse(raw);
    } catch {}
    return [];
  },

  saveExamSubmission(sub: ExamOMRSubmission): void {
    const list = this.getExamSubmissions();
    list.unshift(sub);
    localStorage.setItem(KEYS.EXAM_SUBMISSIONS, JSON.stringify(list));
    this.broadcast('EXAM_SUBMISSIONS_CHANGED');
  },

  // --- Same-Tab + Cross-Tab Instant Broadcast (v5.0 Critical Fix) ---
  broadcast(event: string): void {
    const payload = { type: event, timestamp: Date.now() };
    if (typeof window !== 'undefined') {
      queueMicrotask(() => {
        try {
          window.dispatchEvent(new CustomEvent('studyhub_local_sync', { detail: payload }));
        } catch {
          // ignore
        }
      });
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch {
        // ignore
      }
    }
  },

  subscribe(callback: (type: string) => void): () => void {
    const localHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ type?: string }>;
      if (customEvent.detail?.type) {
        callback(customEvent.detail.type);
      }
    };
    const channelHandler = (e: MessageEvent) => {
      if (e.data?.type) {
        callback(e.data.type);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('studyhub_local_sync', localHandler);
    }
    if (broadcastChannel) {
      broadcastChannel.addEventListener('message', channelHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('studyhub_local_sync', localHandler);
      }
      broadcastChannel?.removeEventListener('message', channelHandler);
    };
  },
};
