import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="space-y-4 animate-pulse">
          <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-5/6"></div>
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="space-y-4 pt-6">
             <div className="h-3 bg-gray-700 rounded w-1/2"></div>
             <div className="h-3 bg-gray-700 rounded w-full"></div>
             <div className="h-3 bg-gray-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
