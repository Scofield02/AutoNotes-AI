import React from 'react';
import { CogIcon } from '../icons/CogIcon';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4 overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <CogIcon className="w-6 h-6 text-cyan-400 animate-spin-slow" />
          <h3 className="text-lg font-semibold text-cyan-300 tracking-wider">
            Generating Notes...
          </h3>
        </div>
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
