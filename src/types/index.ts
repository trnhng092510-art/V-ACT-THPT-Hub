export type Role = 'user' | 'admin' | 'co_admin';

export interface User {
  id: string; // e.g. UID-88392
  email: string;
  displayName: string;
  avatar: string;
  bio: string;
  totalStudySeconds: number;
  isOnline: boolean;
  lastActive: number;
  role: Role;
  createdAt: number;
  // v5.0 & v6.1 S-Coin & Prestige Shop fields
  coins?: number;
  equippedTitle?: string;
  equippedFrame?: string;
  equippedFrameImageUrl?: string;
  unlockedTitles?: string[];
  unlockedFrames?: string[];
  doubleCoinUntil?: number;
  vipTickets?: number;
}

export type BackgroundType = 'solid' | 'gradient' | 'image' | 'gif';

export interface BackgroundConfig {
  sectionId: 'cover' | 'navbar' | 'dashboard' | 'thptqg' | 'vact' | 'leaderboard' | 'music' | 'footer' | 'forum';
  type: BackgroundType;
  value: string;
  overlayOpacity?: number;
  blur?: number;
}

export interface AdminCustomButton {
  id: string;
  label: string;
  icon: string;
  color: string;
  type: 'url' | 'modal';
  url?: string;
  modalTitle?: string;
  modalContent?: string;
  modalImage?: string;
  shape?: 'square' | 'rounded' | 'pill';
  scale?: number;
  hasGlow?: boolean;
}

export interface LoadingConfig {
  gifUrl: string;
  durationMs: number;
  quoteText: string;
  progressColor?: string;
}

export interface DashboardWidget {
  id: string;
  type: 'countdown' | 'note' | 'announcement' | 'banner' | 'stats' | 'teacher_shortcut' | 'wish_note' | 'custom' | 'hall_of_fame';
  title: string;
  content?: string;
  targetDate?: string;
  color?: string;
  icon?: string;
  gridSpan?: 'full' | 'half' | 'third';
  order?: number;
  actionUrl?: string;
  badge?: string;
  imageUrl?: string;
  customBg?: string;
  borderRadius?: number;
  fontSize?: number;
}

export type MaterialType = 'pdf' | 'doc' | 'video' | 'quiz' | 'drive' | 'image' | 'audio';

export interface StudyMaterial {
  id: string;
  title: string;
  subjectId: string;
  subCategory: string;
  type: MaterialType;
  url: string;
  size?: string;
  date: string;
  views: number;
  author?: string;
  notes?: string;
  isFeatured?: boolean;
  // v5.0 Coin Lock & Timed Expiration
  priceCoins?: number; // 0 = Free, >0 = Requires S-Coin
  accessDurationHours?: number; // 0 or undefined = Permanent, >0 = Expires after X hours
  // v6.1 User Contribution & Pending Approval Queue
  approvalStatus?: 'approved' | 'pending';
  submittedBy?: string;
  submittedById?: string;
}

export interface StudySubCategory {
  id: string;
  name: string;
  icon: string;
}

