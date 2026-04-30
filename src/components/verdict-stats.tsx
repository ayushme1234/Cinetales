interface Props {
  goFor: number;
  timepass: number;
  skip: number;
  avgRating: number | null;
  ratingCount: number;
}

export function VerdictStats({ goFor, timepass, skip, avgRating, ratingCount }: Props) {
  const total = goFor + timepass + skip;

  const items = [
    { label: "Go for it", count: goFor, c: "bg-acid" },
    { label: "Timepass", count: timepass, c: "bg-tangerine" },
    { label: "Skip it", count: skip, c: "bg-electric" },
  ];

  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <div className="rounded-2xl bg-cream p-5 brut-soft">
      {/* AVERAGE RATING */}
      <div className="flex items-end justify-between border-b-[2.5px] border-ink/10 pb-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
            CineTales score
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            {avgRating !== null ? (
              <>
                <span className="display-xl text-5xl">{avgRating.toFixed(1)}</span>
                <span className="text-lg font-bold text-ink/40">/10</span>
              </>
            ) : (
              <span className="display-xl text-3xl text-ink/30">—</span>
            )}
          </div>
        </div>
        <div className="text-right text-xs font-bold uppercase tracking-widest text-ink/60">
          {ratingCount} rating{ratingCount === 1 ? "" : "s"}
        </div>
      </div>

      {/* VERDICT BREAKDOWN */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
          Community verdict
        </div>
        <div className="text-xs font-bold text-ink/60">
          {total} {total === 1 ? "vote" : "votes"}
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-3 text-sm text-ink/60">No verdicts yet. Be the first.</p>
      ) : (
        <>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full border-[2.5px] border-ink">
            {items.map((it) => (
              <div
                key={it.label}
                className={`${it.c} transition-all duration-700`}
                style={{ width: `${pct(it.count)}%` }}
                title={`${it.label}: ${it.count}`}
              />
            ))}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            {items.map((it) => (
              <div key={it.label}>
                <div className="display-xl text-2xl">{pct(it.count)}%</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink/60">
                  {it.label}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
