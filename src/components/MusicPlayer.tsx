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
  Music2,
  ChevronUp,
  ChevronDown,
  Plus,
  ListMusic,
  X,
  Upload,
  Radio,
} from 'lucide-react';
import { Song, BackgroundConfig } from '../types';
import { formatTime } from '../utils/timer';

interface Props {
  songs: Song[];
  onAddSong: (song: Song) => void;
  bgConfig: BackgroundConfig;
}

export const MusicPlayer: React.FC<Props> = ({ songs, onAddSong, bgConfig }) => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states for adding custom song
  const [newTitle, setNewTitle] = useState('');
  const [newArtist, setNewArtist] = useState('');
  const [newUrl, setNewUrl] = useState('');

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
        audioRef.current.play().catch(() => {
          // If browser autoplay policies block audio, wait for user click
          setIsPlaying(false);
        });
      }
    }
  }, [currentSongIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('Play error:', e);
        setIsPlaying(true);
      });
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
      if (!newTitle) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSaveCustomSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    const newSong: Song = {
      id: `song-${Date.now()}`,
      title: newTitle.trim(),
      artist: newArtist.trim() || 'Custom Upload',
      audioUrl: newUrl.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=300&auto=format&fit=crop',
      duration: 180,
    };

    onAddSong(newSong);
    setShowAddModal(false);
    setNewTitle('');
    setNewArtist('');
    setNewUrl('');
  };

  if (!currentSong) return null;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => {
          // If error occurs, keep simulation duration
          setDuration(currentSong.duration || 180);
        }}
      />

      {/* Fixed Mini Player at Bottom Right */}
      <div className="fixed bottom-4 right-4 z-40 animate-fade-in">
        <div className="glass-panel rounded-2xl p-2.5 sm:p-3 shadow-2xl border border-white/10 flex items-center gap-3 backdrop-blur-xl">
          {/* Song Cover */}
          <div className="relative group cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/15 transition-transform ${
                isPlaying ? 'rotate-animation shadow-md shadow-indigo-500/20' : ''
              }`}
            />
            {isPlaying && (
              <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            )}
          </div>

          {/* Song Title & Artist */}
          <div
            className="cursor-pointer max-w-[120px] sm:max-w-[160px]"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="block text-xs sm:text-sm font-bold text-white truncate">
              {currentSong.title}
            </span>
            <span className="block text-[10px] text-slate-400 truncate">
              {currentSong.artist}
            </span>
          </div>

          {/* Mini Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 sm:p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/30 transition transform active:scale-95"
            aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>

          {/* Mini Next button */}
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            aria-label="Bài tiếp theo"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Expand Drawer button */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
            title="Mở rộng danh sách phát Spotify"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Spotify-Style Playlist Drawer */}
      {isExpanded && (
        <div className="fixed bottom-20 right-4 z-40 w-80 sm:w-96 rounded-3xl glass-panel p-5 shadow-2xl border border-white/15 backdrop-blur-2xl text-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs tracking-wider uppercase text-slate-300">
                Lofi Study Space Player
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Track Big Card */}
          <div className="my-4 text-center">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-32 h-32 rounded-2xl mx-auto object-cover border border-white/10 shadow-xl mb-3"
            />
            <h4 className="font-extrabold text-sm text-white truncate px-2">{currentSong.title}</h4>
            <p className="text-xs text-indigo-400 truncate">{currentSong.artist}</p>
          </div>

          {/* Seekbar */}
          <div className="space-y-1 mb-4">
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

          {/* Full Player Controls (Spotify Standard) */}
          <div className="flex items-center justify-between px-2 mb-5">
            <button
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-1.5 rounded-lg transition ${
                isShuffle ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Phát ngẫu nhiên (Shuffle)"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrev}
              className="p-2 text-slate-300 hover:text-white transition"
              aria-label="Bài trước"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 rounded-full bg-white hover:bg-slate-200 text-slate-950 shadow-xl transition transform active:scale-95"
              aria-label={isPlaying ? 'Dừng' : 'Phát'}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-slate-300 hover:text-white transition"
              aria-label="Bài tiếp theo"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-1.5 rounded-lg transition ${
                repeatMode !== 'off' ? 'text-indigo-400 bg-indigo-500/20' : 'text-slate-400 hover:text-white'
              }`}
              title="Chế độ lặp lại"
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-2 px-2 pb-4 mb-4 border-b border-white/10">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-slate-400 hover:text-white transition"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
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

          {/* Playlist Section & + Thêm bài hát button */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ListMusic className="w-3.5 h-3.5 text-indigo-400" />
                <span>Danh sách phát ({songs.length})</span>
              </span>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Thêm bài hát
              </button>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {songs.map((s, idx) => {
                const isCurrent = idx === currentSongIndex;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setCurrentSongIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition ${
                      isCurrent
                        ? 'bg-indigo-600/30 text-white border border-indigo-500/40'
                        : 'bg-slate-900/40 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <img src={s.coverUrl} alt={s.title} className="w-6 h-6 rounded object-cover" />
                      <div className="truncate">
                        <span className="font-semibold block truncate">{s.title}</span>
                        <span className="text-[10px] text-slate-400 truncate">{s.artist}</span>
                      </div>
                    </div>
                    {isCurrent && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Song Pop-up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-2xl p-5 text-slate-100 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-sm text-white">+ Thêm nhạc vào Danh sách phát</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomSong} className="my-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tên bài hát:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="VD: Lofi Piano Relax, Deep Focus..."
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white border border-white/10"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Nghệ sĩ / Thể loại:</label>
                <input
                  type="text"
                  value={newArtist}
                  onChange={(e) => setNewArtist(e.target.value)}
                  placeholder="VD: Study Chill Vibes"
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Đường dẫn file MP3 trực tiếp:</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://... file .mp3"
                  className="w-full px-3 py-1.5 rounded-lg glass-input text-white border border-white/10"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Hoặc tải file MP3 từ máy tính:</label>
                <input
                  type="file"
                  accept="audio/mp3,audio/*"
                  onChange={handleFileUpload}
                  className="w-full text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-indigo-600 file:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Thêm bài hát
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
