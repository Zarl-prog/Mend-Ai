export default function Home({ onNewProject }) {

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 max-w-md px-6">
        <div className="flex items-center gap-3">
          <svg className="w-10 h-10 text-[#6C47FF]" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L19 6.5V12.5L12 17L5 12.5V6.5L12 2Z" fill="currentColor" opacity="0.7"/>
            <path d="M12 5L19 9.5L12 14L5 9.5L12 5Z" fill="currentColor"/>
            <path d="M5 9.5V16.5L12 21L12 14L5 9.5Z" fill="currentColor" opacity="0.5"/>
          </svg>
          <div>
            <h1 className="text-body font-bold text-2xl">Mend AI</h1>
            <p className="text-muted text-sm">AI Diagram Creator</p>
          </div>
        </div>

        <p className="text-secondary text-center">Create diagrams with AI assistance and structured shapes</p>

        <button
          onClick={onNewProject}
          className="py-4 px-10 bg-gradient-to-r from-[#6C47FF] to-[#1D9E75] text-white font-medium text-lg rounded-2xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-purple-500/30 transition-all"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>
      </div>
    </div>
  );
}
