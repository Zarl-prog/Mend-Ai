import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'mend-ai_profile'

const defaultProfile = {
  id: 'guest',
  display_name: 'Guest',
  email: '',
  theme: 'dark',
  grid_type: 'square',
  grid_size: 'medium',
  default_color: '#6C47FF',
  default_font_size: 16,
  snap_to_grid: true,
  auto_save: true
}

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setProfile({ ...defaultProfile, ...JSON.parse(stored) })
      } else {
        setProfile(defaultProfile)
      }
    } catch {
      setProfile(defaultProfile)
    }
    setLoading(false)
  }, [])

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates }
    setProfile(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  return (
    <AuthContext.Provider value={{
      user: profile ? { id: 'guest', email: '' } : null,
      profile,
      loading,
      updateProfile,
      signOut: () => localStorage.removeItem(STORAGE_KEY)
    }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
