export function ProductSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-32 bg-neutral-200 rounded-lg mb-3"></div>

      {/* Product name skeleton */}
      <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>

      {/* Price skeleton */}
      <div className="h-5 bg-neutral-200 rounded w-1/2 mb-2"></div>

      {/* Stock skeleton */}
      <div className="h-3 bg-neutral-200 rounded w-1/3"></div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
