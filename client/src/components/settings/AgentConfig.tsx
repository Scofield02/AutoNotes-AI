
import React, { useState } from 'react';
import { ModelConfig } from '../../types';
import { PencilIcon } from '../icons/PencilIcon';
import { TrashIcon } from '../icons/TrashIcon';
import ModelConfigModal from '../modals/ModelConfigModal';

interface AgentConfigProps {
  savedModels: ModelConfig[];
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onSaveModel: (modelConfig: Omit<ModelConfig, 'id'> & { id?: string }) => Promise<boolean>;
  onDeleteModel: (modelId: string) => void;
  disabled: boolean;
}

const AgentConfig: React.FC<AgentConfigProps> = ({ savedModels, selectedModelId, onModelChange, onSaveModel, onDeleteModel, disabled }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);

  const handleOpenAddModal = () => {
    setEditingModel(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    const modelToEdit = savedModels.find(m => m.id === selectedModelId);
    if (modelToEdit) {
      setEditingModel(modelToEdit);
      setIsModalOpen(true);
    }
  };
  
  const handleSave = async (modelConfig: Omit<ModelConfig, 'id'> & { id?: string }) => {
    const success = await onSaveModel(modelConfig);
    if (success) {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <div className="mt-4 sm:mt-5">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">AI Model Configuration</h2>
        <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
              id="model-select"
              value={selectedModelId}
              onChange={(e) => onModelChange(e.target.value)}
              disabled={disabled || savedModels.length === 0}
              className="flex-grow w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Select an AI model configuration"
            >
              {savedModels.length === 0 ? (
                <option value="">Please add a model configuration</option>
              ) : (
                savedModels.map(model => (
                  <option key={model.id} value={model.id}>{model.displayName}</option>
                ))
              )}
            </select>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenEditModal} 
                disabled={disabled || !selectedModelId}
                className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Edit selected configuration"
                title="Edit selected configuration"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDeleteModel(selectedModelId)}
                disabled={disabled || !selectedModelId}
                className="flex-1 sm:flex-none p-2 text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Delete selected configuration"
                title="Delete selected configuration"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={handleOpenAddModal}
            disabled={disabled}
            className="w-full px-4 py-2.5 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
          >
            + Add New Configuration
          </button>
        </div>
      </div>
      
      {isModalOpen && (
        <ModelConfigModal
          model={editingModel}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default AgentConfig;
