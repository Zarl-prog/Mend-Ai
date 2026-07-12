import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../services/supabaseClient'

const shortcuts = [
  { category: 'TOOLS', items: [
    { key: 'V', desc: 'Select Tool' },
    { key: 'R', desc: 'Rectangle' },
    { key: 'C', desc: 'Circle' },
    { key: 'T', desc: 'Text Box' },
    { key: 'S', desc: 'Sticky Note' },
    { key: 'A', desc: 'Arrow' },
  ]},
  { category: 'CANVAS', items: [
    { key: 'Ctrl + Z', desc: 'Undo' },
    { key: 'Ctrl + Y', desc: 'Redo' },
    { key: 'Ctrl + A', desc: 'Select All' },
    { key: 'Ctrl + D', desc: 'Duplicate' },
    { key: 'Delete', desc: 'Delete Selected' },
    { key: 'Ctrl + =', desc: 'Zoom In' },
    { key: 'Ctrl + -', desc: 'Zoom Out' },
    { key: 'Ctrl + 0', desc: 'Reset Zoom' },
  ]},
  { category: 'AI', items: [
    { key: 'Ctrl + K', desc: 'Open AI Panel' },
    { key: 'Ctrl + Enter', desc: 'Submit AI Prompt' },
  ]},
  { category: 'EDITING', items: [
    { key: 'Double Click', desc: 'Edit Shape Label' },
    { key: 'Escape', desc: 'Cancel / Deselect' },
  ]},
]

export default function SettingsModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('account')
  const { user, profile, updateProfile, signOut, resetPassword } = useAuth()
  const [displayName, setDisplayName] = useState('')
  const [diagramCount, setDiagramCount] = useState(0)
  const [toastMsg, setToastMsg] = useState('')
  
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '')
      fetchDiagramCount()
    }
  }, [profile])
  
  const fetchDiagramCount = async () => {
    if (!user) return
    const { count } = await supabase
      .from('diagrams')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setDiagramCount(count || 0)
  }
  
  if (!isOpen) return null
  
  const handleSaveDisplayName = async () => {
    if (displayName.trim() && displayName !== profile?.display_name) {
      await updateProfile({ display_name: displayName.trim() })
      setToastMsg('Display name saved')
      setTimeout(() => setToastMsg(''), 2500)
    }
  }
  
  const handleChangePassword = async () => {
    if (user?.email) {
      await resetPassword(user.email)
      setToastMsg('Password reset email sent!')
      setTimeout(() => setToastMsg(''), 2500)
    }
  }
  
  const gridSizes = { small: 16, medium: 24, large: 40 }
  
  const handleSettingChange = async (key, value) => {
    await updateProfile({ [key]: value })
  }
  
  const memberSince = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'N/A'
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] border border-[#333] rounded-2xl w-[560px] h-[500px] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#333]">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-[#666] hover:text-white text-xl">✕</button>
        </div>
        
        <div className="flex border-b border-[#333]">
          {['account', 'canvas', 'shortcuts'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t 
                  ? 'text-white border-b-2 border-[#6C47FF]' 
                  : 'text-[#666] hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-lg">
            {toastMsg}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'account' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6C47FF] flex items-center justify-center text-white text-xl font-semibold">
                  {(profile?.display_name || user?.email?.[0] || 'U').toUpperCase()[0]}
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">{profile?.display_name || 'User'}</div>
                  <div className="text-[#666] text-sm">{user?.email}</div>
                  <span className="text-xs bg-[#333] text-[#888] px-2 py-0.5 rounded">Free</span>
                </div>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">Display Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-white text-sm focus:border-[#6C47FF] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveDisplayName}
                    className="px-4 py-2 bg-[#6C47FF] text-white rounded-lg text-sm hover:brightness-110"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-[#666] text-sm cursor-not-allowed"
                />
                <p className="text-[#666] text-xs mt-1">Contact support to change email</p>
              </div>
              
              <div>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 border border-[#333] text-white rounded-lg text-sm hover:bg-[#2a2a2a]"
                >
                  Change Password
                </button>
              </div>
              
              <div>
                <h3 className="text-[#888] text-sm mb-2">Your Usage</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-2xl font-semibold text-white">{diagramCount}</div>
                    <div className="text-[#666] text-xs">Diagrams saved</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-white text-sm">{memberSince}</div>
                    <div className="text-[#666] text-xs">Member since</div>
                  </div>
                  <div className="bg-[#2a2a2a] rounded-lg p-3">
                    <div className="text-white text-sm">Free</div>
                    <div className="text-[#666] text-xs">Account type</div>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#333]">
                <h3 className="text-red-400 text-sm mb-2">Danger Zone</h3>
                <div className="border border-red-900/50 rounded-lg p-4">
                  <button className="text-red-400 text-sm hover:underline">
                    Delete Account
                  </button>
                  <p className="text-[#666] text-xs mt-1">
                    This will permanently delete your account and all diagrams.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'canvas' && (
            <div className="space-y-5">
              <div>
                <label className="block text-[#888] text-sm mb-2">Grid Style</label>
                <div className="flex gap-1 bg-[#2a2a2a] rounded-lg p-1">
                  {['square', 'dots', 'none'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleSettingChange('grid_type', type)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.grid_type === type 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">Grid Size</label>
                <div className="flex gap-1 bg-[#2a2a2a] rounded-lg p-1">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => handleSettingChange('grid_size', size)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.grid_size === size 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {size} ({gridSizes[size]}px)
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">Default Shape Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={profile?.default_color || '#6C47FF'}
                    onChange={(e) => handleSettingChange('default_color', e.target.value)}
                    className="w-12 h-10 rounded-lg cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={profile?.default_color || '#6C47FF'}
                    onChange={(e) => handleSettingChange('default_color', e.target.value)}
                    className="flex-1 bg-[#2a2a2a] border border-[#333] rounded-lg px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">
                  Default Font Size: {profile?.default_font_size || 13}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={profile?.default_font_size || 13}
                  onChange={(e) => handleSettingChange('default_font_size', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Snap to Grid</div>
                  <div className="text-[#666] text-xs">Align shapes to grid</div>
                </div>
                <button
                  onClick={() => handleSettingChange('snap_to_grid', !profile?.snap_to_grid)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile?.snap_to_grid ? 'bg-[#6C47FF]' : 'bg-[#333]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile?.snap_to_grid ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm">Auto Save</div>
                  <div className="text-[#666] text-xs">Save diagram every 2 minutes</div>
                </div>
                <button
                  onClick={() => handleSettingChange('auto_save', !profile?.auto_save)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile?.auto_save ? 'bg-[#6C47FF]' : 'bg-[#333]'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile?.auto_save ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="block text-[#888] text-sm mb-2">Theme</label>
                <div className="flex gap-1 bg-[#2a2a2a] rounded-lg p-1">
                  {['dark', 'light'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleSettingChange('theme', theme)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.theme === theme 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {theme}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {tab === 'shortcuts' && (
            <div className="grid grid-cols-2 gap-6">
              {shortcuts.map(section => (
                <div key={section.category}>
                  <h3 className="text-[#6C47FF] text-xs font-medium mb-2">{section.category}</h3>
                  <div className="space-y-1">
                    {section.items.map(item => (
                      <div key={item.desc} className="flex justify-between items-center py-1">
                        <span className="text-[#888] text-sm">{item.desc}</span>
                        <kbd className="bg-[#2a2a2a] border border-[#444] rounded px-2 py-0.5 text-[#ececec] text-xs font-mono">
                          {item.key}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}