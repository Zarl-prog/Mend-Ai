import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_REQUESTS = 500;
const COOLDOWN_MS = 3000;
const RESET_HOURS = 24;

const STORAGE_KEY = 'canvasai_rate_limit';

function loadRateLimitState() {
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
  const cooldownIntervalRef = useRef(null);
  
  const isLimitReached = rateLimitState.count >= MAX_REQUESTS;
  const remainingRequests = Math.max(0, MAX_REQUESTS - rateLimitState.count);
  
  useEffect(() => {
    if (rateLimitState.firstRequestTime) {
      const resetTime = rateLimitState.firstRequestTime + (RESET_HOURS * 60 * 60 * 1000);
      const now = Date.now();
      const remaining = Math.max(0, resetTime - now);
      
      if (remaining > 0) {
        const remainingMinutes = Math.ceil(remaining / 60000);
        
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        
        setCooldownRemaining(remaining);
        
        cooldownIntervalRef.current = setInterval(() => {
          const now = Date.now();
          const remainingMs = Math.max(0, resetTime - now);
          setCooldownRemaining(remainingMs);
          
          if (remainingMs === 0) {
            clearInterval(cooldownIntervalRef.current);
            setRateLimitState({ count: 0, firstRequestTime: null });
            saveRateLimitState({ count: 0, firstRequestTime: null });
          }
        }, 1000);
        
        return () => {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        };
      } else {
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
    setCooldownRemaining(COOLDOWN_MS);
    
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining(prev => {
        const newValue = prev - 1000;
        if (newValue <= 0) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return newValue;
      });
    }, 1000);
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