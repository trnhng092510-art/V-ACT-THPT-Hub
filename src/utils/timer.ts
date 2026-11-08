/**
 * Timer, countdown and session utilities for V-ACT & THPTQG Study Hub
 */

export const GRACE_PERIOD_SECONDS = 180; // 3 minutes grace period to combat idle/fake sessions

/**
 * Format seconds into HH:mm:ss or mm:ss
 */
export function formatTime(totalSeconds: number, includeHours = true): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (includeHours || hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Calculate Grace Period progress (first 180 seconds in workspace)
 */
export function calculateGracePeriod(sessionSeconds: number): {
  isGraceActive: boolean;
  remainingGraceSeconds: number;
  graceProgressPercent: number;
  effectiveStudySeconds: number;
} {
  const safeSession = Math.max(0, Math.floor(sessionSeconds));
  const isGraceActive = safeSession < GRACE_PERIOD_SECONDS;
  const remainingGraceSeconds = isGraceActive ? GRACE_PERIOD_SECONDS - safeSession : 0;
  const graceProgressPercent = Math.min(100, Math.round((safeSession / GRACE_PERIOD_SECONDS) * 100));
  const effectiveStudySeconds = isGraceActive ? 0 : safeSession - GRACE_PERIOD_SECONDS;

  return {
    isGraceActive,
    remainingGraceSeconds,
    graceProgressPercent,
    effectiveStudySeconds,
  };
}

/**
 * Calculate countdown breakdown for an upcoming target date
 */
export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  totalSeconds: number;
}

export function calculateCountdown(targetDate: string | Date, now: Date = new Date()): CountdownResult {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate;
  const diffMs = target.getTime() - now.getTime();

  if (isNaN(diffMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  }

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    totalSeconds,
  };
}

/**
 * Generate a clean 6-digit random user identifier
 */
export function generateUid(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `UID-${num}`;
}

export const DAILY_STREAK_REQUIRED_SECONDS = 300; // 5 minutes required to activate daily streak

/**
 * Pure calculation for 5-minute (300s) daily study streak activation
 */
export function calculateDailyStreakProgress(todayStudySeconds: number): {
  isCompleted: boolean;
  remainingSeconds: number;
  progressPercent: number;
} {
  const safeSecs = Math.max(0, Math.floor(todayStudySeconds));
  const isCompleted = safeSecs >= DAILY_STREAK_REQUIRED_SECONDS;
  const remainingSeconds = isCompleted ? 0 : DAILY_STREAK_REQUIRED_SECONDS - safeSecs;
  const progressPercent = Math.min(
    100,
    Math.round((safeSecs / DAILY_STREAK_REQUIRED_SECONDS) * 100)
  );
  return { isCompleted, remainingSeconds, progressPercent };
}

/**
 * Pure calculation for timed S-Coin material unlock expiration
 */
export function calculateUnlockExpiration(
  unlockedAtMs: number,
  durationHours: number,
  nowMs: number = Date.now()
): {
  expiresAtMs: number | null;
  isExpired: boolean;
  remainingMs: number | null;
} {
  if (!durationHours || durationHours <= 0) {
    return { expiresAtMs: null, isExpired: false, remainingMs: null };
  }
  const expiresAtMs = unlockedAtMs + durationHours * 3600 * 1000;
  const remainingMs = Math.max(0, expiresAtMs - nowMs);
  return {
    expiresAtMs,
    isExpired: nowMs >= expiresAtMs,
    remainingMs,
  };
}

