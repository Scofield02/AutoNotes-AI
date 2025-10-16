import React, { useEffect, useState } from 'react';
import { AgentConfig } from '../../types';
import { XMarkIcon } from '../icons/XMarkIcon';

interface AgentConfigModalProps {
  agent: AgentConfig | null;
  agentType: 'core' | 'optional';
  onClose: () => void;
  onSave: (agentData: Omit<AgentConfig, 'id' | 'type'> & { id?: number }) => void;
}

const AgentConfigModal: React.FC<AgentConfigModalProps> = ({ agent, agentType, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [temperature, setTemperature] = useState(0.5);
  const [systemInstruction, setSystemInstruction] = useState('');
  
  const currentAgentType = agent?.type || agentType;

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setTemperature(agent.temperature);
      setSystemInstruction(agent.systemInstruction);
      setDescription(agent.description || '');
    } else {
      // Reset for new agent
      setName('');
      setTemperature(0.5);
      setSystemInstruction('Your system instruction here...');
      setDescription('');
    }
  }, [agent]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = () => {
    if (name.trim() && systemInstruction.trim() && description.trim()) {
      const agentData: any = {
        id: agent?.id,
        name: name.trim(),
        temperature,
        systemInstruction: systemInstruction.trim(),
        description: description.trim(),
      };
      onSave(agentData);
    }
  };

  const isFormValid = name.trim() && systemInstruction.trim() && description.trim();
  const modalTitle = agent ? `Edit ${agent.name}` : `Add New ${agentType === 'core' ? 'Core' : 'Optional'} Agent`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm modal-backdrop" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-2xl bg-gray-800 border border-white/10 rounded-xl shadow-2xl modal-content">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{modalTitle}</h2>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-md hover:bg-gray-700" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="agent-name" className="block text-sm font-medium text-gray-300">Agent Name</label>
            <input
              id="agent-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Content Summarizer"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="agent-description" className="block text-sm font-medium text-gray-300">Description</label>
            <input
              id="agent-description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this agent does."
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
            <p className="mt-1 text-xs text-gray-500">A short, clear description of the agent's role in the workflow.</p>
          </div>

          <div>
            <label htmlFor="agent-temp" className="block text-sm font-medium text-gray-300">Temperature</label>
            <input
              id="agent-temp"
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
             <p className="mt-1 text-xs text-gray-500">Lower values (e.g., 0.2) are more deterministic, higher values (e.g., 0.8) are more creative.</p>
          </div>

          <div>
            <label htmlFor="agent-prompt" className="block text-sm font-medium text-gray-300">System Instruction (Prompt)</label>
            <textarea
              id="agent-prompt"
              rows={15}
              value={systemInstruction}
              onChange={(e) => setSystemInstruction(e.target.value)}
              placeholder="Define the agent's role, task, and constraints..."
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm font-mono placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>
        </div>
        
        <div className="flex justify-end p-4 bg-gray-800/50 border-t border-gray-700 rounded-b-xl space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Save Agent
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigModal;