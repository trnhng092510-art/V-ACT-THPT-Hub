import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  calculateGracePeriod,
  calculateCountdown,
  GRACE_PERIOD_SECONDS,
  DAILY_STREAK_REQUIRED_SECONDS,
  calculateDailyStreakProgress,
  calculateUnlockExpiration,
  generateUid,
} from './timer.js';

test('formatTime formats seconds properly with hours and minutes', () => {
  assert.equal(formatTime(0), '00:00:00');
  assert.equal(formatTime(65), '00:01:05');
  assert.equal(formatTime(3665), '01:01:05');
  assert.equal(formatTime(86400), '24:00:00');
});

test('calculateGracePeriod enforces 180s grace threshold', () => {
  const start = calculateGracePeriod(0);
  assert.equal(start.isGraceActive, true);
  assert.equal(start.remainingGraceSeconds, 180);
  assert.equal(start.effectiveStudySeconds, 0);
  assert.equal(start.graceProgressPercent, 0);

  const half = calculateGracePeriod(90);
  assert.equal(half.isGraceActive, true);
  assert.equal(half.remainingGraceSeconds, 90);
  assert.equal(half.effectiveStudySeconds, 0);
  assert.equal(half.graceProgressPercent, 50);

  const completed = calculateGracePeriod(GRACE_PERIOD_SECONDS);
  assert.equal(completed.isGraceActive, false);
  assert.equal(completed.remainingGraceSeconds, 0);
  assert.equal(completed.effectiveStudySeconds, 0);
  assert.equal(completed.graceProgressPercent, 100);

  const active = calculateGracePeriod(200);
  assert.equal(active.isGraceActive, false);
  assert.equal(active.remainingGraceSeconds, 0);
  assert.equal(active.effectiveStudySeconds, 20);
});

test('calculateDailyStreakProgress enforces 300s (5-minute) daily streak threshold', () => {
  const initial = calculateDailyStreakProgress(0);
  assert.equal(initial.isCompleted, false);
  assert.equal(initial.remainingSeconds, 300);
  assert.equal(initial.progressPercent, 0);

  const mid = calculateDailyStreakProgress(150);
  assert.equal(mid.isCompleted, false);
  assert.equal(mid.remainingSeconds, 150);
  assert.equal(mid.progressPercent, 50);

  const done = calculateDailyStreakProgress(DAILY_STREAK_REQUIRED_SECONDS);
  assert.equal(done.isCompleted, true);
  assert.equal(done.remainingSeconds, 0);
  assert.equal(done.progressPercent, 100);
});

test('calculateUnlockExpiration handles permanent and timed S-Coin unlocks', () => {
  const baseTime = 1_700_000_000_000;
  const permanent = calculateUnlockExpiration(baseTime, 0, baseTime + 999_999_999);
  assert.equal(permanent.expiresAtMs, null);
  assert.equal(permanent.isExpired, false);

  const active24h = calculateUnlockExpiration(baseTime, 24, baseTime + 12 * 3600 * 1000);
  assert.equal(active24h.isExpired, false);
  assert.equal(active24h.remainingMs, 12 * 3600 * 1000);

  const expired24h = calculateUnlockExpiration(baseTime, 24, baseTime + 25 * 3600 * 1000);
  assert.equal(expired24h.isExpired, true);
  assert.equal(expired24h.remainingMs, 0);
});

test('calculateCountdown accurately breaks down future dates', () => {
  const base = new Date('2026-06-01T00:00:00Z');
  const now = new Date('2026-05-31T22:30:00Z');
  const countdown = calculateCountdown(base, now);

  assert.equal(countdown.isPast, false);
  assert.equal(countdown.days, 0);
  assert.equal(countdown.hours, 1);
  assert.equal(countdown.minutes, 30);
  assert.equal(countdown.seconds, 0);
  assert.equal(countdown.totalSeconds, 5400);
});

test('generateUid returns valid format UID-XXXXXX', () => {
  const uid = generateUid();
  assert.match(uid, /^UID-\d{6}$/);
});

