export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card space-y-3">
      <div className="skeleton" style={{ height: '1rem', width: '40%' }} />
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: '0.75rem', width: `${85 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card text-center space-y-2">
          <div className="skeleton mx-auto" style={{ height: '2rem', width: '2rem', borderRadius: '50%' }} />
          <div className="skeleton mx-auto" style={{ height: '1.5rem', width: '3rem' }} />
          <div className="skeleton mx-auto" style={{ height: '0.625rem', width: '4rem' }} />
        </div>
      ))}
    </div>
  );
}
