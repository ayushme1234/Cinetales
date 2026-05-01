// CineTales — AudienceScore.
// Moctale-style semicircle gauge (85%) showing TMDB community score,
// with 4-tier breakdown beneath (Skip / Timepass / Go for it / Perfection).
// The breakdown percentages are derived from voteAverage to feel like a real
// distribution — heavier toward "Go for it" / "Perfection" for high-rated titles.

function deriveBreakdown(scoreOutOf10) {
  // Normalize to 0-1
  const s = Math.max(0, Math.min(1, scoreOutOf10 / 10));
  // s near 1 → mostly perfection. s near 0.5 → mostly timepass / go for it.
  const perfection = Math.round(Math.pow(s, 3) * 85);
  const goForIt = Math.round(Math.pow(s, 1.5) * (95 - perfection));
  const remaining = 100 - perfection - goForIt;
  const timepass = Math.round(remaining * 0.7);
  const skip = Math.max(0, 100 - perfection - goForIt - timepass);
  return { skip, timepass, goForIt, perfection };
}

export default function AudienceScore({ score, voteCount }) {
  if (score == null || score === undefined) return null;
  const pct = Math.round((Math.max(0, Math.min(10, score)) / 10) * 100);
  const breakdown = deriveBreakdown(score);

  // SVG semicircle config
  const size = 220;
  const stroke = 14;
  const r = size / 2 - stroke;
  const cx = size / 2;
  const cy = size / 2;

  // Arc from 180° (left) to 0° (right) — half circle
  // Total arc length
  const startAngle = 180;
  const endAngle = 0;
  const totalAngle = startAngle - endAngle; // 180

  // Filled arc — proportion of pct
  const filledEnd = startAngle - totalAngle * (pct / 100);

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 md:p-8">
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-text-3 mb-2 text-center">
        Audience Score
      </p>

      <div className="relative flex items-end justify-center" style={{ height: size / 2 + 30 }}>
        <svg
          width={size}
          height={size / 2 + 14}
          viewBox={`0 0 ${size} ${size / 2 + 14}`}
        >
          {/* track */}
          <Arc
            cx={cx}
            cy={cy}
            r={r}
            stroke={stroke}
            from={startAngle}
            to={endAngle}
            color="var(--border)"
          />
          {/* filled — small segment in green at start, then accent */}
          {pct > 0 && pct <= 18 && (
            <Arc
              cx={cx}
              cy={cy}
              r={r}
              stroke={stroke}
              from={startAngle}
              to={filledEnd}
              color="var(--go)"
            />
          )}
          {pct > 18 && (
            <>
              <Arc
                cx={cx}
                cy={cy}
                r={r}
                stroke={stroke}
                from={startAngle}
                to={startAngle - totalAngle * 0.18}
                color="var(--go)"
              />
              <Arc
                cx={cx}
                cy={cy}
                r={r}
                stroke={stroke}
                from={startAngle - totalAngle * 0.18}
                to={filledEnd}
                color="var(--accent)"
              />
            </>
          )}
        </svg>
        {/* Center stat */}
        <div
          className="absolute inset-x-0 flex flex-col items-center"
          style={{ top: size * 0.18 }}
        >
          <div className="flex items-baseline">
            <span className="font-display text-5xl md:text-6xl text-accent leading-none">
              {pct}
            </span>
            <span className="text-accent/70 text-2xl font-display ml-1">%</span>
          </div>
          {voteCount && (
            <p className="mt-2 text-xs text-text-3 font-mono">
              {voteCount.toLocaleString()} votes
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 border-t border-border">
        <Tier label="Skip" pct={breakdown.skip} color="var(--skip)" />
        <Tier label="Timepass" pct={breakdown.timepass} color="var(--mid)" />
        <Tier label="Go for it" pct={breakdown.goForIt} color="var(--go)" />
        <Tier label="Perfection" pct={breakdown.perfection} color="var(--perfection)" />
      </div>
    </div>
  );
}

function Tier({ label, pct, color }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
      <span className="text-text-2 truncate">{label}</span>
      <span
        className="font-mono tabular-nums ml-auto shrink-0"
        style={{ color }}
      >
        {pct}%
      </span>
    </div>
  );
}

function Arc({ cx, cy, r, stroke, from, to, color }) {
  if (from === to) return null;
  const start = polar(cx, cy, r, from);
  const end = polar(cx, cy, r, to);
  const sweep = from > to ? 1 : 0;
  const largeArc = Math.abs(from - to) > 180 ? 1 : 0;
  const d = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`,
  ].join(" ");
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={stroke}
      strokeLinecap="round"
      fill="none"
    />
  );
}

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) };
}
