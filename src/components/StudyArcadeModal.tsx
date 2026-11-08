import React, { useState, useEffect, useRef } from 'react';
import {
  X, Coins, Calendar, Sparkles, Zap, Puzzle, Target, ShoppingBag,
  Trophy, CheckCircle2, RotateCcw, Play, Gift, Ticket, Shield, Crown, Flame
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { CheckInState, ShopItem } from '../types';

interface StudyArcadeModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  initialTab?: 'checkin' | 'wheel' | 'quiz' | 'memory' | 'catch10' | 'shop';
}

interface QuizQuestion {
  q: string;
  subject: 'Toán' | 'Tiếng Anh' | 'Logic V-ACT' | 'Vật Lý' | 'Hóa Học';
  options: string[];
  answer: number;
}

const QUIZ_BANK: QuizQuestion[] = [
  {
    q: 'Đạo hàm của hàm số y = x³ - 3x² + 2 tại x = 2 bằng bao nhiêu?',
    subject: 'Toán',
    options: ['0', '2', '-2', '4'],
    answer: 0
  },
  {
    q: 'Choose the word closest in meaning to "UBIQUITOUS":',
    subject: 'Tiếng Anh',
    options: ['Rare', 'Omnipresent', 'Temporary', 'Fragile'],
    answer: 1
  },
  {
    q: 'Dãy số: 2, 6, 12, 20, 30, ... Số tiếp theo trong quy luật V-ACT là?',
    subject: 'Logic V-ACT',
    options: ['38', '40', '42', '44'],
    answer: 2
  },
  {
    q: 'Nguyên hàm của hàm số f(x) = cos(x) là:',
    subject: 'Toán',
    options: ['-sin(x) + C', 'sin(x) + C', 'tan(x) + C', '-cos(x) + C'],
    answer: 1
  },
  {
    q: 'If she ___ harder, she would have passed the V-ACT exam.',
    subject: 'Tiếng Anh',
    options: ['studied', 'studies', 'had studied', 'would study'],
    answer: 2
  },
  {
    q: 'Chu kỳ dao động của con lắc đơn chiều dài l tại nơi có gia tốc g là:',
    subject: 'Vật Lý',
    options: ['T = 2π√(l/g)', 'T = 2π√(g/l)', 'T = √(l/g)', 'T = 1/(2π)√(l/g)'],
    answer: 0
  },
  {
    q: 'Kim loại nào sau đây có tính dẫn điện tốt nhất?',
    subject: 'Hóa Học',
    options: ['Đồng (Cu)', 'Vàng (Au)', 'Bạc (Ag)', 'Nhôm (Al)'],
    answer: 2
  },
  {
    q: 'Giá trị của log₂(32) bằng:',
    subject: 'Toán',
    options: ['4', '5', '6', '8'],
    answer: 1
  },
  {
    q: 'Tất cả hoa hồng đều là hoa. Một số bông hoa nhanh tàn. Kết luận nào luôn đúng?',
    subject: 'Logic V-ACT',
    options: [
      'Mọi hoa hồng đều nhanh tàn',
      'Hoa hồng thuộc tập hợp các loài hoa',
      'Không có hoa hồng nào nhanh tàn',
      'Hoa nhanh tàn đều là hoa hồng'
    ],
    answer: 1
  },
  {
    q: 'She is looking forward ___ her university admission results.',
    subject: 'Tiếng Anh',
    options: ['to receive', 'receiving', 'to receiving', 'receive'],
    answer: 2
  },
  {
    q: 'Số phức liên hợp của z = 3 - 4i là:',
    subject: 'Toán',
    options: ['-3 + 4i', '3 + 4i', '-3 - 4i', '4 - 3i'],
    answer: 1
  },
  {
    q: 'Trong chân không, sóng điện từ có bước sóng nào sau đây là tia tử ngoại?',
    subject: 'Vật Lý',
    options: ['10 nm', '550 nm', '1 mm', '10 m'],
    answer: 0
  }
];

interface MemoryPair {
  id: string;
  left: string;
  right: string;
  category: string;
}

