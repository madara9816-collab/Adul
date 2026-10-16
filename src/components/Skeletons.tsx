export function VideoCardSkeleton() {
  return (
    <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden animate-pulse">
      <div className="aspect-video bg-neutral-800" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-neutral-800 rounded w-full" />
        <div className="h-3 bg-neutral-800 rounded w-2/3" />
        <div className="h-2 bg-neutral-800 rounded w-1/3" />
      </div>
    </div>
  );
}

export function VideoGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-2 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  );
}
