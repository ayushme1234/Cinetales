"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Filter, X } from "lucide-react";

interface Genre { id: number; name: string }

interface FilterBarProps {
  movieGenres: Genre[];
  tvGenres: Genre[];
}

const SORTS = [
  { id: "popularity.desc", label: "Most popular" },
  { id: "vote_average.desc", label: "Top rated" },
  { id: "release_date.desc", label: "Newest" },
  { id: "release_date.asc", label: "Oldest" },
];

const RATINGS = [0, 6, 7, 8];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

export function FilterBar({ movieGenres, tvGenres }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const type = params.get("type") || "movie";
  const genre = params.get("genre") || "";
  const year = params.get("year") || "";
  const sort = params.get("sort") || "popularity.desc";
  const rating = params.get("rating") || "";

  const genres = type === "tv" ? tvGenres : movieGenres;

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "type") next.delete("genre"); // reset genre when switching media type
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  function clearAll() {
    startTransition(() => router.push(pathname));
  }

  const hasFilters = genre || year || rating || sort !== "popularity.desc";

  return (
    <div className="rounded-2xl bg-cream p-5 brut">
      {/* Type tabs */}
      <div className="mb-5 flex gap-2">
        {[
          { id: "movie", label: "Films", c: "brut-cobalt" },
          { id: "tv", label: "Series", c: "brut-tangerine" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => update("type", t.id)}
            className={`rounded-xl px-5 py-2 text-sm font-bold uppercase brut transition ${
              type === t.id ? t.c : "brut-cream opacity-60 hover:opacity-100"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/60">
          <Filter size={14} /> Filters
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <FilterSelect
          label="Genre"
          value={genre}
          onChange={(v) => update("genre", v)}
          options={[{ value: "", label: "Any genre" }, ...genres.map((g) => ({ value: String(g.id), label: g.name }))]}
        />
        <FilterSelect
          label="Year"
          value={year}
          onChange={(v) => update("year", v)}
          options={[{ value: "", label: "Any year" }, ...YEARS.map((y) => ({ value: String(y), label: String(y) }))]}
        />
        <FilterSelect
          label="Min rating"
          value={rating}
          onChange={(v) => update("rating", v)}
          options={[
            { value: "", label: "Any rating" },
            ...RATINGS.filter((r) => r > 0).map((r) => ({ value: String(r), label: `${r}+ ★` })),
          ]}
        />
        <FilterSelect
          label="Sort by"
          value={sort}
          onChange={(v) => update("sort", v)}
          options={SORTS.map((s) => ({ value: s.id, label: s.label }))}
        />
      </div>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-electric hover:underline"
        >
          <X size={14} /> Clear filters
        </button>
      )}

      {isPending && <div className="mt-2 text-xs text-ink/50">Loading...</div>}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-ink/60">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-[2.5px] border-ink bg-cream px-3 py-2 font-semibold outline-none focus:bg-acid"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
