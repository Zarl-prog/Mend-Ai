import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_REQUESTS = 500;
const COOLDOWN_MS = 3000;
const RESET_HOURS = 24;

const STORAGE_KEY = 'mend-ai_rate_limit';

function loadRateLimitState() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const data = JSON.parse(stored);
      const resetTime = data.firstRequestTime + (RESET_HOURS * 60 * 60 * 1000);
      if (Date.now() >= resetTime) {
        return { count: 0, firstRequestTime: null };
      }
      return data;
    } catch {
      return { count: 0, firstRequestTime: null };
    }
  }
  return { count: 0, firstRequestTime: null };
}

function saveRateLimitState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function useAIRateLimit() {
  const [rateLimitState, setRateLimitState] = useState(() => loadRateLimitState());
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimerRef = useRef(null);
  
  const isLimitReached = rateLimitState.count >= MAX_REQUESTS;
  const remainingRequests = Math.max(0, MAX_REQUESTS - rateLimitState.count);
  
  useEffect(() => {
    if (rateLimitState.firstRequestTime) {
      const resetTime = rateLimitState.firstRequestTime + (RESET_HOURS * 60 * 60 * 1000);
      const now = Date.now();
      const remaining = Math.max(0, resetTime - now);
      
      if (remaining <= 0) {
        setRateLimitState({ count: 0, firstRequestTime: null });
        saveRateLimitState({ count: 0, firstRequestTime: null });
      }
    }
  }, [rateLimitState.firstRequestTime]);
  
  const recordRequest = useCallback(() => {
    setRateLimitState(prev => {
      const newState = {
        count: prev.count + 1,
        firstRequestTime: prev.firstRequestTime || Date.now()
      };
      saveRateLimitState(newState);
      return newState;
    });
  }, []);
  
  const startCooldown = useCallback(() => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    
    setCooldownRemaining(COOLDOWN_MS);
    
    cooldownTimerRef.current = setInterval(() => {
      setCooldownRemaining(prev => {
        const newValue = prev - 100;
        if (newValue <= 0) {
          clearInterval(cooldownTimerRef.current);
          cooldownTimerRef.current = null;
          return 0;
        }
        return newValue;
      });
    }, 100);
  }, []);
  
  const canMakeRequest = !isLimitReached && cooldownRemaining === 0;
  
  return {
    recordRequest,
    startCooldown,
    canMakeRequest,
    isLimitReached,
    remainingRequests,
    cooldownRemaining,
    isOnCooldown: cooldownRemaining > 0
  };
}