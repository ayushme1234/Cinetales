export default function RatingBadge({ score, size = "sm" }) {
  if (score == null) return null;
  const dim = size === "md" ? 44 : size === "lg" ? 56 : 28;
  const font = size === "md" ? 14 : size === "lg" ? 18 : 11;
  const v = Math.round(score * 10) / 10;
  return (
    <span
      className="font-mono inline-grid place-items-center bg-[var(--accent)] text-white rounded-full shadow-lg"
      style={{
        width: dim,
        height: dim,
        fontSize: font,
        fontWeight: 600,
        boxShadow: "0 4px 16px -4px var(--accent-glow)",
      }}
    >
      {v.toFixed(1)}
    </span>
  );
}
