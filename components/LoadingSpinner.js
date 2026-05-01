export default function LoadingSpinner({ size = 32 }) {
  return (
    <div className="grid place-items-center" role="status" aria-label="Loading">
      <span
        className="block rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin"
        style={{ width: size, height: size, animationDuration: "0.9s" }}
      />
    </div>
  );
}
