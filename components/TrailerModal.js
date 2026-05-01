import { useEffect, useCallback } from "react";

export default function TrailerModal({ youtubeKey, title = "Trailer", onClose }) {
  const close = useCallback(() => onClose && onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);

  if (!youtubeKey) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${title} trailer`}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
      onClick={close}
    >
      <button
        onClick={close}
        aria-label="Close trailer"
        className="absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-full bg-[var(--surface)] border border-[var(--border-light)] text-[var(--text-1)] hover:border-[var(--accent)] hover:text-[var(--accent)] btn-press z-10"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div
        className="relative w-full max-w-5xl aspect-video rounded-xl overflow-hidden border border-[var(--border-light)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeKey}?autoplay=1&rel=0&modestbranding=1`}
          title={`${title} trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </div>
  );
}
