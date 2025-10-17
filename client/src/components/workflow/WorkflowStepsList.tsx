import React from 'react';
import { WorkflowStatusEnum, WorkflowStep } from '../../types';
import { CheckCircleIcon } from '../icons/CheckCircleIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CogIcon } from '../icons/CogIcon';
import { XCircleIcon } from '../icons/XCircleIcon';

interface WorkflowStepsListProps {
  steps: WorkflowStep[];
}

const getStatusIcon = (status: WorkflowStatusEnum) => {
  switch (status) {
    case WorkflowStatusEnum.Pending:
      return <ClockIcon className="w-5 h-5 text-gray-500" />;
    case WorkflowStatusEnum.Running:
      return <CogIcon className="w-5 h-5 text-cyan-400 animate-spin-slow" />;
    case WorkflowStatusEnum.Success:
      return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
    case WorkflowStatusEnum.Error:
      return <XCircleIcon className="w-5 h-5 text-red-400" />;
    default:
      return null;
  }
};

const WorkflowStepsList: React.FC<WorkflowStepsListProps> = ({ steps }) => {
  if (steps.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center space-x-3 text-sm">
          <div className="flex-shrink-0">
            {getStatusIcon(step.status)}
          </div>
          <p className={`
            ${step.status === WorkflowStatusEnum.Running && 'text-cyan-300 font-semibold'}
            ${step.status === WorkflowStatusEnum.Success && 'text-gray-300'}
            ${step.status === WorkflowStatusEnum.Pending && 'text-gray-500'}
            ${step.status === WorkflowStatusEnum.Error && 'text-red-400'}
          `}>
            {step.message}
          </p>
        </div>
      ))}
    </div>
  );
};

export default WorkflowStepsList;
