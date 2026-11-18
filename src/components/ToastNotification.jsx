export default function ToastNotification({ toast }) {
  if (!toast) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-md border border-black/10 bg-netflix-card px-4 py-3 text-netflix-black shadow-lg shadow-black/10"
    >
      <i className={`fa-solid ${toast.icon} text-lg text-netflix-butter`} />
      <span className="text-xs font-medium">{toast.message}</span>
    </div>
  );
}