export interface StudySubject {
  id: string;
  name: string;
  code: string;
  icon: string;
  color: string;
  description: string;
  subCategories: StudySubCategory[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl: string;
  coverUrl: string;
  duration: number;
  contributedBy?: string;
  coverGradient?: string;
}

export interface FirebaseConfigState {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  isConfigured: boolean;
}

export interface SiteStats {
  totalViews: number;
  onlineCount: number;
}

// --- VERSION 2.0 ADVANCED TYPES ---

export type ParticleType = 'sparkle' | 'star' | 'sakura' | 'snow' | 'lightbulb' | 'custom';

export interface BlinkBlinkConfig {
  enabled: boolean;
  type: ParticleType;
  customIconUrl?: string;
  count: number; // 10 to 60
  size: number; // 10 to 40 px
  speed: number; // 1 to 5 (animation duration multiplier)
  glowColor: string; // hex color or rgba
}

export interface LandingCoverConfig {
  title: string;
  subtitle: string;
  slogan: string;
  titleColor: string;
  subtitleColor: string;
  titleFontSize: number; // 36 to 84 px
  primaryBtnText: string;
  primaryBtnShape: 'square' | 'rounded' | 'pill';
  primaryBtnScale: number; // 0.8 to 1.5
  primaryBtnBg: string;
  primaryBtnGlow: boolean;
}

export interface MicroUIConfig {
  borderRadius: number; // 0 to 50 px
  borderWidth: number; // 0 to 4 px
  cardBgColor: string;
  titleColor: string;
  descColor: string;
  paddingScale: number; // 0.8 to 1.4
  blurAmount: number; // 0 to 30 px
}

export interface StickerItem {
  id: string;
  name: string;
  url: string;
  isApproved: boolean;
}

export interface StickerPack {
  id: string;
  name: string;
  icon: string;
  isApproved: boolean;
  stickers: StickerItem[];
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTitle?: string;
  content: string;
  imageUrl?: string;
  stickerUrl?: string;
  createdAt: number;
  isPinnedSolution?: boolean;
}

export type ForumLayoutType = 'feed' | 'grid' | 'kanban' | 'compact';

export interface ForumPostReactions {
  heart: number;
  fire: number;
  bulb: number;
  clap: number;
  userReactions?: Record<string, string[]>; // userId -> ['heart', 'fire']
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorTitle?: string;
  subject: string;
  title: string;
  content: string;
  images: string[];
  createdAt: number;
  commentsCount: number;
  isPinned?: boolean;
  status: 'open' | 'resolved';
  reactions?: ForumPostReactions;
}

export interface FooterConfig {
  brandName: string;
  tagline: string;
  copyrightText: string;
  contactEmail: string;
  contactHotline: string;
}

export interface ExamCountdownConfig {
  thptqgTitle: string;
  thptqgDate: string; // YYYY-MM-DDTHH:mm
  thptqgDesc: string;
  vactTitle: string;
  vactDate: string; // YYYY-MM-DDTHH:mm
  vactDesc: string;
}

// --- VERSION 3.0 TEACHER & MULTI-LEVEL EXPLORER TYPES ---

export interface Teacher {
  id: string;
  subjectId: string; // e.g. 'van', 'toan', 'anh', 'ly', 'hoa', 'sinh', 'vact-part1', etc.
  name: string;
  title: string;
  avatar: string;
  color: string;
  badge: string;
  description: string;
  totalMaterials: number;
  quote?: string;
}

export interface StudyFolder {
  id: string;
  parentId?: string; // undefined if root folder
  teacherId?: string; // specific teacher or generic
  subjectId: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface StudyFileItem {
  id: string;
  folderId?: string; // inside a folder or root of teacher/subject
  teacherId?: string;
  subjectId: string;
  title: string;
  type: MaterialType | 'link';
  fileUrl: string; // url or data:
  size?: string;
  date: string;
  notes?: string;
  views?: number;
  // v5.0 Coin Lock & Timed Expiration
  priceCoins?: number; // 0 = Free, >0 = Requires S-Coin
  accessDurationHours?: number; // 0 or undefined = Permanent, >0 = Expires after X hours
  // v6.1 User Contribution & Pending Approval Queue
  approvalStatus?: 'approved' | 'pending';
  submittedBy?: string;
  submittedById?: string;
}

// --- VERSION 3.0 VIBRANT WISH NOTE TYPE ---

export interface WishNote {
  id: string;
  authorName?: string;
  author?: string;
  authorAvatar?: string;
  targetSchool?: string;
  targetUniversity?: string;
  targetScore?: string;
  content?: string;
  goal?: string;
  color: 'yellow' | 'pink' | 'emerald' | 'purple' | 'amber' | 'cyan';
  likesCount?: number;
  likes?: number;
  likedBy?: string[];
  createdAt: number | string;
}

// --- VERSION 4.1 ADVANCED TYPES ---

export interface StatsConfig {
  isVisible: boolean;
  totalViews: number;
}

export interface NavbarItem {
  id: string;
  label: string;
  icon: string; // 'GraduationCap' | 'Target' | 'Compass' | 'MessageSquare' | 'Sparkles' | 'BookOpen' | 'Flame' | 'Trophy' | etc.
  type: 'tab' | 'custom_view' | 'external_link';
  targetTab?: string; // 'dashboard' | 'thptqg' | 'vact' | 'forum' | string
  externalUrl?: string;
  customContent?: string;
  activeColor?: string; // Tailwind class or hex/gradient
  textColor?: string;
  fontSize?: number;
  isVisible: boolean;
  order: number;
}

export interface NavbarConfig {
  brandName: string;
  brandYear: string;
  brandSlogan: string;
  logoIcon: string;
  items: NavbarItem[];
}

export interface DailyTask {
  id: string;
  title: string;
  subject: string;
  color: string;
  completed: boolean;
  createdAt: number;
}

export interface StudyStreakInfo {
  currentStreak: number;
  lastStudyDate: string; // YYYY-MM-DD when streak was last activated (after 5 mins)
  totalDaysStudied: number;
  todayDate?: string; // YYYY-MM-DD for tracking today's 300s progress
  todayStudySeconds?: number; // 0..300+ seconds accumulated today in workspace
  todayCompleted?: boolean; // true once todayStudySeconds >= 300
}

export interface Flashcard {
  id: string;
  subject: string;
  topic: string;
  question: string;
  answer: string;
  tip?: string;
  gradient: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered?: boolean;
  contributedBy?: string;
}

export interface ExamOMRSubmission {
  id: string;
  examTitle: string;
  mode: 'thptqg' | 'vact';
  subject?: string;
  totalQuestions: number;
  score: number;
  maxScore: number;
  answers: Record<number, string>;
  part2Answers?: Record<number, Record<'a' | 'b' | 'c' | 'd', 'true' | 'false' | null>>;
  part3Answers?: Record<number, string>;
  timeSpentSeconds: number;
  submittedAt: number;
}

// --- VERSION 5.0 S-COIN, ARCADE, CHECK-IN, PRESTIGE SHOP & TIMED MATERIAL UNLOCK TYPES ---

export interface MaterialUnlockRecord {
  itemId: string;
  unlockedAt: number;
  expiresAt: number | null; // null = permanent
}

export interface CheckInState {
  lastCheckInDate: string; // YYYY-MM-DD
  consecutiveDays: number; // 0..7
  claimedDays: number[]; // [1, 2, ...]
  totalCheckIns: number;
}

export interface ShopItem {
  id: string;
  name: string;
  type: 'title' | 'frame' | 'booster' | 'ticket';
  priceCoins: number;
  description: string;
  badgeText?: string;
  badgeGradient?: string;
  frameClass?: string;
  frameImageUrl?: string; // v6.1 transparent PNG/GIF avatar frame overlay
  icon: string;
}

// --- VERSION 6.1 PRIVATE MISTAKE NOTEBOOK, BOOKMARKS & UNIVERSITY FORMULA PROFILES ---

export interface MistakeItem {
  id: string;
  ownerId: string; // Strictly bound to user.id
  subject: string;
  questionTitle: string;
  imageUrl?: string;
  mistakeReason: string;
  correctSolution: string;
  status: 'need_review' | 'mastered';
  createdAt: number;
}

export interface BookmarkRecord {
  id: string;
  ownerId: string; // Strictly bound to user.id
  materialId: string;
  title: string;
  subjectId: string;
  url: string;
  type: string;
  savedAt: number;
}

export interface FormulaVariable {
  key: string; // e.g. 'TOAN', 'LY', 'HOA', 'ANH', 'VACT', 'HOCBA', 'UUTIEN', 'CONG'
  label: string;
  max: number;
  defaultVal: number;
}

export interface UniversityAdmissionMethod {
  id: string;
  name: string; // Tag phương thức xét tuyển
  benchmarkScore: number; // Điểm chuẩn tương ứng với Ngành & Phương thức này
  scaleMax: number; // 30 | 40 | 100 | 1200
  formulaExpression: string;
  variables: FormulaVariable[];
  note?: string;
}

export interface UniversityMajor {
  id: string;
  name: string; // Tag ngành đào tạo của trường
  code?: string; // Mã ngành
  methods: UniversityAdmissionMethod[];
}

export interface UniversityFormulaProfile {
  id: string;
  universityTag: string;
  universityCode: string;
  color: string;
  variables: FormulaVariable[];
  formulaExpression: string; // e.g. "(TOAN * 2 + LY + HOA) * 0.75 + UUTIEN"
  scaleMax: number; // 30 | 40 | 100 | 1200
  benchmarkScore: number;
  note: string;
  majors?: UniversityMajor[];
}



