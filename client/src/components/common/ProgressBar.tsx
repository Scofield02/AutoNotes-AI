import React from 'react';

interface ProgressBarProps {
  progress: number;
  currentTask: string;
  visible: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, currentTask, visible }) => {
  if (!visible) {
    return null;
  }
  
  return (
    <div className="w-full max-w-7xl mx-auto transition-opacity duration-300 px-2">
      <div className="flex justify-end items-center mb-1">
        <p className="text-xs sm:text-sm font-semibold text-gray-300">{progress}%</p>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-1.5">
        <div 
          className="bg-cyan-500 h-1.5 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;