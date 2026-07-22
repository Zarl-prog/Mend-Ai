import React from 'react'
import { useAuth } from '../contexts/AuthContext'

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
  const { profile, updateProfile } = useAuth()
  
  if (!isOpen) return null
  
  const gridSizes = { small: 16, medium: 24, large: 40 }
  
  const handleSettingChange = async (key, value) => {
    await updateProfile({ [key]: value })
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={onClose}>
      <div 
        className="bg-card border border-card rounded-2xl w-[560px] h-[500px] shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-card">
          <h2 className="text-xl font-semibold text-body">Settings</h2>
          <button onClick={onClose} className="text-muted hover:text-body text-xl">✕</button>
        </div>
        
        <div className="flex border-b border-card">
          {['account', 'canvas', 'shortcuts'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === t 
                  ? 'text-body border-b-2 border-[#6C47FF]' 
                  : 'text-muted hover:text-body'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        
        {toastMsg && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-green-600 text-body text-sm rounded-lg shadow-lg">
            {toastMsg}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'account' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#6C47FF] flex items-center justify-center text-body text-xl font-semibold">
                  {(profile?.display_name || 'U').toUpperCase()[0]}
                </div>
                <div>
                  <div className="text-body font-semibold text-lg">{profile?.display_name || 'User'}</div>
                  <div className="text-muted text-sm">Guest account — data stored locally</div>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'canvas' && (
            <div className="space-y-5">
              <div>
                <label className="block text-secondary text-sm mb-2">Grid Style</label>
                <div className="flex gap-1 bg-input rounded-lg p-1">
                  {['square', 'dots', 'none'].map(type => (
                    <button
                      key={type}
                      onClick={() => handleSettingChange('grid_type', type)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.grid_type === type 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-secondary hover:text-body'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-secondary text-sm mb-2">Grid Size</label>
                <div className="flex gap-1 bg-input rounded-lg p-1">
                  {['small', 'medium', 'large'].map(size => (
                    <button
                      key={size}
                      onClick={() => handleSettingChange('grid_size', size)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.grid_size === size 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-secondary hover:text-body'
                      }`}
                    >
                      {size} ({gridSizes[size]}px)
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-secondary text-sm mb-2">Default Shape Color</label>
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
                    className="flex-1 bg-input border border-card rounded-lg px-4 py-2 text-body text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-secondary text-sm mb-2">
                  Default Font Size: {profile?.default_font_size || 16}px
                </label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={profile?.default_font_size || 16}
                  onChange={(e) => handleSettingChange('default_font_size', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-body text-sm">Snap to Grid</div>
                  <div className="text-muted text-xs">Align shapes to grid</div>
                </div>
                <button
                  onClick={() => handleSettingChange('snap_to_grid', !profile?.snap_to_grid)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile?.snap_to_grid ? 'bg-[#6C47FF]' : 'bg-hover'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile?.snap_to_grid ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-body text-sm">Auto Save</div>
                  <div className="text-muted text-xs">Save diagram every 2 minutes</div>
                </div>
                <button
                  onClick={() => handleSettingChange('auto_save', !profile?.auto_save)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    profile?.auto_save ? 'bg-[#6C47FF]' : 'bg-hover'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    profile?.auto_save ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              <div>
                <label className="block text-secondary text-sm mb-2">Theme</label>
                <div className="flex gap-1 bg-input rounded-lg p-1">
                  {['dark', 'light'].map(theme => (
                    <button
                      key={theme}
                      onClick={() => handleSettingChange('theme', theme)}
                      className={`flex-1 py-2 rounded-md text-sm capitalize transition-colors ${
                        profile?.theme === theme 
                          ? 'bg-[#6C47FF] text-white' 
                          : 'text-secondary hover:text-body'
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
                        <span className="text-secondary text-sm">{item.desc}</span>
                        <kbd className="bg-input border border-card rounded px-2 py-0.5 text-body text-xs font-mono">
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