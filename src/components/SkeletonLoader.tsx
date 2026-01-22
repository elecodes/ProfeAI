import React from 'react';

/**
 * A loading placeholder component mimicking the structure of a grid layout of cards.
 * Used to improve perceived performance during data fetching.
 */
export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
      </div>

      {/* Content Skeleton (mimics Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="flex items-center justify-between mt-auto pt-8">
              <div className="h-10 bg-gray-200 rounded w-1/3"></div>
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