const MEMORY_PAIRS: MemoryPair[] = [
  { id: 'p1', left: '∫ sin(x) dx', right: '-cos(x) + C', category: 'Toán' },
  { id: 'p2', left: 'sin²x + cos²x', right: '1', category: 'Toán' },
  { id: 'p3', left: 'E = mc²', right: 'Năng lượng nghỉ', category: 'Lý' },
  { id: 'p4', left: 'U = I × R', right: 'Định luật Ohm', category: 'Lý' },
  { id: 'p5', left: 'Resilient', right: 'Kiên cường, bền bỉ', category: 'Anh' },
  { id: 'p6', left: 'logₐ(x·y)', right: 'logₐx + logₐy', category: 'Toán' }
];

interface MemoryCard {
  uid: string;
  pairId: string;
  text: string;
  category: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface SpawnedTarget {
  id: string;
  x: number;
  y: number;
  type: 'ten' | 'valedictorian' | 'bomb' | 'sleep';
  label: string;
  coins: number;
}

const WHEEL_SEGMENTS = [
  { id: 'w1', label: '+10 Coin', type: 'coin' as const, amount: 10, color: 'from-slate-600 to-slate-700', prob: 0.30 },
  { id: 'w2', label: '+50 Coin', type: 'coin' as const, amount: 50, color: 'from-indigo-600 to-blue-600', prob: 0.32 },
  { id: 'w3', label: '+100 Coin', type: 'coin' as const, amount: 100, color: 'from-purple-600 to-pink-600', prob: 0.20 },
  { id: 'w4', label: '+200 Coin', type: 'coin' as const, amount: 200, color: 'from-amber-500 to-orange-600', prob: 0.10 },
  { id: 'w5', label: '🎟️ 1 Vé Mở Khóa VIP', type: 'ticket' as const, amount: 1, color: 'from-emerald-500 to-teal-600', prob: 0.08 }
];

const CHECKIN_REWARDS = [
  { day: 1, coins: 20, bonus: 'Khởi đầu chăm chỉ' },
  { day: 2, coins: 30, bonus: 'Tăng tốc ôn luyện' },
  { day: 3, coins: 50, bonus: 'Bứt phá năng lượng' },
  { day: 4, coins: 70, bonus: 'Giữ vững phong độ' },
  { day: 5, coins: 100, bonus: 'Chiến binh học tập' },
  { day: 6, coins: 150, bonus: 'Sát thủ đề thi' },
  { day: 7, coins: 200, bonus: '+1 Vé Mở Khóa VIP 🎟️', vipTicket: true }
];

export const StudyArcadeModal: React.FC<StudyArcadeModalProps> = ({
  isOpen,
  onClose,
  showToast,
  initialTab = 'checkin'
}) => {
  const [activeTab, setActiveTab] = useState<'checkin' | 'wheel' | 'quiz' | 'memory' | 'catch10' | 'shop'>(initialTab);
  const [coins, setCoins] = useState<number>(() => StorageService.getCoins());
  const [vipTickets, setVipTickets] = useState<number>(() => StorageService.getVipTickets());
  const [checkIn, setCheckIn] = useState<CheckInState>(() => StorageService.getCheckInState());
  const [shopItems, setShopItems] = useState<ShopItem[]>(() => StorageService.getShopItems());
  const [cosmetics, setCosmetics] = useState(() => StorageService.getUserCosmetics());

  // Wheel State
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [lastWheelPrize, setLastWheelPrize] = useState<string | null>(null);
  const [freeSpinUsedToday, setFreeSpinUsedToday] = useState<boolean>(() => {
    const today = new Date().toISOString().split('T')[0];
    return localStorage.getItem('studyhub_free_spin_date') === today;
  });

  // Quiz State
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizTimeLeft, setQuizTimeLeft] = useState(60);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizEarnedCoins, setQuizEarnedCoins] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Memory Game State
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  // Catch 10 Game State
  const [catchRunning, setCatchRunning] = useState(false);
  const [catchTimeLeft, setCatchTimeLeft] = useState(30);
  const [catchScore, setCatchScore] = useState(0);
  const [targets, setTargets] = useState<SpawnedTarget[]>([]);
  const catchIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      refreshEconomyState();
    }
  }, [isOpen, initialTab]);

  const refreshEconomyState = () => {
    setCoins(StorageService.getCoins());
    setVipTickets(StorageService.getVipTickets());
    setCheckIn(StorageService.getCheckInState());
    setShopItems(StorageService.getShopItems());
    setCosmetics(StorageService.getUserCosmetics());
  };

  useEffect(() => {
    const unsub = StorageService.subscribe((event) => {
      if (
        event.startsWith('coins') ||
        event === 'checkin' ||
        event === 'shop' ||
        event === 'SHOP_UPDATED' ||
        event === 'user_profile' ||
        event === 'vip_tickets'
      ) {
        refreshEconomyState();
      }
    });
    return unsub;
  }, []);

  // Quiz Timer Effect
  useEffect(() => {
    if (!quizRunning) return;
    if (quizTimeLeft <= 0) {
      setQuizRunning(false);
      setQuizFinished(true);
      return;
    }
    const timer = window.setTimeout(() => setQuizTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [quizRunning, quizTimeLeft]);

  // Catch 10 Timer & Spawner Effect
  useEffect(() => {
    if (!catchRunning) {
      if (catchIntervalRef.current) clearInterval(catchIntervalRef.current);
      return;
    }
    if (catchTimeLeft <= 0) {
      setCatchRunning(false);
      setTargets([]);
      if (catchScore > 0) {
        const prevBalance = StorageService.getCoins();
        const nextBalance = StorageService.addCoins(catchScore);
        const actualAdded = Math.max(catchScore, nextBalance - prevBalance);
        setCoins(nextBalance);
        showToast(`🎯 Kết thúc! Bạn săn được +${actualAdded} S-Coin!`, 'success');
      } else {
        showToast('🎯 Hết giờ! Hãy thử lại để săn thêm Điểm 10 nhé!', 'info');
      }
      return;
    }

    const countdown = window.setTimeout(() => setCatchTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(countdown);
  }, [catchRunning, catchTimeLeft, catchScore, showToast]);

  useEffect(() => {
    if (!catchRunning) return;
    const spawner = window.setInterval(() => {
      const rand = Math.random();
      let type: SpawnedTarget['type'] = 'ten';
      let label = '💯 Điểm 10 (+10)';
      let coinVal = 10;

      if (rand > 0.82) {
        type = 'valedictorian';
        label = '👑 Thủ Khoa (+25)';
        coinVal = 25;
      } else if (rand > 0.62) {
        type = 'bomb';
        label = '💣 Điểm Liệt (-15)';
        coinVal = -15;
      } else if (rand > 0.48) {
        type = 'sleep';
        label = '😴 Ngủ Gật (-10)';
        coinVal = -10;
      }

      const newTarget: SpawnedTarget = {
        id: `t-${Date.now()}-${Math.random()}`,
        x: Math.floor(Math.random() * 76) + 8,
        y: Math.floor(Math.random() * 68) + 12,
        type,
        label,
        coins: coinVal
      };

      setTargets((prev) => [...prev.slice(-6), newTarget]);
    }, 650);

    return () => clearInterval(spawner);
  }, [catchRunning]);

  // Initialize Memory Cards
  const initMemoryGame = () => {
    const deck: MemoryCard[] = [];
    MEMORY_PAIRS.forEach((pair) => {
      deck.push({
        uid: `${pair.id}-L`,
        pairId: pair.id,
        text: pair.left,
        category: pair.category,
        isFlipped: false,
        isMatched: false
      });
      deck.push({
        uid: `${pair.id}-R`,
        pairId: pair.id,
        text: pair.right,
        category: pair.category,
        isFlipped: false,
        isMatched: false
      });
    });
    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setMemoryCards(deck);
    setFlippedIndices([]);
    setMemoryMoves(0);
    setMemoryWon(false);
  };

  useEffect(() => {
    if (activeTab === 'memory' && memoryCards.length === 0) {
      initMemoryGame();
    }
  }, [activeTab, memoryCards.length]);

  if (!isOpen) return null;

  // Handlers
  const handleClaimCheckIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = StorageService.claimDailyCheckIn();
    refreshEconomyState();
    showToast(res.message, res.success ? 'success' : 'warning');
  };

  const handleSpinWheel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpinning) return;

    const today = new Date().toISOString().split('T')[0];
    if (!freeSpinUsedToday) {
      localStorage.setItem('studyhub_free_spin_date', today);
      setFreeSpinUsedToday(true);
    } else {
      const spend = StorageService.spendCoins(20);
      if (!spend.success) {
        showToast('Bạn cần tối thiểu 20 S-Coin để quay thêm lượt!', 'warning');
        return;
      }
      setCoins(spend.newBalance);
    }

    setIsSpinning(true);
    setLastWheelPrize(null);

    // Weighted random selection
    const r = Math.random();
    let acc = 0;
    let chosenIndex = 0;
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
      acc += WHEEL_SEGMENTS[i].prob;
      if (r <= acc) {
        chosenIndex = i;
        break;
      }
    }

    const chosen = WHEEL_SEGMENTS[chosenIndex];
    const extraSpins = 360 * 5;
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const targetRotation = wheelRotation + extraSpins + (360 - chosenIndex * segmentAngle);
    setWheelRotation(targetRotation);

    setTimeout(() => {
      setIsSpinning(false);
      if (chosen.type === 'coin') {
        const prevBalance = StorageService.getCoins();
        const nextBalance = StorageService.addCoins(chosen.amount);
        const actualAdded = Math.max(chosen.amount, nextBalance - prevBalance);
        setCoins(nextBalance);
        setLastWheelPrize(`🎉 Chúc mừng! Bạn quay trúng +${actualAdded} S-Coin!`);
        showToast(`🎡 Trúng lớn: +${actualAdded} S-Coin!`, 'success');
      } else {
        const totalTickets = StorageService.addVipTickets(1);
        setVipTickets(totalTickets);
        setLastWheelPrize('🎟️ SIÊU PHẨM! Bạn nhận được 1 Vé Mở Khóa Tài Liệu VIP!');
        showToast('🎟️ Bạn vừa trúng 1 Vé Mở Khóa Tài Liệu VIP!', 'success');
      }
    }, 2800);
  };

  const startQuizBlitz = () => {
    setQuizRunning(true);
    setQuizTimeLeft(60);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizEarnedCoins(0);
    setQuizFinished(false);
  };

  const handleAnswerQuiz = (optionIdx: number) => {
    if (!quizRunning) return;
    const currentQ = QUIZ_BANK[quizIndex % QUIZ_BANK.length];
    if (optionIdx === currentQ.answer) {
      const prevBalance = StorageService.getCoins();
      const nextBalance = StorageService.addCoins(15);
      const actualAdded = Math.max(15, nextBalance - prevBalance);
      setCoins(nextBalance);
      setQuizScore((s) => s + 1);
      setQuizEarnedCoins((c) => c + actualAdded);
      showToast(`⚡ Chính xác! +${actualAdded} S-Coin`, 'success');
    } else {
      showToast('Chưa chính xác! Cố lên câu tiếp theo nhé!', 'warning');
    }

    if (quizIndex + 1 >= QUIZ_BANK.length) {
      setQuizRunning(false);
      setQuizFinished(true);
    } else {
      setQuizIndex((i) => i + 1);
    }
  };

  const handleFlipMemoryCard = (idx: number) => {
    if (memoryWon || flippedIndices.length >= 2) return;
    const card = memoryCards[idx];
    if (card.isFlipped || card.isMatched) return;

    const updated = [...memoryCards];
    updated[idx] = { ...card, isFlipped: true };
    setMemoryCards(updated);

    const nextFlipped = [...flippedIndices, idx];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextFlipped;
      const firstCard = updated[firstIdx];
      const secondCard = updated[secondIdx];

      if (firstCard.pairId === secondCard.pairId) {
        setTimeout(() => {
          setMemoryCards((prev) => {
            const matchedDeck = prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isMatched: true } : c
            );
            const allDone = matchedDeck.every((c) => c.isMatched);
            if (allDone && !memoryWon) {
              setMemoryWon(true);
              const prevBalance = StorageService.getCoins();
              const nextBalance = StorageService.addCoins(40);
              const actualAdded = Math.max(40, nextBalance - prevBalance);
              setCoins(nextBalance);
              showToast(`🧩 Xuất sắc! Bạn ghép xong toàn bộ công thức và nhận +${actualAdded} S-Coin!`, 'success');
            }
            return matchedDeck;
          });
          setFlippedIndices([]);
        }, 350);
      } else {
        setTimeout(() => {
          setMemoryCards((prev) =>
            prev.map((c, i) =>
              i === firstIdx || i === secondIdx ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedIndices([]);
        }, 750);
      }
    }
  };

  const startCatch10Game = () => {
    setCatchRunning(true);
    setCatchTimeLeft(30);
    setCatchScore(0);
    setTargets([]);
  };

  const handleClickTarget = (target: SpawnedTarget, e: React.MouseEvent) => {
    e.stopPropagation();
    setTargets((prev) => prev.filter((t) => t.id !== target.id));
    setCatchScore((s) => Math.max(0, s + target.coins));
  };

  const handleBuyOrEquipShopItem = (item: ShopItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetValue =
      item.type === 'title'
        ? item.badgeText || item.name
        : item.frameImageUrl || item.frameClass || '';
    const isOwned =
      (item.type === 'title' && cosmetics.unlockedTitles.includes(targetValue)) ||
      (item.type === 'frame' &&
        (cosmetics.unlockedFrames.includes(targetValue) ||
          (item.frameClass ? cosmetics.unlockedFrames.includes(item.frameClass) : false)));

    if (isOwned && (item.type === 'title' || item.type === 'frame')) {
      StorageService.equipCosmetic(item.type, item.frameClass || targetValue, item.frameImageUrl);
      refreshEconomyState();
      showToast(`✨ Đã trang bị "${item.name}"!`, 'success');
      return;
    }

    const res = StorageService.purchaseShopItem(item.id);
    refreshEconomyState();
    showToast(res.message, res.success ? 'success' : 'warning');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const checkedInToday = checkIn.lastCheckInDate === todayStr;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900/95 border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Gift className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  TRUNG TÂM ĐIỂM DANH & SĂN S-COIN
                </h2>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  STUDY ARCADE v5.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Điểm danh mỗi ngày, giải trí đấu trí sau giờ học để tích S-Coin mở khóa kho đề thi VIP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* VIP Ticket Badge */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span>{vipTickets} Vé VIP</span>
            </div>

            {/* Coin Wallet Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-sm shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{coins.toLocaleString()} S-Coin</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-950/60 border-b border-white/10 overflow-x-auto no-scrollbar">
          {[
            { id: 'checkin', label: '📅 Điểm Danh 7 Ngày', icon: Calendar },
            { id: 'wheel', label: '🎡 Vòng Quay Nhân Phẩm', icon: Sparkles },
            { id: 'quiz', label: '⚡ Đấu Trường 60s', icon: Zap },
            { id: 'memory', label: '🧩 Lật Thẻ Công Thức', icon: Puzzle },
            { id: 'catch10', label: '🎯 Săn Điểm 10', icon: Target },
            { id: 'shop', label: '🏪 Cửa Hàng Đổi Thưởng', icon: ShoppingBag }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                  active
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/25'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 7-DAY CHECK-IN */}
          {activeTab === 'checkin' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-amber-900/30 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-400" />
                    Chuỗi Điểm Danh Hàng Ngày Của Sĩ Tử
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Điểm danh đủ 7 ngày liên tiếp để nhận tổng cộng <strong className="text-amber-300">620 S-Coin</strong> + <strong className="text-emerald-300">1 Vé Mở Khóa Tài Liệu VIP</strong>!
                  </p>
                </div>

                <button
                  type="button"
                  disabled={checkedInToday}
                  onClick={handleClaimCheckIn}
                  className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2 transition-all shadow-xl ${
                    checkedInToday
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-amber-500/30 hover:scale-105'
                  }`}
                >
                  {checkedInToday ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Đã Điểm Danh Hôm Nay</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5" />
                      <span>Nhận Quà Điểm Danh Ngay</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                {CHECKIN_REWARDS.map((item) => {
                  const isClaimed = checkIn.claimedDays.includes(item.day);
                  const isNext = !checkedInToday && ((checkIn.consecutiveDays % 7) + 1 === item.day);
                  return (
                    <div
                      key={item.day}
                      className={`relative p-4 rounded-2xl border flex flex-col items-center text-center transition-all ${
                        isClaimed
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                          : isNext
                          ? 'bg-gradient-to-b from-amber-500/25 to-orange-600/20 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                          : 'bg-slate-800/60 border-white/10 text-slate-400'
                      }`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/30 mb-3">
                        Ngày {item.day}
                      </span>

                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mb-2">
                        {item.vipTicket ? (
                          <Crown className="w-6 h-6 text-amber-300" />
                        ) : (
                          <Coins className="w-6 h-6 text-amber-400" />
                        )}
                      </div>

                      <div className="text-base font-black text-white">+{item.coins} Coin</div>
                      <div className="text-[11px] text-slate-300 mt-1 line-clamp-2">{item.bonus}</div>

                      {isClaimed && (
                        <div className="mt-3 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đã nhận
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: LUCKY SPIN WHEEL */}
          {activeTab === 'wheel' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-950/60 border border-white/10">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                  {/* Pointer */}
                  <div className="absolute -top-3 z-20 w-6 h-8 bg-amber-400 clip-triangle shadow-lg rounded-b-full border-2 border-slate-950" />

                  {/* Rotating Wheel */}
                  <div
                    style={{
                      transform: `rotate(${wheelRotation}deg)`,
                      transition: isSpinning ? 'transform 2.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                    }}
                    className="w-full h-full rounded-full border-8 border-amber-400/80 shadow-2xl shadow-amber-500/20 bg-gradient-to-tr from-indigo-900 via-purple-900 to-amber-900 flex items-center justify-center relative overflow-hidden"
                  >
                    {WHEEL_SEGMENTS.map((seg, idx) => {
                      const angle = (360 / WHEEL_SEGMENTS.length) * idx;
                      return (
                        <div
                          key={seg.id}
                          style={{ transform: `rotate(${angle}deg)` }}
                          className="absolute inset-0 flex flex-col items-center justify-start pt-5 text-center pointer-events-none"
                        >
                          <span className="px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-md text-xs font-black text-amber-300 border border-white/15">
                            {seg.label}
                          </span>
                        </div>
                      );
                    })}
                    <div className="w-16 h-16 rounded-full bg-slate-950 border-4 border-amber-400 flex items-center justify-center z-10 shadow-inner">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                  </div>
                </div>

                {lastWheelPrize && (
                  <div className="mt-5 px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-bold text-center">
                    {lastWheelPrize}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-black text-white">🎡 Vòng Quay Nhân Phẩm Sĩ Tử</h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Mỗi ngày bạn có <strong className="text-emerald-400">1 lượt quay MIỄN PHÍ</strong>. Các lượt tiếp theo chỉ tốn <strong className="text-amber-400">20 S-Coin/lượt</strong> với cơ hội trúng đến 200 S-Coin hoặc Vé Mở Khóa Tài Liệu VIP!
                </p>

                <div className="space-y-2">
                  {WHEEL_SEGMENTS.map((seg) => (
                    <div
                      key={seg.id}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs"
                    >
                      <span className="font-bold text-white">{seg.label}</span>
                      <span className="text-slate-400">Tỷ lệ: {Math.round(seg.prob * 100)}%</span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={handleSpinWheel}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 transition-all disabled:opacity-50"
                >
                  {isSpinning
                    ? '🎡 Đang quay vòng nhân phẩm...'
                    : !freeSpinUsedToday
                    ? '🎁 QUAY MIỄN PHÍ LƯỢT ĐẦU TRONG NGÀY'
                    : '🎡 QUAY NGAY (20 S-COIN / LƯỢT)'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: 60S SPEED QUIZ BLITZ */}
          {activeTab === 'quiz' && (
            <div className="p-6 rounded-3xl bg-slate-950/60 border border-white/10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    Đấu Trường Phản Xạ 60 Giây (Speed Quiz Blitz)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Trả lời nhanh các câu hỏi Toán, Anh, Lý, Hóa, Logic V-ACT. Mỗi câu đúng nhận ngay <strong className="text-amber-300">+15 S-Coin</strong>!
                  </p>
                </div>

                {quizRunning && (
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-black text-sm">
                      ⏱️ {quizTimeLeft}s
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-sm">
                      Đúng: {quizScore} câu (+{quizEarnedCoins} Coin)
                    </span>
                  </div>
                )}
              </div>

              {!quizRunning && !quizFinished && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-sm text-slate-300 max-w-md mx-auto">
                    Sẵn sàng thử thách tốc độ tư duy V-ACT & THPTQG trong 60 giây? Càng trả lời đúng nhiều, ví S-Coin càng đầy!
                  </p>
                  <button
                    type="button"
                    onClick={startQuizBlitz}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/25"
                  >
                    <Play className="w-4 h-4" /> BẮT ĐẦU ĐẤU TRƯỜNG 60S
                  </button>
                </div>
              )}

              {quizRunning && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold">
                      Môn: {QUIZ_BANK[quizIndex % QUIZ_BANK.length].subject}
                    </span>
                    <span>Câu {quizIndex + 1} / {QUIZ_BANK.length}</span>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-900 border border-white/10 text-base font-bold text-white">
                    {QUIZ_BANK[quizIndex % QUIZ_BANK.length].q}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUIZ_BANK[quizIndex % QUIZ_BANK.length].options.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAnswerQuiz(idx)}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-400/50 text-left text-sm font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-3"
                      >
                        <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-amber-400">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {quizFinished && (
                <div className="py-8 text-center space-y-4">
                  <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
                  <h4 className="text-xl font-black text-white">Hoàn thành Đấu Trường 60s!</h4>
                  <p className="text-sm text-slate-300">
                    Bạn trả lời đúng <strong className="text-emerald-400">{quizScore} câu</strong> và tích lũy được <strong className="text-amber-300">+{quizEarnedCoins} S-Coin</strong>!
                  </p>
                  <button
                    type="button"
                    onClick={startQuizBlitz}
                    className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Chơi Lại Lượt Mới
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MEMORY CARD MATCH */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Puzzle className="w-5 h-5 text-purple-400" />
                    Lật Thẻ Ghép Cặp Công Thức & Từ Vựng (+40 S-Coin)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lật 2 thẻ tương ứng nhau (Công thức - Kết quả hoặc Từ vựng - Nghĩa) để ăn điểm!
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-300">Số lượt lật: {memoryMoves}</span>
                  <button
                    type="button"
                    onClick={initMemoryGame}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Xáo bài mới
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.uid}
                    type="button"
                    onClick={() => handleFlipMemoryCard(idx)}
                    className={`h-24 p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
                      card.isMatched
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                        : card.isFlipped
                        ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-lg'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-white/10 text-slate-500'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? (
                      <>
                        <span className="text-[10px] font-bold uppercase text-amber-300 mb-1">
                          {card.category}
                        </span>
                        <span className="text-xs sm:text-sm font-black leading-snug">{card.text}</span>
                      </>
                    ) : (
                      <span className="text-xl">🎴</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CATCH THE 10+ REFLEX GAME */}
          {activeTab === 'catch10' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-white/10">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-rose-400" />
                    Săn Điểm 10 Đỏ Chói - Né Điểm Liệt (30 Giây)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Click thật nhanh vào <strong className="text-emerald-400">💯 Điểm 10 (+10)</strong>, <strong className="text-amber-300">👑 Thủ Khoa (+25)</strong> và tránh xa <strong className="text-rose-400">💣 Điểm Liệt / 😴 Ngủ Gật</strong>!
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {catchRunning ? (
                    <>
                      <span className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black">
                        ⏱️ {catchTimeLeft}s
                      </span>
                      <span className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black">
                        Giỏ điểm: +{catchScore} Coin
                      </span>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={startCatch10Game}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg"
                    >
                      <Play className="w-4 h-4" /> BẮT ĐẦU SĂN ĐIỂM 10
                    </button>
                  )}
                </div>
              </div>

              <div className="relative h-80 w-full rounded-3xl bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 border border-white/10 overflow-hidden select-none">
                {!catchRunning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                    <div className="text-4xl mb-3">🎯 💯 👑</div>
                    <p className="text-sm text-slate-300 max-w-md">
                      Bấm nút <strong>"BẮT ĐẦU SĂN ĐIỂM 10"</strong> ở góc phải phía trên để các mục tiêu xuất hiện. Toàn bộ điểm số sẽ quy đổi thẳng sang S-Coin khi hết 30 giây!
                    </p>
                  </div>
                )}

                {targets.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={(e) => handleClickTarget(t, e)}
                    style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-3.5 py-2 rounded-2xl font-black text-xs shadow-xl transition-transform active:scale-90 animate-bounce ${
                      t.type === 'valedictorian'
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 border-2 border-white'
                        : t.type === 'ten'
                        ? 'bg-emerald-500 text-slate-950 border border-emerald-200'
                        : 'bg-rose-600/90 text-white border border-rose-300'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: PRESTIGE SHOP */}
          {activeTab === 'shop' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 to-purple-500/15 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                    Cửa Hàng Đổi Thưởng Sĩ Tử (Coin Prestige Shop)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Đổi S-Coin lấy Danh Hiệu vinh danh trên Bảng Hỏi Bài & BXH, Khung Avatar phát sáng, hoặc Vé Mở Khóa Tài Liệu VIP!
                  </p>
                </div>
                <div className="text-xs text-amber-300 font-bold">
                  Danh hiệu đang dùng: <span className="px-2.5 py-1 rounded-lg bg-black/40 border border-amber-400/30">{cosmetics.equippedTitle || 'Chưa trang bị'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shopItems.map((item) => {
                  const targetVal =
                    item.type === 'title'
                      ? item.badgeText || item.name
                      : item.frameImageUrl || item.frameClass || '';
                  const isOwned =
                    (item.type === 'title' && cosmetics.unlockedTitles.includes(targetVal)) ||
                    (item.type === 'frame' &&
                      (cosmetics.unlockedFrames.includes(targetVal) ||
                        (item.frameClass ? cosmetics.unlockedFrames.includes(item.frameClass) : false)));
                  const isEquipped =
                    (item.type === 'title' && cosmetics.equippedTitle === targetVal) ||
                    (item.type === 'frame' &&
                      ((item.frameImageUrl && cosmetics.equippedFrameImageUrl === item.frameImageUrl) ||
                        (!item.frameImageUrl && cosmetics.equippedFrame === targetVal)));

                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-950/70 border border-white/10 hover:border-amber-500/40 flex flex-col justify-between gap-4 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          {item.type === 'frame' ? (
                            <div className="relative w-12 h-12 flex items-center justify-center">
                              <img
                                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"
                                alt={item.name}
                                className={`w-10 h-10 rounded-full object-cover ${item.frameClass || ''}`}
                              />
                              {item.frameImageUrl && (
                                <img
                                  src={item.frameImageUrl}
                                  alt="Frame"
                                  className="absolute inset-0 w-12 h-12 object-contain pointer-events-none scale-110"
                                />
                              )}
                            </div>
                          ) : (
                            <span className="text-3xl">{item.icon}</span>
                          )}
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black">
                            {item.priceCoins} S-Coin
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white">{item.name}</h4>
                        {item.type === 'title' && (
                          <div className="inline-block px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-orange-500/25 border border-amber-400/40 text-[11px] font-bold text-amber-300">
                            {item.badgeText || item.name}
                          </div>
                        )}
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleBuyOrEquipShopItem(item, e)}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                          isEquipped
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : isOwned && (item.type === 'title' || item.type === 'frame')
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            : 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Shield className="w-4 h-4" /> Đang Trang Bị
                          </>
                        ) : isOwned && (item.type === 'title' || item.type === 'frame') ? (
                          'Trang Bị Ngay'
                        ) : (
                          <>
                            <Coins className="w-4 h-4" /> Đổi Ngay ({item.priceCoins} Coin)
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
