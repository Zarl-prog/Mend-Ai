import { useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export function useProfile() {
  const { profile, updateProfile } = useAuth()

  const applyProfileSettings = () => {
    if (!profile) return null
    
    return {
      theme: profile.theme || 'dark',
      gridType: profile.grid_type || 'square',
      gridSize: profile.grid_size || 'medium',
      snapToGrid: profile.snap_to_grid ?? true,
      defaultColor: profile.default_color || '#6C47FF',
      defaultFontSize: profile.default_font_size || 16,
      autoSave: profile.auto_save ?? true
    }
  }

  const gridSizeMap = {
    small: 16,
    medium: 24,
    large: 40
  }

  const getGridSize = () => {
    return gridSizeMap[profile?.grid_size] || 24
  }

  return {
    profile,
    updateProfile,
    applyProfileSettings,
    getGridSize
  }
}