export function SkeletonCard() {
  return (
    <div className="card" style={{ border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="skeleton h-4 w-3/4 mb-3" />
      <div className="skeleton h-3 w-1/2 mb-4" />
      <div className="flex items-center gap-2 mb-4">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-12 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full mb-2" />
      <div className="skeleton h-3 w-4/5" />
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="skeleton h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}

export function SkeletonList({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
