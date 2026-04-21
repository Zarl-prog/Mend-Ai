import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { initSessionMiddleware, startSessionRefresh, stopSessionRefresh } from '../services/sessionManager'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initSessionMiddleware();
    
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!isMounted) return;
        if (error) {
          setUser(null);
        } else {
          setUser(user ?? null);
          if (user) await fetchProfile(user.id);
        }
      } catch (e) {
        console.error('Auth init error:', e);
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    initAuth();

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', session.user.id)
            .single()

          if (!data) {
            await supabase.from('profiles').insert({
              id: session.user.id,
              display_name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split('@')[0] ||
                'User'
            })
          }
          fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (data) {
      setProfile(data)
    } else {
      const newProfile = {
        id: userId,
        display_name: user?.email?.split('@')[0] || 'User',
        theme: 'dark',
        grid_type: 'square',
        grid_size: 'medium',
        default_color: '#6C47FF',
        default_font_size: 13,
        snap_to_grid: true,
        auto_save: true
      }
      await supabase.from('profiles').insert(newProfile)
      setProfile(newProfile)
    }
  }

  const updateProfile = async (updates) => {
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (data) setProfile(data)
  }

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) throw error
    return data
  }

  const signUpWithEmail = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    })
    if (error) throw error

    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          display_name: displayName || email.split('@')[0],
          theme: 'dark',
          grid_type: 'square',
          grid_size: 'medium',
          default_color: '#6C47FF',
          default_font_size: 13,
          snap_to_grid: true,
          auto_save: true
        })
      if (profileError) console.error('Profile error:', profileError)
    }
    return data
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    })
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signInWithEmail, signUpWithEmail,
      signInWithGoogle, signOut, updateProfile,
      resetPassword, fetchProfile
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)