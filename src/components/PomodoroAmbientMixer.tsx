import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Coffee,
  CloudRain,
  Flame,
  BookOpen,
  Sparkles,
  CheckCircle,
  Bell,
} from 'lucide-react';
import { formatTime } from '../utils/timer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onStudyTimeAccumulated?: (seconds: number) => void;
}

type TimerMode = 'pomodoro' | 'short_break' | 'long_break';

export const PomodoroAmbientMixer: React.FC<Props> = ({
  isOpen,
  onClose,
  onStudyTimeAccumulated,
}) => {
  // --- Pomodoro Timer State ---
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);

  // --- Ambient Sounds State (Rain, Fire, Coffee, Book) ---
  const [rainVol, setRainVol] = useState(0.4);
  const [rainActive, setRainActive] = useState(false);

  const [fireVol, setFireVol] = useState(0.3);
  const [fireActive, setFireActive] = useState(false);

  const [coffeeVol, setCoffeeVol] = useState(0.2);
  const [coffeeActive, setCoffeeActive] = useState(false);

  const [bookVol, setBookVol] = useState(0.3);
  const [bookActive, setBookActive] = useState(false);

  const [masterMute, setMasterMute] = useState(false);

  // --- Web Audio API Procedural Synthesizer Refs ---
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainNodeRef = useRef<{ gain: GainNode } | null>(null);
  const fireNodeRef = useRef<{ gain: GainNode } | null>(null);
  const coffeeNodeRef = useRef<{ gain: GainNode } | null>(null);
  const bookNodeRef = useRef<{ gain: GainNode } | null>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Switch timer modes
  const switchMode = (mode: TimerMode) => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'pomodoro') setTimeLeft(pomodoroMinutes * 60);
    else if (mode === 'short_break') setTimeLeft(shortBreakMinutes * 60);
    else setTimeLeft(longBreakMinutes * 60);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerMode === 'pomodoro') setTimeLeft(pomodoroMinutes * 60);
    else if (timerMode === 'short_break') setTimeLeft(shortBreakMinutes * 60);
    else setTimeLeft(longBreakMinutes * 60);
  };

  // Play chime sound using Web Audio API
  const playChime = () => {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  // Timer loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playChime();
            setIsRunning(false);
            if (timerMode === 'pomodoro') {
              setCompletedSessions((c) => c + 1);
              if (onStudyTimeAccumulated) {
                onStudyTimeAccumulated(pomodoroMinutes * 60);
              }
              return 0;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timerMode, pomodoroMinutes, onStudyTimeAccumulated]);

  // Setup / update Procedural Rain generator
  useEffect(() => {
    if (!isOpen) return;
    try {
      const ctx = getAudioContext();
      if (rainActive && !masterMute) {
        if (!rainNodeRef.current) {
          // Generate Pink/Brown Noise buffer
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.11;
          }
          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1000;

          const gain = ctx.createGain();
          gain.gain.value = rainVol;

          whiteNoise.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          whiteNoise.start();

          rainNodeRef.current = { gain };
        } else {
          rainNodeRef.current.gain.gain.setValueAtTime(rainVol, ctx.currentTime);
        }
      } else {
        if (rainNodeRef.current) {
          rainNodeRef.current.gain.gain.setValueAtTime(0, ctx.currentTime);
        }
      }
    } catch {}
  }, [rainActive, rainVol, masterMute, isOpen]);

  // Setup / update Procedural Fire generator
  useEffect(() => {
    if (!isOpen) return;
    try {
      const ctx = getAudioContext();
      if (fireActive && !masterMute) {
        if (!fireNodeRef.current) {
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            // Crackling noise
            const rand = Math.random();
            output[i] = rand > 0.985 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.03;
          }
          const src = ctx.createBufferSource();
          src.buffer = noiseBuffer;
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 800;
          filter.Q.value = 2;

          const gain = ctx.createGain();
          gain.gain.value = fireVol;

          src.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          src.start();

          fireNodeRef.current = { gain };
        } else {
          fireNodeRef.current.gain.gain.setValueAtTime(fireVol, ctx.currentTime);
        }
      } else {
        if (fireNodeRef.current) {
          fireNodeRef.current.gain.gain.setValueAtTime(0, ctx.currentTime);
        }
      }
    } catch {}
  }, [fireActive, fireVol, masterMute, isOpen]);

  // Setup / update Coffee Shop Chatter ambience
  useEffect(() => {
    if (!isOpen) return;
    try {
      const ctx = getAudioContext();
      if (coffeeActive && !masterMute) {
        if (!coffeeNodeRef.current) {
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let last = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            last = (last + 0.02 * white) / 1.02;
            output[i] = last * 3.5;
          }
          const src = ctx.createBufferSource();
          src.buffer = noiseBuffer;
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 650;

          const gain = ctx.createGain();
          gain.gain.value = coffeeVol;

          src.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          src.start();

          coffeeNodeRef.current = { gain };
        } else {
          coffeeNodeRef.current.gain.gain.setValueAtTime(coffeeVol, ctx.currentTime);
        }
      } else {
        if (coffeeNodeRef.current) {
          coffeeNodeRef.current.gain.gain.setValueAtTime(0, ctx.currentTime);
        }
      }
    } catch {}
  }, [coffeeActive, coffeeVol, masterMute, isOpen]);

  // Setup / update Book flipping rustle ambience
  useEffect(() => {
    if (!isOpen) return;
    try {
      const ctx = getAudioContext();
      if (bookActive && !masterMute) {
        if (!bookNodeRef.current) {
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = (Math.random() * 2 - 1) * 0.06;
          }
          const src = ctx.createBufferSource();
          src.buffer = noiseBuffer;
          src.loop = true;

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.value = 2400;

          const gain = ctx.createGain();
          gain.gain.value = bookVol;

          src.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);
          src.start();

          bookNodeRef.current = { gain };
        } else {
          bookNodeRef.current.gain.gain.setValueAtTime(bookVol, ctx.currentTime);
        }
      } else {
        if (bookNodeRef.current) {
          bookNodeRef.current.gain.gain.setValueAtTime(0, ctx.currentTime);
        }
      }
    } catch {}
  }, [bookActive, bookVol, masterMute, isOpen]);

  if (!isOpen) return null;

  const totalTime =
    timerMode === 'pomodoro'
      ? pomodoroMinutes * 60
      : timerMode === 'short_break'
      ? shortBreakMinutes * 60
      : longBreakMinutes * 60;
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 text-slate-100 shadow-2xl border border-white/15 relative overflow-hidden">
        {/* Glow Top Corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Trạm Tập Trung Pomodoro & Âm Thanh Trắng</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  Focus Zone
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Phương pháp 25/5 kết hợp tiếng ồn tự nhiên giúp loại bỏ xao nhãng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 relative z-10">
          {/* LEFT: Pomodoro Timer Circle */}
          <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/60 border border-white/10 text-center relative">
            {/* Mode Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-white/10 mb-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => switchMode('pomodoro')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timerMode === 'pomodoro'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Học sâu (25p)
              </button>
              <button
                type="button"
                onClick={() => switchMode('short_break')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timerMode === 'short_break'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nghỉ ngắn (5p)
              </button>
              <button
                type="button"
                onClick={() => switchMode('long_break')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  timerMode === 'long_break'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Nghỉ dài (15p)
              </button>
            </div>

            {/* Big Countdown Display */}
            <div className="font-mono text-5xl sm:text-6xl font-black text-white tracking-wider my-2 drop-shadow-md">
              {formatTime(timeLeft, false)}
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden my-4 border border-white/5">
              <div
                className={`h-full transition-all duration-1000 ${
                  timerMode === 'pomodoro'
                    ? 'bg-rose-500'
                    : timerMode === 'short_break'
                    ? 'bg-emerald-500'
                    : 'bg-indigo-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Timer Actions */}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setIsRunning(!isRunning)}
                className={`px-6 py-2.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-xl transition transform active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white shadow-rose-500/25'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Tạm Dừng</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Bắt Đầu Tập Trung</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetTimer}
                className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition border border-white/10"
                title="Đặt lại thời gian"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 text-[11px] text-slate-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Đã hoàn thành {completedSessions} phiên hôm nay</span>
            </div>
          </div>

          {/* RIGHT: Ambient Sounds Mixer */}
          <div className="flex flex-col justify-between p-5 rounded-3xl bg-slate-900/60 border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trộn Âm Thanh Nền</span>
              </span>
              <button
                type="button"
                onClick={() => setMasterMute(!masterMute)}
                className={`p-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                  masterMute ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                {masterMute ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{masterMute ? 'Đang tắt tiếng' : 'Tắt tất cả'}</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Rain Sound */}
              <div className="p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setRainActive(!rainActive)}
                  className={`p-2 rounded-xl transition ${
                    rainActive && !masterMute
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt tiếng mưa"
                >
                  <CloudRain className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200">Mưa rơi êm dịu</span>
                    <span className="text-slate-400 font-mono">{Math.round(rainVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={rainVol}
                    onChange={(e) => {
                      setRainVol(Number(e.target.value));
                      if (!rainActive) setRainActive(true);
                    }}
                    className="w-full h-1 accent-blue-500 rounded-lg cursor-pointer bg-slate-800"
                  />
                </div>
              </div>

              {/* Campfire Sound */}
              <div className="p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setFireActive(!fireActive)}
                  className={`p-2 rounded-xl transition ${
                    fireActive && !masterMute
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt tiếng lửa trại"
                >
                  <Flame className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200">Lửa trại ấm áp</span>
                    <span className="text-slate-400 font-mono">{Math.round(fireVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={fireVol}
                    onChange={(e) => {
                      setFireVol(Number(e.target.value));
                      if (!fireActive) setFireActive(true);
                    }}
                    className="w-full h-1 accent-amber-500 rounded-lg cursor-pointer bg-slate-800"
                  />
                </div>
              </div>

              {/* Coffee Shop Ambience */}
              <div className="p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCoffeeActive(!coffeeActive)}
                  className={`p-2 rounded-xl transition ${
                    coffeeActive && !masterMute
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt tiếng quán cà phê"
                >
                  <Coffee className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200">Quán cà phê học tập</span>
                    <span className="text-slate-400 font-mono">{Math.round(coffeeVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={coffeeVol}
                    onChange={(e) => {
                      setCoffeeVol(Number(e.target.value));
                      if (!coffeeActive) setCoffeeActive(true);
                    }}
                    className="w-full h-1 accent-orange-500 rounded-lg cursor-pointer bg-slate-800"
                  />
                </div>
              </div>

              {/* Book Rustle Sound */}
              <div className="p-2.5 rounded-2xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setBookActive(!bookActive)}
                  className={`p-2 rounded-xl transition ${
                    bookActive && !masterMute
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Bật/Tắt tiếng lật sách thư viện"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="font-semibold text-slate-200">Lật trang sách thư viện</span>
                    <span className="text-slate-400 font-mono">{Math.round(bookVol * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={bookVol}
                    onChange={(e) => {
                      setBookVol(Number(e.target.value));
                      if (!bookActive) setBookActive(true);
                    }}
                    className="w-full h-1 accent-purple-500 rounded-lg cursor-pointer bg-slate-800"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 text-center italic">
              Âm thanh được tổng hợp qua Web Audio API, không tốn băng thông mạng.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
