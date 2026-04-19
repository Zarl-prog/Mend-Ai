import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
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
    const { error } = await supabase.auth.signInWithPassword({
      email, password
    })
    if (error) throw error
  }

  const signUpWithEmail = async (email, password, displayName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName }
      }
    })
    if (error) throw error
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
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