// CineTales — SearchBar.
// Big Moctale-style search input with proper dark theme bg + text colors.

import { useState, useEffect, useRef } from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search films, series, anime…",
  autoFocus = false,
}) {
  const [q, setQ] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    setQ(value || "");
  }, [value]);

  return (
    <div className="relative group">
      {/* Search icon */}
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-3 group-focus-within:text-accent transition-colors pointer-events-none">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>

      <input
        ref={ref}
        type="text"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onChange && onChange(e.target.value);
        }}
        placeholder={placeholder}
        className="w-full pl-14 pr-12 py-4 md:py-5 text-base md:text-lg
                   bg-surface text-text-1 placeholder:text-text-3
                   border border-border rounded-2xl
                   focus:border-accent focus:outline-none focus:bg-elevated
                   transition-colors"
      />

      {/* Clear button */}
      {q && (
        <button
          onClick={() => {
            setQ("");
            onChange && onChange("");
            ref.current?.focus();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full bg-elevated text-text-2 hover:text-text-1 hover:bg-border-light btn-press transition"
          aria-label="Clear search"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
