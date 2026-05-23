const presets = {
  card: (
    <div className="space-y-4">
      <div className="skeleton h-40 w-full rounded-2xl" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
    </div>
  ),
  text: (
    <div className="space-y-3">
      <div className="skeleton h-4 w-full" />
      <div className="skeleton h-4 w-5/6" />
      <div className="skeleton h-4 w-4/6" />
    </div>
  ),
  avatar: (
    <div className="flex items-center gap-4">
      <div className="skeleton h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="skeleton h-4 w-1/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  ),
  stat: (
    <div className="glass-card p-6 space-y-3">
      <div className="flex items-center gap-3">
        <div className="skeleton h-12 w-12 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="skeleton h-3 w-20" />
          <div className="skeleton h-6 w-16" />
        </div>
      </div>
    </div>
  ),
  'table-row': (
    <div className="flex items-center gap-4 py-4 border-b border-[var(--border-subtle)]">
      <div className="skeleton h-10 w-10 rounded-lg" />
      <div className="skeleton h-4 w-1/4" />
      <div className="skeleton h-4 w-1/6 ml-auto" />
      <div className="skeleton h-4 w-1/6" />
      <div className="skeleton h-8 w-20 rounded-lg" />
    </div>
  ),
  chart: (
    <div className="space-y-4">
      <div className="flex items-end gap-2 h-32">
        {[40, 65, 30, 80, 55, 70, 45].map((h, i) => (
          <div key={i} className="skeleton flex-1 rounded-t-lg" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="skeleton h-3 w-full" />
    </div>
  ),
};

const SkeletonLoader = ({ type = 'card', count = 1, className = '' }) => {
  const preset = presets[type] || presets.card;

  return (
    <div className={`space-y-6 ${className}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
          {preset}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
