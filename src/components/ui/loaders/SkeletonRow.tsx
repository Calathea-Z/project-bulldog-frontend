'use client';

export function SkeletonRow() {
  return (
    <div
      className="animate-pulse flex items-center space-x-4 p-4 border border-gray-700 rounded bg-surface"
      role="status"
      aria-label="Loading action item"
    >
      <div className="h-4 w-4 rounded-full bg-gray-600" aria-hidden="true" />
      <div className="flex-1 space-y-2 py-1" aria-hidden="true">
        <div className="h-4 bg-gray-600 rounded w-3/4" />
        <div className="h-3 bg-gray-500 rounded w-1/2" />
      </div>
      <div className="h-4 w-8 bg-gray-600 rounded" aria-hidden="true" />
    </div>
  );
}
