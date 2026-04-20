import React, { useState, useEffect } from 'react';
import { listDiagrams, loadFromSupabase, deleteFromSupabase } from '../services/database';

export default function Home({ onNewProject, onLoadProject }) {
  const [diagrams, setDiagrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDiagrams();
  }, []);

  const loadDiagrams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDiagrams();
      setDiagrams(data || []);
    } catch (e) {
      console.error('Load diagrams error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('Delete this project?')) return;
    setDeleting(id);
    try {
      await deleteFromSupabase(id);
      setDiagrams(prev => prev.filter(d => d.id !== id));
    } catch (e) {
      alert('Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      <div className="w-64 bg-[#141414] border-r border-[#222] p-6">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-10 h-10 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L19 6.5V12.5L12 17L5 12.5V6.5L12 2Z" fill="currentColor" opacity="0.7"/>
            <path d="M12 5L19 9.5L12 14L5 9.5L12 5Z" fill="currentColor"/>
            <path d="M5 9.5V16.5L12 21L12 14L5 9.5Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <div>
            <h1 className="text-white font-bold text-xl">Mend AI</h1>
            <p className="text-[#666] text-xs">AI Diagram Creator</p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#6C47FF] to-[#1D9E75] text-white font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-white text-2xl font-bold mb-2">Your Projects</h2>
          <p className="text-[#666] mb-8">Select a project to continue working</p>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <p className="text-red-400 mb-2">Failed to load</p>
              <p className="text-[#444] text-sm mb-4">{error}</p>
              <button
                onClick={loadDiagrams}
                className="px-4 py-2 bg-[#6C47FF] text-white rounded-lg text-sm"
              >
                Try Again
              </button>
            </div>
          ) : diagrams.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#333]" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" fill="currentColor" opacity="0.3"/>
                </svg>
              </div>
              <p className="text-[#666] mb-2">No projects yet</p>
              <p className="text-[#444] text-sm">Create a new project to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {diagrams.map((diagram) => (
                <button
                  key={diagram.id}
                  onClick={() => onLoadProject(diagram.id)}
                  className="group relative p-4 bg-[#1a1a1a] border border-[#222] rounded-2xl text-left hover:border-[#6C47FF] hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                >
                  <div className="aspect-video bg-[#0a0a0a] rounded-xl mb-3 flex items-center justify-center">
                    <svg className="w-12 h-12 text-[#333]" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/>
                      <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/>
                      <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/>
                      <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3"/>
                    </svg>
                  </div>
                  <h3 className="text-white font-medium truncate">{diagram.title || 'Untitled'}</h3>
                  <p className="text-[#666] text-sm">
                    {new Date(diagram.updated_at).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: diagram.updated_at > Date.now() - 86400000 * 365 ? undefined : 'numeric'
                    })}
                  </p>
                  
                  <button
                    onClick={(e) => handleDelete(e, diagram.id)}
                    disabled={deleting === diagram.id}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-[#222] text-[#666] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-400"
                  >
                    {deleting === diagram.id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                    )}
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}