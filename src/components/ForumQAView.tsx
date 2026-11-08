import React, { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  Smile,
  Sticker,
  Send,
  Filter,
  X,
  Sparkles,
  Award,
  Maximize2,
  LayoutList,
  LayoutGrid,
  Columns3,
  List,
  Heart,
  Flame,
  Lightbulb,
  ThumbsUp,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  ForumPost,
  ForumComment,
  User,
  BackgroundConfig,
  StickerItem,
  ForumLayoutType,
} from '../types';
import { StorageService } from '../services/storage';

interface Props {
  user: User | null;
  isAdmin: boolean;
  onOpenAuth: () => void;
  bgConfig: BackgroundConfig;
  theme?: 'dark' | 'light';
}

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '💡', '💯', '✨', '👏', '🎯', '📚', '🤔', '🙌', '🎉'];

const FORUM_SUBJECTS = [
  'Tất cả',
  'Toán học',
  'Ngữ văn',
  'Tiếng Anh',
  'Vật lý',
  'Hóa học',
  'Sinh học',
  'V-ACT Logic',
  'V-ACT Ngôn ngữ',
  'V-ACT Tổng hợp',
];

const SUBJECT_COLORS: Record<string, string> = {
  'Toán học': 'from-indigo-500 to-purple-600',
  'Ngữ văn': 'from-rose-500 to-pink-600',
  'Tiếng Anh': 'from-cyan-500 to-teal-600',
  'Vật lý': 'from-blue-600 to-indigo-600',
  'Hóa học': 'from-amber-500 to-orange-600',
  'Sinh học': 'from-emerald-500 to-teal-600',
  'V-ACT Logic': 'from-purple-600 to-pink-600',
  'V-ACT Ngôn ngữ': 'from-sky-500 to-blue-600',
  'V-ACT Tổng hợp': 'from-violet-600 to-cyan-500',
};

