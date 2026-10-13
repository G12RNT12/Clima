import React from 'react';

/**
 * Esqueleto de carga (Shimmer Skeleton) mientras se obtienen los datos meteorológicos.
 */
export const SkeletonLoader: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Cargando datos meteorológicos..."
      className="space-y-6 animate-pulse"
    >
      {/* Hero Skeleton */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="h-8 w-56 rounded-xl bg-white/15" />
            <div className="h-4 w-44 rounded-lg bg-white/10" />
            <div className="h-20 w-48 rounded-2xl bg-white/15" />
            <div className="flex gap-3">
              <div className="h-8 w-28 rounded-xl bg-white/10" />
              <div className="h-8 w-28 rounded-xl bg-white/10" />
            </div>
          </div>
          <div className="h-36 w-36 rounded-full bg-white/10 self-center" />
        </div>
      </div>

      {/* 24h Hourly Skeleton */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="h-6 w-64 rounded-lg bg-white/15" />
        <div className="h-40 w-full rounded-2xl bg-white/10" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 w-20 rounded-2xl bg-white/10 shrink-0"
            />
          ))}
        </div>
      </div>

      {/* 7-Day & Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-5 h-36 flex flex-col justify-between"
          >
            <div className="h-4 w-28 rounded bg-white/15" />
            <div className="h-8 w-24 rounded-lg bg-white/15" />
            <div className="h-3 w-full rounded bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
};
