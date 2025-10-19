import React, { useEffect, useState } from 'react';
import { WorkflowStatusEnum, WorkflowStep } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { CogIcon } from '../icons/CogIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface CurrentAgentDisplayProps {
  steps: WorkflowStep[];
  isRunning: boolean;
}

const CurrentAgentDisplay: React.FC<CurrentAgentDisplayProps> = ({ steps, isRunning }) => {
  const [displayStep, setDisplayStep] = useState<WorkflowStep | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (steps.length === 0) {
      setDisplayStep(null);
      return;
    }

    // Find the current active step (Running or the last completed one)
    const runningStep = steps.find(step => step.status === WorkflowStatusEnum.Running);
    const lastSuccessIndex = steps.map(s => s.status).lastIndexOf(WorkflowStatusEnum.Success);
    
    let newStep: WorkflowStep | null = null;

    if (runningStep) {
      newStep = runningStep;
    } else if (!isRunning && lastSuccessIndex >= 0) {
      // Workflow completed
      newStep = { message: 'Workflow completed', status: WorkflowStatusEnum.Success };
    } else if (lastSuccessIndex >= 0 && lastSuccessIndex < steps.length - 1) {
      // Show the last successful step before moving to next
      newStep = steps[lastSuccessIndex];
    } else if (steps.length > 0) {
      newStep = steps[0];
    }

    // Trigger animation when step changes
    if (newStep && (!displayStep || newStep.message !== displayStep.message)) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayStep(newStep);
        setIsAnimating(false);
      }, 300);
    }
  }, [steps, isRunning, displayStep]);

  if (!displayStep) {
    return null;
  }

  const getIcon = () => {
    switch (displayStep.status) {
      case WorkflowStatusEnum.Running:
        return <CogIcon className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 animate-spin-slow" />;
      case WorkflowStatusEnum.Success:
        return <CheckCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" />;
      case WorkflowStatusEnum.Error:
        return <XCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 text-red-400" />;
      default:
        return null;
    }
  };

  const getTextColor = () => {
    switch (displayStep.status) {
      case WorkflowStatusEnum.Running:
        return 'text-cyan-300';
      case WorkflowStatusEnum.Success:
        return 'text-green-300';
      case WorkflowStatusEnum.Error:
        return 'text-red-300';
      default:
        return 'text-gray-300';
    }
  };

  return (
    <div className="relative overflow-hidden min-h-[80px]">
      <div 
        className={`flex items-center justify-center space-x-3 sm:space-x-4 py-4 sm:py-5 px-4 bg-gray-900/30 rounded-lg border border-gray-700/50 transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0'
        }`}
      >
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <p className={`text-base sm:text-lg font-semibold ${getTextColor()} transition-colors duration-300`}>
          {displayStep.message}
        </p>
      </div>
    </div>
  );
};

export default CurrentAgentDisplay;
