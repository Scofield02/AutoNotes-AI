import React, { useEffect, useState } from 'react';
import { AgentConfig } from '../../types';
import Button from '../common/Button';
import { Bars3Icon } from '../icons/Bars3Icon';
import { PencilIcon } from '../icons/PencilIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';
import { TrashIcon } from '../icons/TrashIcon';

interface AgentSettingsProps {
  agents: AgentConfig[];
  savedAgents: AgentConfig[];
  onAgentsUpdate: (updatedAgents: AgentConfig[]) => void;
  onReset: () => void;
  onAddAgent: (type: 'core' | 'optional') => void;
  onEditAgent: (agent: AgentConfig) => void;
  onDeleteAgent: (agentId: number) => void;
  onSave: () => void;
  onBack: () => void;
  disabled: boolean;
}

const DropIndicator = () => (
    <div className="h-1 my-1 bg-cyan-400/80 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all duration-200" />
);

const AgentSettings: React.FC<AgentSettingsProps> = ({ 
    agents,
    savedAgents,
    onAgentsUpdate, 
    onReset, 
    onAddAgent, 
    onEditAgent, 
    onDeleteAgent,
    onSave,
    onBack,
    disabled 
}) => {
  const coreAgents = agents.filter(agent => agent.type === 'core');
  const optionalAgents = agents.filter(agent => agent.type === 'optional');
  
  const [draggedAgentId, setDraggedAgentId] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<{ list: 'core' | 'optional'; index: number } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(agents) !== JSON.stringify(savedAgents));
  }, [agents, savedAgents]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, agent: AgentConfig) => {
    setDraggedAgentId(agent.id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', agent.id.toString());
  };

  const handleDragOverList = (e: React.DragEvent<HTMLDivElement>, listType: 'core' | 'optional') => {
    e.preventDefault();
    if (!draggedAgentId) return;

    const listContainer = e.currentTarget;
    const listItems = Array.from(listContainer.children).filter(child => child instanceof HTMLElement && child.hasAttribute('data-agent-id')) as HTMLElement[];

    let newIndex = listItems.length;
    for (let i = 0; i < listItems.length; i++) {
        const item = listItems[i];
        const rect = item.getBoundingClientRect();
        const midpointY = rect.top + rect.height / 2;
        if (e.clientY < midpointY) {
            newIndex = i;
            break;
        }
    }
    setDropTarget({ list: listType, index: newIndex });
  };

  const handleDrop = () => {
    if (!draggedAgentId || !dropTarget) return;

    const draggedAgent = agents.find(a => a.id === draggedAgentId);
    if (!draggedAgent) return;

    const remainingAgents = agents.filter(a => a.id !== draggedAgentId);
    const updatedAgent = { ...draggedAgent, type: dropTarget.list };

    let core = remainingAgents.filter(a => a.type === 'core');
    let optional = remainingAgents.filter(a => a.type === 'optional');
    
    if (dropTarget.list === 'core') {
        core.splice(dropTarget.index, 0, updatedAgent);
    } else {
        optional.splice(dropTarget.index, 0, updatedAgent);
    }

    onAgentsUpdate([...core, ...optional]);
    
    setDraggedAgentId(null);
    setDropTarget(null);
  };

  const handleDragLeaveList = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
         setDropTarget(null);
    }
  };
  
  const handleDragEnd = () => {
    setDraggedAgentId(null);
    setDropTarget(null);
  };

  const renderAgentList = (list: AgentConfig[], type: 'core' | 'optional') => {
    const listContent = list.map((agent, index) => (
      <React.Fragment key={agent.id}>
        {dropTarget?.list === type && dropTarget.index === index && <DropIndicator />}
        <div
          data-agent-id={agent.id}
          draggable={!disabled}
          onDragStart={(e) => handleDragStart(e, agent)}
          onDragEnd={handleDragEnd}
          className={`group flex w-full items-center justify-between py-2.5 bg-gray-900/50 px-3 rounded-md border border-gray-700 transition-all duration-200 ${draggedAgentId === agent.id ? 'opacity-30 scale-105 shadow-lg' : 'opacity-100'} ${!disabled ? 'cursor-grab' : ''}`}
        >
          <div className="flex items-center">
            <Bars3Icon className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-md font-medium text-gray-200">{agent.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{agent.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button 
                  onClick={() => onEditAgent(agent)} 
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  aria-label={`Edit agent ${agent.name}`}
                  title="Edit Agent"
              >
                  <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                  onClick={() => onDeleteAgent(agent.id)}
                  disabled={disabled}
                  className="p-1 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  aria-label={`Delete agent ${agent.name}`}
                  title="Delete Agent"
              >
                  <TrashIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </React.Fragment>
    ));

    if (dropTarget?.list === type && dropTarget.index === list.length) {
      listContent.push(<DropIndicator key="drop-indicator-end" />);
    }
    
    if (list.length === 0 && dropTarget?.list === type) {
      listContent.push(<DropIndicator key="drop-indicator-empty" />);
    }

    return listContent;
  };

  return (
    <div className="space-y-4">
        <div>
            <h2 className="text-xl font-semibold text-white">Configuration</h2>
            <p className="mt-1 text-sm text-gray-400">
                Configure your workflow by adding, removing, and reordering agents.
            </p>
        </div>
        
        <div className="space-y-6">
            <div>
                <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-cyan-300">Core Agents</h3>
                    <button
                        onClick={() => onAddAgent('core')}
                        disabled={disabled}
                        className="flex items-center px-2 py-1 text-xs font-medium text-cyan-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors disabled:opacity-50"
                    >
                       <PlusCircleIcon className="w-4 h-4 mr-1.5" />
                       Add Core Agent
                    </button>
                </div>
                <div 
                    className="space-y-2 pt-2 min-h-[50px]"
                    onDragOver={(e) => handleDragOverList(e, 'core')}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeaveList}
                >
                    {coreAgents.length > 0 ? (
                        renderAgentList(coreAgents, 'core')
                    ) : (
                        dropTarget?.list === 'core' ? <DropIndicator /> : <p className="text-sm text-gray-500 text-center py-4">Drag an optional agent here to start.</p>
                    )}
                </div>
                 <p className="mt-2 text-xs text-gray-500 text-center">Drag agents here to add them to the workflow. Drag to reorder.</p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-3 border-b border-gray-700 pb-2">
                    <h3 className="text-lg font-semibold text-cyan-300">Optional Agents</h3>
                     <button
                        onClick={() => onAddAgent('optional')}
                        disabled={disabled}
                        className="flex items-center px-2 py-1 text-xs font-medium text-cyan-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors disabled:opacity-50"
                    >
                       <PlusCircleIcon className="w-4 h-4 mr-1.5" />
                       Add Optional Agent
                    </button>
                </div>
                <div className="space-y-2 pt-2 min-h-[50px]"
                    onDragOver={(e) => handleDragOverList(e, 'optional')}
                    onDrop={handleDrop}
                    onDragLeave={handleDragLeaveList}
                >
                    {optionalAgents.length > 0 ? (
                        renderAgentList(optionalAgents, 'optional')
                    ) : (
                        dropTarget?.list === 'optional' ? <DropIndicator /> : <p className="text-sm text-gray-500 text-center py-4">No optional agents configured.</p>
                    )}
                </div>
                 <p className="mt-2 text-xs text-gray-500 text-center">Drag agents from the workflow here to make them optional.</p>
            </div>
        </div>
        
        <div className="pt-6 border-t border-gray-700/50 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
                onClick={onReset}
                disabled={disabled}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-800/80 rounded-md hover:bg-red-700/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Reset all to Defaults
            </button>
            
            {isDirty && (
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={onBack}
                        disabled={disabled}
                        variant="secondary"
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium"
                    >
                        Back
                    </Button>
                    <Button
                        onClick={onSave}
                        disabled={disabled}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium"
                    >
                        Save Changes
                    </Button>
                </div>
            )}
        </div>
    </div>
  );
};

export default AgentSettings;