export const ForumQAView: React.FC<Props> = ({
  user,
  isAdmin,
  onOpenAuth,
  bgConfig,
  theme = 'dark',
}) => {
  const [posts, setPosts] = useState<ForumPost[]>(() => StorageService.getForumPosts());
  const [comments, setComments] = useState<ForumComment[]>(() => StorageService.getForumComments());
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<ForumLayoutType>(() => StorageService.getForumLayout());

  // Inline Accordion state: which post is expanded right within its card
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Pop-up Modal state: when user prefers viewing post in a center modal
  const [modalPost, setModalPost] = useState<ForumPost | null>(null);

  // New Question Form Modal
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newSubject, setNewSubject] = useState('Toán học');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState('');

  // Comment Form state
  const [commentText, setCommentText] = useState('');
  const [commentImage, setCommentImage] = useState('');
  const [commentSticker, setCommentSticker] = useState('');
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Lightbox Modal for zooming images
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Copied link toast
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const approvedStickerPacks = StorageService.getApprovedStickers();

  const handleRefresh = () => {
    setPosts(StorageService.getForumPosts());
    setComments(StorageService.getForumComments());
  };

  const handleLayoutChange = (newLayout: ForumLayoutType) => {
    setLayout(newLayout);
    StorageService.setForumLayout(newLayout);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!newTitle.trim() || !newContent.trim()) return;

    const cosmetics = StorageService.getUserCosmetics();
    const post: ForumPost = {
      id: `post-${Date.now()}`,
      authorId: user.id,
      authorName: user.displayName,
      authorAvatar: user.avatar,
      authorTitle: user.equippedTitle || cosmetics.equippedTitle || undefined,
      subject: newSubject,
      title: newTitle.trim(),
      content: newContent.trim(),
      images: newImages,
      createdAt: Date.now(),
      commentsCount: 0,
      isPinned: false,
      status: 'open',
      reactions: {
        heart: 1,
        fire: 0,
        bulb: 0,
        clap: 0,
        userReactions: { [user.id]: ['heart'] },
      },
    };

    StorageService.saveForumPost(post);
    StorageService.addCoins(10); // Reward +10 S-Coin for asking a question
    handleRefresh();
    setShowNewPostModal(false);
    setNewTitle('');
    setNewContent('');
    setNewImages([]);
    setExpandedPostId(post.id);
  };

  const handleSendComment = (e: React.FormEvent, targetPostId: string) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!commentText.trim() && !commentImage && !commentSticker) return;

    const cosmetics = StorageService.getUserCosmetics();
    const comment: ForumComment = {
      id: `cmt-${Date.now()}`,
      postId: targetPostId,
      authorId: user.id,
      authorName: user.displayName,
      authorAvatar: user.avatar,
      authorTitle: user.equippedTitle || cosmetics.equippedTitle || undefined,
      content: commentText.trim(),
      imageUrl: commentImage || undefined,
      stickerUrl: commentSticker || undefined,
      createdAt: Date.now(),
      isPinnedSolution: false,
    };

    StorageService.saveForumComment(comment);
    StorageService.addCoins(15); // Reward +15 S-Coin for contributing a solution
    handleRefresh();
    setCommentText('');
    setCommentImage('');
    setCommentSticker('');
    setShowStickerPicker(false);
    setShowEmojiPicker(false);
  };

  const handleReaction = (postId: string, reactionType: 'heart' | 'fire' | 'bulb' | 'clap') => {
    const userId = user ? user.id : 'guest-session';
    StorageService.toggleForumReaction(postId, userId, reactionType);
    handleRefresh();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'post' | 'comment') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (target === 'post') {
        setNewImages((prev) => [...prev, result]);
      } else {
        setCommentImage(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = (postId: string) => {
    const url = `${window.location.origin}?tab=forum&post=${postId}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    if (selectedSubject !== 'Tất cả' && p.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q)
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

  // Render a comment item
  const renderCommentItem = (cmt: ForumComment) => (
    <div
      key={cmt.id}
      className={`p-3.5 rounded-xl border text-xs space-y-2 transition ${
        cmt.isPinnedSolution
          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
          : theme === 'light'
          ? 'bg-slate-50 border-slate-200'
          : 'bg-slate-900/60 border-white/5'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={cmt.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
            alt={cmt.authorName}
            className="w-7 h-7 rounded-full object-cover border border-white/10"
          />
          <div>
            <div className="font-semibold text-slate-200 flex flex-wrap items-center gap-1.5">
              <span>{cmt.authorName}</span>
              {cmt.authorTitle && (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950">
                  {cmt.authorTitle}
                </span>
              )}
              {cmt.isPinnedSolution && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  <span>Lời giải hay nhất</span>
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {(isAdmin || (user && user.id === cmt.authorId)) && (
          <div className="flex items-center gap-1">
            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  StorageService.togglePinSolutionComment(cmt.id);
                  handleRefresh();
                }}
                className={`p-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition ${
                  cmt.isPinnedSolution ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
                title="Ghim lời giải chuẩn"
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                StorageService.deleteForumComment(cmt.id);
                handleRefresh();
              }}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
              title="Xóa bình luận ngay"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {cmt.content && <p className="text-slate-300 leading-relaxed pl-9">{cmt.content}</p>}

      {cmt.stickerUrl && (
        <div className="pl-9 pt-1">
          <img src={cmt.stickerUrl} alt="sticker" className="w-14 h-14 object-contain drop-shadow" />
        </div>
      )}

      {cmt.imageUrl && (
        <div
          onClick={() => setLightboxImage(cmt.imageUrl!)}
          className="ml-9 w-32 h-24 rounded-lg overflow-hidden border border-white/10 cursor-pointer bg-slate-900"
        >
          <img src={cmt.imageUrl} alt="lời giải" className="w-full h-full object-cover hover:scale-105 transition" />
        </div>
      )}
    </div>
  );

  // Render comments and input form for a post
  const renderPostDiscussion = (post: ForumPost) => {
    const postComments = comments.filter((c) => c.postId === post.id);

    return (
      <div className={`mt-4 pt-4 border-t ${theme === 'light' ? 'border-slate-200' : 'border-white/10'} space-y-4`}>
        {/* Discussion Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>Thảo luận & Lời giải ({postComments.length})</span>
          </h4>
        </div>

        {/* Comment list */}
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {postComments.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              Chưa có lời giải nào. Hãy là người đầu tiên chia sẻ đáp án nhé!
            </p>
          ) : (
            postComments.map((cmt) => renderCommentItem(cmt))
          )}
        </div>

        {/* Comment Input Box */}
        <form onSubmit={(e) => handleSendComment(e, post.id)} className="space-y-2">
          <div className="relative">
            <textarea
              rows={2}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={user ? 'Nhập lời giải, hướng dẫn hoặc chọn sticker...' : 'Đăng nhập để gửi lời giải'}
              disabled={!user}
              className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 focus:border-indigo-500"
            />

            {commentSticker && (
              <div className="absolute right-2 top-2 p-1 rounded-lg bg-black/60 border border-white/20 flex items-center gap-1">
                <img src={commentSticker} alt="sticker" className="w-6 h-6 object-contain" />
                <button type="button" onClick={() => setCommentSticker('')} className="text-slate-400 hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Comment Toolbar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 relative">
              {/* Emoji popover button */}
              <button
                type="button"
                onClick={() => {
                  setShowEmojiPicker(!showEmojiPicker);
                  setShowStickerPicker(false);
                }}
                disabled={!user}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 transition"
                title="Thêm emoji"
              >
                <Smile className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Biểu cảm</span>
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-8 left-0 z-30 p-2.5 rounded-xl bg-slate-900 border border-white/20 shadow-xl grid grid-cols-6 gap-1 w-56">
                  {COMMON_EMOJIS.map((em, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCommentText((prev) => prev + em);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1.5 rounded hover:bg-white/10 text-sm text-center"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}

              {/* Sticker picker button */}
              <button
                type="button"
                onClick={() => {
                  setShowStickerPicker(!showStickerPicker);
                  setShowEmojiPicker(false);
                }}
                disabled={!user}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 transition"
                title="Chọn Sticker có bản quyền"
              >
                <Sticker className="w-4 h-4 text-pink-400" />
                <span className="hidden sm:inline">Sticker</span>
              </button>

              {/* Upload image for comment */}
              <label
                className={`p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer transition ${
                  !user ? 'pointer-events-none opacity-50' : ''
                }`}
                title="Tải ảnh lời giải"
              >
                <ImageIcon className="w-4 h-4 text-sky-400" />
                <span className="hidden sm:inline">Ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'comment')}
                  className="hidden"
                  disabled={!user}
                />
              </label>

              {/* Sticker Picker Modal */}
              {showStickerPicker && (
                <div className="absolute bottom-8 left-0 z-30 p-3 rounded-2xl bg-slate-900 border border-white/20 shadow-2xl w-72 max-h-64 overflow-y-auto space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <span className="text-[11px] font-bold text-slate-200">Kho Sticker Bản Quyền</span>
                    <button type="button" onClick={() => setShowStickerPicker(false)} className="text-slate-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {approvedStickerPacks.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic text-center py-2">
                      Chưa có sticker nào được cấp phép.
                    </p>
                  ) : (
                    approvedStickerPacks.map((pack, pIdx) => (
                      <div key={pack.packName || pIdx} className="space-y-1">
                        <div className="text-[10px] font-semibold text-indigo-400 flex items-center gap-1">
                          <span>✨</span>
                          <span>{pack.packName}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {pack.stickers.map((stk) => (
                            <button
                              key={stk.id}
                              type="button"
                              onClick={() => {
                                setCommentSticker(stk.url);
                                setShowStickerPicker(false);
                              }}
                              className="p-1 rounded-lg hover:bg-white/10 flex flex-col items-center gap-1 transition"
                              title={stk.name}
                            >
                              <img src={stk.url} alt={stk.name} className="w-10 h-10 object-contain" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!user || (!commentText.trim() && !commentImage && !commentSticker)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow transition disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi lời giải</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] pt-6 pb-24 px-4 sm:px-8 transition-colors duration-500 relative"
      style={bgStyle}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.7)' : 'black',
          opacity: bgConfig.overlayOpacity ?? 0.1,
          backdropFilter: bgConfig.blur ? `blur(${bgConfig.blur}px)` : 'none',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Banner Title & Call to Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Cộng đồng Học tập & Thảo luận 24/7
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 flex items-center gap-2.5">
              <span>💬 Góc Hỏi Bài & Giải Đáp Sĩ Tử</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Hỏi bài tập khó, trao đổi mẹo thi THPTQG & V-ACT và nhận lời giải chi tiết từ bạn bè & thủ khoa.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else {
                setShowNewPostModal(true);
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition transform active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Đặt câu hỏi mới</span>
          </button>
        </div>

        {/* Toolbar: Subject Filters, Search, and Layout Switcher */}
        <div className="glass-panel rounded-2xl p-3 border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Subject pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {FORUM_SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Search & Layout Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm câu hỏi, dạng bài..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl glass-input border border-white/10 focus:border-indigo-500"
              />
            </div>

            {/* Layout View Switcher Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-black/30 border border-white/10">
              <button
                onClick={() => handleLayoutChange('feed')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  layout === 'feed'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục Feed chuẩn (Mở rộng tại chỗ)"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLayoutChange('grid')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  layout === 'grid'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục Dạng Ô (Grid Cards)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLayoutChange('kanban')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  layout === 'kanban'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục Dạng Cột (Kanban theo môn)"
              >
                <Columns3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleLayoutChange('compact')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  layout === 'compact'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Bố cục Thu Gọn (Compact List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* --- MAIN POSTS DISPLAY ACCORDING TO SELECTED LAYOUT --- */}

        {/* 1. LAYOUT: FEED (Default) */}
        {layout === 'feed' && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="glass-panel rounded-2xl p-8 text-center border border-white/10">
                <p className="text-sm text-slate-400">Không tìm thấy câu hỏi nào phù hợp.</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isExpanded = expandedPostId === post.id;
                const postReactions = post.reactions || { heart: 0, fire: 0, bulb: 0, clap: 0, userReactions: {} };
                const userReacted = user ? postReactions.userReactions?.[user.id] || [] : [];
                const subjColor = SUBJECT_COLORS[post.subject] || 'from-indigo-500 to-purple-600';

                return (
                  <div
                    key={post.id}
                    className={`glass-panel rounded-2xl p-5 border transition duration-200 ${
                      isExpanded
                        ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                          alt={post.authorName}
                          className="w-10 h-10 rounded-xl object-cover border border-white/10"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-white">{post.authorName}</span>
                            {post.authorTitle && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow">
                                {post.authorTitle}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${subjColor}`}>
                              {post.subject}
                            </span>
                            {post.isPinned && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Pin className="w-2.5 h-2.5" />
                                <span>Ghim</span>
                              </span>
                            )}
                            {post.status === 'resolved' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>Đã giải</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')} •{' '}
                            {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      {/* Header Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalPost(post);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                          title="Mở dạng cửa sổ Pop-up nổi"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>

                        {(isAdmin || (user && user.id === post.authorId)) && (
                          <>
                            {isAdmin && (
                              <>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    StorageService.togglePinForumPost(post.id);
                                    handleRefresh();
                                  }}
                                  className={`p-1.5 rounded-lg text-xs transition ${
                                    post.isPinned ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Ghim bài viết"
                                >
                                  <Pin className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    StorageService.toggleResolvePost(post.id);
                                    handleRefresh();
                                  }}
                                  className={`p-1.5 rounded-lg text-xs transition ${
                                    post.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                                  }`}
                                  title="Đánh dấu đã giải đáp"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                StorageService.deleteForumPost(post.id);
                                if (modalPost?.id === post.id) setModalPost(null);
                                handleRefresh();
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                              title="Xóa bài viết ngay"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Question Title & Content */}
                    <div
                      className="cursor-pointer mt-3 space-y-2"
                      onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    >
                      <h3 className="text-base font-bold text-white hover:text-indigo-400 transition leading-snug">
                        {post.title}
                      </h3>
                      <p className={`text-xs text-slate-300 leading-relaxed ${isExpanded ? 'whitespace-pre-line' : 'line-clamp-3'}`}>
                        {post.content}
                      </p>
                    </div>

                    {/* Attached Images preview */}
                    {post.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
                        {post.images.map((img, idx) => (
                          <div
                            key={idx}
                            onClick={() => setLightboxImage(img)}
                            className="group relative rounded-xl overflow-hidden border border-white/10 cursor-pointer h-28 bg-slate-900"
                          >
                            <img src={img} alt="Đề bài" className="w-full h-full object-cover group-hover:scale-105 transition" />
                            <span className="absolute bottom-1.5 right-1.5 p-1 rounded-lg bg-black/70 text-white opacity-0 group-hover:opacity-100 transition">
                              <Maximize2 className="w-3 h-3" />
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reactions Bar & Expand / Collapse Toggle Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-3 border-t border-white/5">
                      {/* Reactions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleReaction(post.id, 'heart')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                            userReacted.includes('heart')
                              ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                          <span>{postReactions.heart}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReaction(post.id, 'fire')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                            userReacted.includes('fire')
                              ? 'bg-orange-500/25 text-orange-300 border border-orange-500/40'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
                          <span>{postReactions.fire}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReaction(post.id, 'bulb')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                            userReacted.includes('bulb')
                              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-current" />
                          <span>{postReactions.bulb}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReaction(post.id, 'clap')}
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                            userReacted.includes('clap')
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                              : 'bg-white/5 text-slate-400 hover:text-white'
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{postReactions.clap}</span>
                        </button>
                      </div>

                      {/* Right controls: Share & Accordion Toggle */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCopyLink(post.id)}
                          className="px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 flex items-center gap-1 transition"
                          title="Chia sẻ liên kết câu hỏi"
                        >
                          {copiedId === post.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Đã chép link</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>Chia sẻ</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                            isExpanded
                              ? 'bg-indigo-600 text-white shadow'
                              : 'bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                          }`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{post.commentsCount} lời giải</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* INLINE ACCORDION: Expanded Discussion directly within this card */}
                    {isExpanded && renderPostDiscussion(post)}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 2. LAYOUT: GRID CARDS (2 - 3 Columns) */}
        {layout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPosts.map((post) => {
              const postReactions = post.reactions || { heart: 0, fire: 0, bulb: 0, clap: 0, userReactions: {} };
              const subjColor = SUBJECT_COLORS[post.subject] || 'from-indigo-500 to-purple-600';

              return (
                <div
                  key={post.id}
                  className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-indigo-500/40 transition duration-200 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    {/* Header badge & author */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${subjColor}`}>
                        {post.subject}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        {(isAdmin || (user && user.id === post.authorId)) && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              StorageService.deleteForumPost(post.id);
                              handleRefresh();
                            }}
                            className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition"
                            title="Xóa bài viết"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title & Preview */}
                    <div
                      className="cursor-pointer space-y-1.5"
                      onClick={() => setModalPost(post)}
                    >
                      <h3 className="font-bold text-sm text-white group-hover:text-indigo-400 transition line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>
                    </div>

                    {/* Image thumbnails */}
                    {post.images.length > 0 && (
                      <div
                        onClick={() => setModalPost(post)}
                        className="h-32 rounded-xl overflow-hidden border border-white/10 bg-slate-900 cursor-pointer"
                      >
                        <img src={post.images[0]} alt="thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      </div>
                    )}
                  </div>

                  {/* Footer & Action button */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                        alt={post.authorName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-[11px] text-slate-300 truncate max-w-[90px]">{post.authorName}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setModalPost(post)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold flex items-center gap-1 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.commentsCount} Lời giải</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. LAYOUT: KANBAN COLUMNS (Columns by Subject) */}
        {layout === 'kanban' && (
          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-thin">
            {FORUM_SUBJECTS.filter((s) => s !== 'Tất cả').map((subj) => {
              const subjPosts = posts.filter((p) => p.subject === subj);
              const subjColor = SUBJECT_COLORS[subj] || 'from-indigo-500 to-purple-600';

              return (
                <div key={subj} className="w-80 shrink-0 flex flex-col space-y-3">
                  {/* Column Header */}
                  <div className="p-3 rounded-2xl glass-panel border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${subjColor}`} />
                      <span className="font-bold text-xs text-white">{subj}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
                      {subjPosts.length}
                    </span>
                  </div>

                  {/* Column Post Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {subjPosts.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-6">Chưa có bài môn này</p>
                    ) : (
                      subjPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => setModalPost(post)}
                          className="p-3.5 rounded-xl glass-panel border border-white/10 hover:border-indigo-500/40 cursor-pointer space-y-2 transition"
                        >
                          <h4 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                            {post.title}
                          </h4>
                          <p className="text-[11px] text-slate-300 line-clamp-2">{post.content}</p>
                          <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                            <span>{post.authorName}</span>
                            <span className="flex items-center gap-1 text-indigo-400 font-semibold">
                              <MessageSquare className="w-3 h-3" />
                              <span>{post.commentsCount}</span>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. LAYOUT: COMPACT LIST */}
        {layout === 'compact' && (
          <div className="glass-panel rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {filteredPosts.map((post) => {
              const isExpanded = expandedPostId === post.id;
              const subjColor = SUBJECT_COLORS[post.subject] || 'from-indigo-500 to-purple-600';

              return (
                <div key={post.id} className="transition">
                  <div
                    onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold text-white bg-gradient-to-r ${subjColor} shrink-0`}>
                        {post.subject}
                      </span>
                      <h3 className="font-semibold text-xs sm:text-sm text-white hover:text-indigo-400 transition truncate max-w-xl">
                        {post.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 shrink-0">
                      <span className="truncate max-w-[100px]">{post.authorName}</span>
                      <span className="flex items-center gap-1 text-indigo-400 font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{post.commentsCount}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalPost(post);
                        }}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Mở toàn màn hình"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      {(isAdmin || (user && user.id === post.authorId)) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            StorageService.deleteForumPost(post.id);
                            handleRefresh();
                          }}
                          className="p-1 text-rose-400 hover:bg-rose-500/20 rounded-lg transition"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {isExpanded && <div className="p-4 pt-0">{renderPostDiscussion(post)}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* --- CENTER POP-UP MODAL (When clicking Maximize or in Grid/Kanban views) --- */}
        {modalPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-3xl max-h-[90vh] flex flex-col glass-panel rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/40">
                <div className="flex items-center gap-3">
                  <img
                    src={modalPost.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop'}
                    alt={modalPost.authorName}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{modalPost.authorName}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-indigo-600">
                        {modalPost.subject}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(modalPost.createdAt).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setModalPost(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1">
                <h2 className="text-lg font-extrabold text-white leading-snug">{modalPost.title}</h2>
                <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {modalPost.content}
                </div>

                {modalPost.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                    {modalPost.images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxImage(img)}
                        className="h-36 rounded-xl overflow-hidden border border-white/10 cursor-pointer bg-slate-900"
                      >
                        <img src={img} alt="đề bài" className="w-full h-full object-cover hover:scale-105 transition" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Discussion Thread */}
                {renderPostDiscussion(modalPost)}
              </div>
            </div>
          </div>
        )}

        {/* --- LIGHTBOX MODAL (Image Zoom Preview) --- */}
        {lightboxImage && (
          <div
            onClick={() => setLightboxImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={lightboxImage}
                alt="Phóng to"
                className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/20"
              />
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* --- CREATE QUESTION MODAL --- */}
        {showNewPostModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="w-full max-w-xl glass-panel rounded-3xl border border-white/20 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Đặt Câu Hỏi & Bài Tập Mới</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* Subject picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Môn học / Phân môn:</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                  >
                    {FORUM_SUBJECTS.filter((s) => s !== 'Tất cả').map((s) => (
                      <option key={s} value={s} className="bg-slate-900 text-white">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tiêu đề câu hỏi / Dạng bài:</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Câu 45 Tích phân hàm ẩn đề thi thử Chuyên Sư Phạm 2026..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Chi tiết câu hỏi & phần bị vướng:</label>
                  <textarea
                    rows={4}
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Mô tả cụ thể chỗ bạn chưa hiểu, cách bạn đã thử giải hoặc công thức cần làm rõ..."
                    className="w-full px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white focus:border-indigo-500"
                  />
                </div>

                {/* Image Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Đính kèm ảnh đề bài / hình vẽ:</label>
                  <div className="flex gap-2">
                    <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer transition">
                      <ImageIcon className="w-4 h-4 text-indigo-400" />
                      <span>Tải ảnh từ máy</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'post')}
                        className="hidden"
                      />
                    </label>

                    <div className="flex-1 flex gap-1">
                      <input
                        type="url"
                        value={tempImageUrl}
                        onChange={(e) => setTempImageUrl(e.target.value)}
                        placeholder="Hoặc dán link ảnh..."
                        className="flex-1 px-3 py-2 text-xs rounded-xl glass-input border border-white/10 text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tempImageUrl.trim()) {
                            setNewImages((prev) => [...prev, tempImageUrl.trim()]);
                            setTempImageUrl('');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>

                  {/* Attached images preview */}
                  {newImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {newImages.map((img, idx) => (
                        <div key={idx} className="relative h-16 rounded-lg overflow-hidden border border-white/20">
                          <img src={img} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setNewImages((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewPostModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/25"
                  >
                    Đăng câu hỏi ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
