// CineTales — CastCrewRow.
// Horizontal scroll row of profile circles with name + role beneath.
// Falls back to silhouette if no profile photo. Snap-scrolls on mobile.
// Props: title, items[], showRole (optional caption key: "character" or "job")

import { useRef } from "react";
import ProfileAvatar from "./ProfileAvatar";

export default function CastCrewRow({ title, items = [], roleKey = "character" }) {
  const ref = useRef(null);

  const scroll = (dir) => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir * w * 0.85, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-2">
            // {title.toLowerCase()}
          </p>
          <h2 className="font-display text-2xl md:text-4xl leading-tight">
            {title}
          </h2>
        </div>
        <div className="hidden md:flex gap-1.5 shrink-0">
          <button
            onClick={() => scroll(-1)}
            className="w-9 h-9 grid place-items-center rounded-full border border-border hover:border-accent hover:text-accent btn-press"
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll(1)}
            className="w-9 h-9 grid place-items-center rounded-full border border-border hover:border-accent hover:text-accent btn-press"
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar overflow-x-auto scroll-smooth snap-x"
      >
        <div className="flex gap-4 md:gap-6 pb-2">
          {items.map((p) => (
            <div
              key={`${p.id}-${p.credit_id || p.character || p.job || ""}`}
              className="snap-start shrink-0 w-[88px] md:w-[130px] flex flex-col items-center text-center"
            >
              <ProfileAvatar
                profilePath={p.profile_path}
                name={p.name}
              />
              <p className="mt-3 text-sm font-medium text-text-1 line-clamp-2 leading-tight">
                {p.name}
              </p>
              {(p[roleKey] || p.character || p.job) && (
                <p className="mt-1 text-xs text-text-3 line-clamp-2 leading-tight">
                  {p[roleKey] || p.character || p.job}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
