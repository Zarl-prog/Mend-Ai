import { supabase } from './supabaseClient';

let refreshInterval = null;
const SESSION_REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

export const startSessionRefresh = () => {
  if (refreshInterval) return;
  
  refreshInterval = setInterval(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await supabase.auth.refreshSession();
      console.log('Session refreshed');
    }
  }, SESSION_REFRESH_INTERVAL);
};

export const stopSessionRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
};

export const initSessionMiddleware = () => {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      startSessionRefresh();
    } else if (event === 'SIGNED_OUT') {
      stopSessionRefresh();
    }
  });
  
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      startSessionRefresh();
    }
  });
};

export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) {
    console.error('Session refresh failed:', error.message);
    return null;
  }
  return data.session;
};