import { useState, useCallback, useRef } from 'react';

/**
 * A client-side rate limiter hook that prevents rapid-fire actions.
 * 
 * @param {Object} options
 * @param {number} options.maxAttempts - Maximum number of attempts allowed in the time window
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.cooldownMs - Cooldown period after limit is hit (ms)
 * @returns {{ isRateLimited: boolean, remainingCooldown: number, checkRateLimit: () => boolean, recordAttempt: () => void }}
 */
export const useRateLimiter = ({
  maxAttempts = 3,
  windowMs = 60 * 1000,      // 1 minute default
  cooldownMs = 30 * 1000,    // 30 second cooldown default
} = {}) => {
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [remainingCooldown, setRemainingCooldown] = useState(0);
  const attemptsRef = useRef([]);
  const cooldownTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const startCooldown = useCallback((durationMs) => {
    setIsRateLimited(true);
    setRemainingCooldown(Math.ceil(durationMs / 1000));

    // Clear any existing timers
    if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    // Countdown timer for UI display
    countdownRef.current = setInterval(() => {
      setRemainingCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Unlock after cooldown
    cooldownTimerRef.current = setTimeout(() => {
      setIsRateLimited(false);
      setRemainingCooldown(0);
      clearInterval(countdownRef.current);
      // Clear old attempts
      attemptsRef.current = [];
    }, durationMs);
  }, []);

  /**
   * Check if the action is rate limited. Returns true if allowed, false if blocked.
   */
  const checkRateLimit = useCallback(() => {
    if (isRateLimited) return false;

    const now = Date.now();
    // Remove attempts outside the window
    attemptsRef.current = attemptsRef.current.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (attemptsRef.current.length >= maxAttempts) {
      startCooldown(cooldownMs);
      return false;
    }

    return true;
  }, [isRateLimited, windowMs, maxAttempts, cooldownMs, startCooldown]);

  /**
   * Record an attempt (call after checkRateLimit returns true)
   */
  const recordAttempt = useCallback(() => {
    attemptsRef.current.push(Date.now());
  }, []);

  return {
    isRateLimited,
    remainingCooldown,
    checkRateLimit,
    recordAttempt,
  };
};
