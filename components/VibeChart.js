// CineTales — VibeChart (genre donut, Moctale-style).
// Takes an array of genres (TMDB shape: { id, name }) and renders a donut
// with synthetic but consistent percentages weighted toward the first genre.

const GENRE_COLORS = [
  "#a855f7", // accent — first/primary genre
  "#3b82f6", // blue
  "#ef4444", // red
  "#f97316", // orange
  "#10b981", // emerald
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#eab308", // yellow
  "#a78bfa", // light purple
  "#06b6d4", // cyan
];

/**
 * Compute pseudo-percentages for genres. We weight the first genre heaviest
 * (this is the "primary"), and split the rest fairly. Stable across renders
 * because it's deterministic from the input order/ids.
 */
function computeWeights(genres) {
  if (!genres || genres.length === 0) return [];
  const n = genres.length;
  if (n === 1) return [{ ...genres[0], pct: 100 }];

  // Weight pattern: first gets 45, second 25, third 20, fourth 10, then split tail.
  const PATTERNS = {
    2: [60, 40],
    3: [50, 30, 20],
    4: [45, 25, 20, 10],
    5: [40, 25, 18, 10, 7],
    6: [38, 24, 16, 10, 7, 5],
  };
  const tpl = PATTERNS[n] || (() => {
    const head = [40, 25, 18, 10];
    const remain = 100 - head.reduce((s, x) => s + x, 0);
    const each = Math.max(2, Math.floor(remain / (n - 4)));
    const tail = Array.from({ length: n - 4 }, () => each);
    // adjust last for rounding
    const sum = head.reduce((s, x) => s + x, 0) + tail.reduce((s, x) => s + x, 0);
    tail[tail.length - 1] += 100 - sum;
    return [...head, ...tail];
  })();

  return genres.map((g, i) => ({ ...g, pct: tpl[i] }));
}

export default function VibeChart({ genres = [], size = 200 }) {
  const data = computeWeights(genres.slice(0, 8));
  if (data.length === 0) return null;

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const stroke = size * 0.12;

  // Compute arc segments
  const segments = [];
  let cumulative = 0;
  data.forEach((g, i) => {
    const startAngle = (cumulative / 100) * 360 - 90; // start at 12 o'clock
    const endAngle = ((cumulative + g.pct) / 100) * 360 - 90;
    cumulative += g.pct;
    segments.push({
      ...g,
      color: GENRE_COLORS[i % GENRE_COLORS.length],
      startAngle,
      endAngle,
    });
  });

  const primary = data[0];
  const primaryColor = GENRE_COLORS[0];

  return (
    <div className="rounded-2xl bg-surface border border-border p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest2 text-text-3 mb-4">
        Vibe Chart
      </p>

      <div className="flex items-center justify-center mb-6">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {segments.map((seg, i) => (
            <ArcPath
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={stroke}
              startAngle={seg.startAngle}
              endAngle={seg.endAngle}
              color={seg.color}
            />
          ))}
          {/* Center text */}
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            fill="var(--text-1)"
            style={{ fontFamily: "Outfit, sans-serif", fontSize: size * 0.085, fontWeight: 500 }}
          >
            {primary.name}
          </text>
          <text
            x={cx}
            y={cy + size * 0.075}
            textAnchor="middle"
            fill={primaryColor}
            style={{
              fontFamily: "DM Mono, monospace",
              fontSize: size * 0.105,
              fontWeight: 600,
            }}
          >
            {primary.pct}%
          </text>
        </svg>
      </div>

      <ul className="space-y-2">
        {segments.map((seg, i) => (
          <li
            key={i}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-text-1 truncate">{seg.name}</span>
            </span>
            <span className="font-mono text-text-2 tabular-nums shrink-0 ml-3">
              {seg.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Helper — render a stroke-arc as an SVG path */
function ArcPath({ cx, cy, r, stroke, startAngle, endAngle, color }) {
  const start = polar(cx, cy, r, endAngle);
  const end = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const d = [
    `M ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`,
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
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}
