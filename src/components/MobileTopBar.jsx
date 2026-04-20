import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

export default function MobileTopBar({ 
  title, onNew, onSave, onCloudSave, onCloudLoad, 
  onExportPNG, onExportSVG, onGoHome,
  onToggleAI, user, profile,
  onOpenAuth, onOpenSettings 
}) {
  const [showMenuSheet, setShowMenuSheet] = useState(false);
  const [showAccountSheet, setShowAccountSheet] = useState(false);

  const getInitial = () => {
    return (profile?.display_name || user?.email?.[0] || 'U').toUpperCase()[0];
  };

  return (
    <>
      <div className="mobile-top-bar fixed top-0 left-0 right-0 h-12 bg-[#141414] border-b border-[#222] flex items-center justify-between px-4 z-30">
        <button 
          onClick={onGoHome}
          className="flex items-center gap-2"
        >
          <svg className="w-6 h-6 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12,2 L19,5.5 L19,12.5 L12,16 L5,12.5 L5,5.5 Z" fill="currentColor" opacity="0.7"/>
            <path d="M12,5 L19,8.5 L12,12 L5,8.5 Z" fill="currentColor"/>
            <path d="M5,8.5 L5,15.5 L12,19 L12,12 Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <span className="text-white font-semibold">MendAI</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAI}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#6C47FF] text-white"
            title="AI Assistant"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a2 2 0 012 2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2z"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </button>

          <button
            onClick={onExportPNG}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#888] hover:text-white hover:bg-[#222]"
            title="Export"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
          </button>

          {!user ? (
            <button
              onClick={() => setShowAccountSheet(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-[#333] text-[#888]"
              title="Sign in"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={() => setShowAccountSheet(true)}
              className="w-9 h-9 rounded-full bg-[#6C47FF] text-white flex items-center justify-center text-sm font-semibold"
              title={profile?.display_name || user?.email}
            >
              {getInitial()}
            </button>
          )}
        </div>
      </div>

      <BottomSheet
        isOpen={showMenuSheet}
        onClose={() => setShowMenuSheet(false)}
        title="Menu"
        height="60%"
      >
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { onNew(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M12 18v-6M9 15h6"/>
            </svg>
            New Diagram
          </button>
          
          <button
            onClick={() => { onSave(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <path d="M17 21v-8H7v8M7 3v5h8"/>
            </svg>
            Save Diagram
          </button>
          
          <button
            onClick={() => { onCloudLoad(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L4 8v9a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
              <path d="M12 2v9M8 6h8"/>
            </svg>
            Load Diagram
          </button>
          
          <div className="h-px bg-[#333] my-1" />
          
          <button
            onClick={() => { onExportPNG(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
            </svg>
            Export PNG
          </button>
          
          <button
            onClick={() => { onExportSVG(); setShowMenuSheet(false); }}
            className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            </svg>
            Export SVG
          </button>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
        title={user ? 'Account' : 'Sign In'}
        height="auto"
      >
        <div className="flex flex-col gap-1">
          {user ? (
            <>
              <div className="w-full h-14 flex items-center gap-3 px-3 rounded-lg bg-[#252525] text-white">
                <div className="w-10 h-10 rounded-full bg-[#6C47FF] flex items-center justify-center text-white font-semibold">
                  {getInitial()}
                </div>
                <div>
                  <div className="font-medium">{profile?.display_name || 'User'}</div>
                  <div className="text-[#666] text-sm">{user?.email}</div>
                </div>
              </div>
              
              <button
                onClick={() => { setShowAccountSheet(false); onOpenSettings?.(); }}
                className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                Settings
              </button>
            </>
          ) : (
            <button
              onClick={() => { setShowAccountSheet(false); onOpenAuth?.(); }}
              className="w-full h-11 flex items-center gap-3 px-3 rounded-lg hover:bg-[#252525] text-white"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
              Sign In
            </button>
          )}
        </div>
      </BottomSheet>
    </>
  );
}