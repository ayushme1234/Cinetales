export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const doubled = [...items, ...items];
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track">
        {doubled.map((s, i) => (
          <span key={i} className="mx-6 flex items-center gap-6 whitespace-nowrap display-xl text-5xl">
            {s}
            <span className="inline-block h-3 w-3 rotate-45 bg-current" />
          </span>
        ))}
      </div>
    </div>
  );
}
