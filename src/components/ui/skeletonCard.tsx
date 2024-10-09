import React from 'react';

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="rounded-xl border bg-gray-200 shadow p-6">
      <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
      <div className="h-10 bg-gray-300 rounded w-1/3"></div>
    </div>
  </div>
);

export default SkeletonCard;  // Default export
