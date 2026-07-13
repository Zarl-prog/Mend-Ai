export default function Home({ onNewProject }) {

  return (
    <div className="min-h-screen bg-surface flex">
      <div className="w-64 bg-panel border-r border-panel p-6">
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-10 h-10 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L19 6.5V12.5L12 17L5 12.5V6.5L12 2Z" fill="currentColor" opacity="0.7"/>
            <path d="M12 5L19 9.5L12 14L5 9.5L12 5Z" fill="currentColor"/>
            <path d="M5 9.5V16.5L12 21L12 14L5 9.5Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <div>
            <h1 className="text-body font-bold text-xl">Mend AI</h1>
            <p className="text-muted text-xs">AI Diagram Creator</p>
          </div>
        </div>

        <button
          onClick={onNewProject}
          className="w-full py-3 px-4 bg-gradient-to-r from-[#6C47FF] to-[#1D9E75] text-body font-medium rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onNewProject}
          className="flex flex-col items-center gap-4 group cursor-pointer"
        >
          <div className="w-24 h-24 bg-card border-2 border-dashed border-card rounded-3xl flex items-center justify-center group-hover:border-[#6C47FF] group-hover:shadow-lg group-hover:shadow-purple-500/20 transition-all">
            <svg className="w-10 h-10 text-body group-hover:text-[#6C47FF] transition-colors" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-body text-xl font-medium group-hover:text-[#6C47FF] transition-colors">New Project</span>
        </button>
      </div>
    </div>
  );
}