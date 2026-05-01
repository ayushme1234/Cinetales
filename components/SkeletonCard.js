export default function SkeletonCard() {
  return (
    <div>
      <div className="aspect-[2/3] rounded-xl skeleton" />
      <div className="mt-2.5 h-3 w-3/4 rounded skeleton" />
      <div className="mt-1.5 h-2 w-1/3 rounded skeleton" />
    </div>
  );
}
