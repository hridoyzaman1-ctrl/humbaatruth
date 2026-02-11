import { useState, useCallback, useEffect } from 'react';

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
}

interface RateLimiterState {
  attempts: number;
  firstAttemptTime: number | null;
  lockedUntil: number | null;
}

const STORAGE_KEY = 'truthlens_rate_limit';

const getStoredState = (): RateLimiterState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return { attempts: 0, firstAttemptTime: null, lockedUntil: null };
};

const saveState = (state: RateLimiterState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const useRateLimiter = (config: RateLimiterConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 30 * 60 * 1000, // 30 minutes lockout
}) => {
  const [state, setState] = useState<RateLimiterState>(getStoredState);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Check and update lockout status
  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      
      if (state.lockedUntil && now < state.lockedUntil) {
        setRemainingTime(Math.ceil((state.lockedUntil - now) / 1000));
      } else if (state.lockedUntil && now >= state.lockedUntil) {
        // Lockout expired, reset state
        const newState = { attempts: 0, firstAttemptTime: null, lockedUntil: null };
        setState(newState);
        saveState(newState);
        setRemainingTime(0);
      } else if (state.firstAttemptTime && now - state.firstAttemptTime > config.windowMs) {
        // Window expired, reset attempts
        const newState = { attempts: 0, firstAttemptTime: null, lockedUntil: null };
        setState(newState);
        saveState(newState);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 1000);
    return () => clearInterval(interval);
  }, [state, config.windowMs]);

  const isLocked = state.lockedUntil !== null && Date.now() < state.lockedUntil;
  const attemptsRemaining = config.maxAttempts - state.attempts;

  const recordAttempt = useCallback((success: boolean) => {
    if (success) {
      // Reset on successful login
      const newState = { attempts: 0, firstAttemptTime: null, lockedUntil: null };
      setState(newState);
      saveState(newState);
      return;
    }

    const now = Date.now();
    let newState = { ...state };

    // Check if we need to reset the window
    if (state.firstAttemptTime && now - state.firstAttemptTime > config.windowMs) {
      newState = { attempts: 0, firstAttemptTime: null, lockedUntil: null };
    }

    // Record the failed attempt
    newState.attempts += 1;
    if (!newState.firstAttemptTime) {
      newState.firstAttemptTime = now;
    }

    // Check if we've exceeded max attempts
    if (newState.attempts >= config.maxAttempts) {
      newState.lockedUntil = now + config.lockoutMs;
    }

    setState(newState);
    saveState(newState);
  }, [state, config.maxAttempts, config.windowMs, config.lockoutMs]);

  const reset = useCallback(() => {
    const newState = { attempts: 0, firstAttemptTime: null, lockedUntil: null };
    setState(newState);
    saveState(newState);
    setRemainingTime(0);
  }, []);

  const formatRemainingTime = () => {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    isLocked,
    attemptsRemaining,
    remainingTime,
    formatRemainingTime,
    recordAttempt,
    reset,
  };
};
