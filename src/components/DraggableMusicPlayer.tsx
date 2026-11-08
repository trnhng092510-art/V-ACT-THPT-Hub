import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Plus,
  ListMusic,
  X,
  Disc3,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Trash2,
} from 'lucide-react';
import { Song, BackgroundConfig } from '../types';
import { formatTime } from '../utils/timer';
import { StorageService } from '../services/storage';

interface Props {
  songs: Song[];
  onAddSong: (song: Song) => void;
  bgConfig: BackgroundConfig;
}

export const DraggableMusicPlayer: React.FC<Props> = ({ songs, onAddSong, bgConfig }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');

  // Mode: 'disc' (ultra-compact round vinyl) or 'expanded' (full Spotify dock)
  const [playerMode, setPlayerMode] = useState<'disc' | 'expanded'>('disc');
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Position for Free Drag & Drop (start above bottom bar)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    if (typeof window !== 'undefined') {
      return {
        x: Math.max(20, window.innerWidth - 120),
        y: Math.max(80, window.innerHeight - 200),
      };
    }
    return { x: 950, y: 600 };
  });

  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Custom song form
  const [addMethodTab, setAddMethodTab] = useState<'file' | 'url'>('file');
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCover, setNewCover] = useState('');
  const [selectedGradient, setSelectedGradient] = useState('from-indigo-600 via-purple-600 to-pink-500');
  const [fileNameUploaded, setFileNameUploaded] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSong = songs[currentSongIndex] || songs[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentSongIndex]);

  // Drag listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const newX = Math.min(Math.max(10, e.clientX - dragOffsetRef.current.x), window.innerWidth - 100);
      const newY = Math.min(Math.max(10, e.clientY - dragOffsetRef.current.y), window.innerHeight - 60);
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length === 0) return;
      const touch = e.touches[0];
      const newX = Math.min(Math.max(10, touch.clientX - dragOffsetRef.current.x), window.innerWidth - 100);
      const newY = Math.min(Math.max(10, touch.clientY - dragOffsetRef.current.y), window.innerHeight - 60);
      setPosition({ x: newX, y: newY });
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleStartDragMouse = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleStartDragTouch = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    };
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(true));
    }
  };

  const handleNext = () => {
    if (songs.length <= 1) return;
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * songs.length);
      setCurrentSongIndex(nextIndex);
    } else {
      setCurrentSongIndex((prev) => (prev + 1) % songs.length);
    }
  };

  const handlePrev = () => {
    if (songs.length <= 1) return;
    if (currentTime > 3) {
      if (audioRef.current) audioRef.current.currentTime = 0;
      return;
    }
    setCurrentSongIndex((prev) => (prev - 1 + songs.length) % songs.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else if (repeatMode === 'all') {
      handleNext();
    } else {
      if (currentSongIndex < songs.length - 1) {
        handleNext();
      } else {
        setIsPlaying(false);
      }
    }
  };

  const toggleRepeat = () => {
    if (repeatMode === 'off') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('off');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setNewUrl(url);
      setFileNameUploaded(file.name);
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) {
      setFormError('⚠️ Vui lòng chọn file nhạc hoặc dán link nhạc MP3 hợp lệ!');
      return;
    }
    setFormError(null);

    const currentUserName = typeof window !== 'undefined'
      ? (JSON.parse(localStorage.getItem('studyhub_current_user') || 'null')?.displayName || 'Sĩ tử StudyHub')
      : 'Thành viên';

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Người dùng đóng góp',
      audioUrl: newUrl.trim(),
      coverUrl: newCover.trim() || 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=300&auto=format&fit=crop',
      coverGradient: selectedGradient,
      duration: 180,
      contributedBy: currentUserName,
    };

    onAddSong(newSong);
    setShowAddModal(false);
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
    setNewCover('');
    setFileNameUploaded('');
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => setDuration(currentSong.duration || 180)}
      />

      <style>{`
        @keyframes discSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-disc-spin {
          animation: discSpin 8s linear infinite;
        }
      `}</style>

      {/* Floating Draggable Container */}
      <div
        className="fixed z-40 select-none transition-shadow"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {/* MODE 1: MINI DISC (COMPACT FLOATING VINYL) */}
        {playerMode === 'disc' && (
          <div className="relative group cursor-grab active:cursor-grabbing">
            {/* Drag Handle Top Bar */}
            <div
              onMouseDown={handleStartDragMouse}
              onTouchStart={handleStartDragTouch}
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-900/90 text-slate-400 hover:text-white text-[9px] flex items-center gap-1 shadow cursor-grab border border-white/10"
              title="Kéo thả vị trí"
            >
              <GripHorizontal className="w-3 h-3" />
            </div>

            <div
              className={`w-14 h-14 rounded-full p-1 bg-slate-950/80 backdrop-blur-xl border-2 border-indigo-500/40 shadow-2xl flex items-center justify-center relative ${
                isPlaying ? 'ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-slate-950' : ''
              }`}
            >
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className={`w-full h-full rounded-full object-cover ${isPlaying ? 'animate-disc-spin' : ''}`}
              />

              {/* Center hole of vinyl */}
              <div className="absolute w-4 h-4 rounded-full bg-slate-950 border border-white/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              </div>

              {/* Hover overlay with play/pause and expand button */}
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1 rounded-full text-white hover:scale-110 transition"
                  title={isPlaying ? 'Dừng' : 'Phát'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerMode('expanded')}
                  className="p-1 rounded-full text-indigo-300 hover:text-white"
                  title="Mở rộng bảng Spotify"
                >
                  <Maximize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: EXPANDED SPOTIFY DOCK (DRAGGABLE) */}
        {playerMode === 'expanded' && (
          <div className="w-80 sm:w-96 rounded-3xl glass-panel p-4 shadow-2xl border border-white/15 backdrop-blur-2xl text-slate-100">
            {/* Drag Handle & Top Actions */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
              <div
                onMouseDown={handleStartDragMouse}
                onTouchStart={handleStartDragTouch}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 cursor-grab active:cursor-grabbing px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition"
                title="Nhấn giữ chuột hoặc chạm để kéo thả tự do"
              >
                <GripHorizontal className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-medium hidden sm:inline">Kéo thả</span>
              </div>

              {/* Prominent Always-Unlocked Add Song Button for ALL USERS */}
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-[11px] shadow flex items-center gap-1 transition active:scale-95"
                title="Mọi thành viên đều có thể tự do thêm bài hát vào danh sách phát"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm bài hát mới</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPlayerMode('disc')}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition text-[11px] flex items-center gap-1"
                  title="Thu gọn thành đĩa nhạc xoay tròn"
                >
                  <Disc3 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] hidden sm:inline">Đĩa xoay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
                  className={`p-1.5 rounded-lg transition ${
                    showPlaylistDrawer ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Mở danh sách bài hát"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Current Song Row */}
            <div className="flex items-center gap-3 my-2">
              <div className="relative group cursor-pointer" onClick={() => setPlayerMode('disc')}>
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className={`w-12 h-12 rounded-xl object-cover border border-white/15 ${
                    isPlaying ? 'animate-disc-spin shadow-md shadow-indigo-500/20' : ''
                  }`}
                />
                {isPlaying && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-white truncate">{currentSong.title}</h4>
                <p className="text-[11px] text-indigo-400 truncate">{currentSong.artist}</p>
                {currentSong.contributedBy && (
                  <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <span>Đóng góp bởi:</span>
                    <span className="text-amber-300 font-semibold">{currentSong.contributedBy}</span>
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={togglePlay}
                className="p-3 rounded-full bg-white hover:bg-slate-200 text-slate-950 shadow-xl transition transform active:scale-95"
                aria-label={isPlaying ? 'Dừng' : 'Phát'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              </button>
            </div>

            {/* Seekbar */}
            <div className="space-y-0.5 my-2">
              <input
                type="range"
                min="0"
                max={duration || 180}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 accent-indigo-500 rounded-lg cursor-pointer bg-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>{formatTime(currentTime, false)}</span>
                <span>{formatTime(duration, false)}</span>
              </div>
            </div>

            {/* Secondary Controls: Shuffle, Prev, Next, Repeat & Volume */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`p-1 rounded-lg transition ${
                    isShuffle ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Phát ngẫu nhiên"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1 text-slate-300 hover:text-white transition"
                  title="Bài trước"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1 text-slate-300 hover:text-white transition"
                  title="Bài tiếp theo"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={toggleRepeat}
                  className={`p-1 rounded-lg transition ${
                    repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Chế độ lặp lại"
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-3.5 h-3.5" /> : <Repeat className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 w-28">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="text-slate-400 hover:text-white transition"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-full h-1 accent-indigo-500 rounded-lg cursor-pointer bg-slate-800"
                />
              </div>
            </div>

            {/* Expandable Playlist Drawer */}
            {showPlaylistDrawer && (
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Danh sách phát ({songs.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 transition"
                  >
                    <Plus className="w-3 h-3" /> + Thêm bài hát
                  </button>
                </div>

                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {songs.map((s, idx) => {
                    const isCurrent = idx === currentSongIndex;
                    return (
                      <div
                        key={s.id}
                        onClick={() => {
                          setCurrentSongIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition cursor-pointer ${
                          isCurrent
                            ? 'bg-indigo-600/30 text-white border border-indigo-500/40 shadow-sm'
                            : 'bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img src={s.coverUrl} alt={s.title} className="w-7 h-7 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 truncate">
                            <span className="truncate block font-semibold">{s.title}</span>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                              <span>{s.artist}</span>
                              {s.contributedBy && (
                                <>
                                  <span>•</span>
                                  <span className="text-amber-300">Đóng góp: {s.contributedBy}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          {isCurrent && isPlaying && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                          {songs.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                StorageService.deleteSong(s.id);
                                if (currentSongIndex >= songs.length - 1) {
                                  setCurrentSongIndex(0);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                              title="Xóa bài hát khỏi playlist"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Song Pop-up Modal (Dual-Method: File Upload & URL) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 text-slate-100 shadow-2xl border border-white/15 relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-indigo-400">
                <Plus className="w-5 h-5" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Thêm Bài Hát Vào Danh Sách Phát
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Method Tabs: File Upload vs URL */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/60 border border-white/10 my-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAddMethodTab('file')}
                className={`flex-1 py-2 rounded-lg text-center transition ${
                  addMethodTab === 'file'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📁 Tải file nhạc từ thiết bị
              </button>
              <button
                type="button"
                onClick={() => setAddMethodTab('url')}
                className={`flex-1 py-2 rounded-lg text-center transition ${
                  addMethodTab === 'url'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🔗 Dán đường link nhạc (URL)
              </button>
            </div>

            <form onSubmit={handleSaveCustomSong} className="space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 font-semibold">
                  {formError}
                </div>
              )}
              {addMethodTab === 'file' ? (
                /* Tab 1: File Upload (.mp3, .wav, .ogg, .m4a) */
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-dashed border-indigo-500/40 space-y-2 text-center">
                  <label className="block text-slate-200 font-semibold mb-1 cursor-pointer">
                    Chọn tệp âm thanh (.mp3, .wav, .ogg, .m4a):
                  </label>
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/*"
                    onChange={handleFileUpload}
                    className="w-full text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                  />
                  {fileNameUploaded && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      ✓ Đã tải: {fileNameUploaded}
                    </p>
                  )}
                  <p className="text-[10px] text-slate-400">
                    File được chuyển hóa tức thì thành Audio Stream để phát mượt mà ngay trên web.
                  </p>
                </div>
              ) : (
                /* Tab 2: URL Input */
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Đường dẫn tệp âm thanh trực tuyến (Direct Audio URL):
                  </label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://... file .mp3, .wav hoặc link nhạc"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10 font-mono text-xs"
                    required={addMethodTab === 'url'}
                  />
                </div>
              )}

              {/* Title & Artist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Tên bài hát: (*)</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Lofi Study Beats, Piano Focus..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Nghệ sĩ / Thể loại:</label>
                  <input
                    type="text"
                    value={newArtist}
                    onChange={(e) => setNewArtist(e.target.value)}
                    placeholder="VD: Chillhop Music, Lofi Cafe..."
                    className="w-full px-3 py-2 rounded-xl glass-input text-white border border-white/10"
                  />
                </div>
              </div>

              {/* Cover Image or Gradient */}
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Ảnh bìa đĩa nhạc (Hoặc chọn Gradient đa sắc):
                </label>
                <input
                  type="url"
                  value={newCover}
                  onChange={(e) => setNewCover(e.target.value)}
                  placeholder="https://... link ảnh bìa (để trống để dùng gradient)"
                  className="w-full px-3 py-1.5 rounded-xl glass-input text-white border border-white/10 mb-2"
                />

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Tím Lam', val: 'from-indigo-600 via-purple-600 to-pink-500' },
                    { label: 'Hồng Cam', val: 'from-rose-500 via-pink-500 to-orange-400' },
                    { label: 'Xanh Biển', val: 'from-blue-600 via-cyan-500 to-teal-400' },
                    { label: 'Lục Bảo', val: 'from-emerald-600 via-teal-500 to-cyan-400' },
                  ].map((grad) => (
                    <button
                      key={grad.val}
                      type="button"
                      onClick={() => {
                        setSelectedGradient(grad.val);
                        setNewCover('');
                      }}
                      className={`h-7 rounded-xl bg-gradient-to-r ${grad.val} text-[10px] font-bold text-white transition border ${
                        selectedGradient === grad.val && !newCover
                          ? 'ring-2 ring-white scale-105'
                          : 'border-white/10 opacity-70'
                      }`}
                    >
                      {grad.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 transition active:scale-95"
                >
                  Thêm Vào Playlist Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
