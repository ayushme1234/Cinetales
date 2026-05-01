export default function Marquee({ items = [] }) {
  const seq = [...items, ...items];
  return (
    <div className="overflow-hidden">
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {seq.map((it, i) => (
          <span key={i} className="font-mono text-xs uppercase tracking-widest2 text-[var(--accent)]">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}
