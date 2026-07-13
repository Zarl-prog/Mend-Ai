export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
            toast.type === 'success' ? 'bg-green-600 text-body' :
            toast.type === 'error' ? 'bg-red-600 text-body' :
            toast.type === 'warning' ? 'bg-amber-600 text-body' :
            'bg-blue-600 text-body'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}