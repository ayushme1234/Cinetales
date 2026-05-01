import { useState, useEffect, useRef } from "react";

export default function SearchBar({ value, onChange, placeholder = "Search films, series, anime…", autoFocus = false }) {
  const [q, setQ] = useState(value || "");
  const ref = useRef(null);

  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  useEffect(() => { setQ(value || ""); }, [value]);

  return (
    <div className="relative">
      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
        className="!pl-12 !py-4 text-base"
      />
      {q && (
        <button
          onClick={() => { setQ(""); onChange && onChange(""); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-[var(--text-1)]"
          aria-label="Clear"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
