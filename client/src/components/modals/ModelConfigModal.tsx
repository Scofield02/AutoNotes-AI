
import React, { useEffect, useState } from 'react';
import { ModelConfig, ModelProvider } from '../../types';
import { XMarkIcon } from '../icons/XMarkIcon';

interface ModelConfigModalProps {
  model: ModelConfig | null;
  onClose: () => void;
  onSave: (modelConfig: Omit<ModelConfig, 'id'> & { id?: string }) => void;
}

const ModelConfigModal: React.FC<ModelConfigModalProps> = ({ model, onClose, onSave }) => {
  const [provider, setProvider] = useState<ModelProvider>('google');
  const [displayName, setDisplayName] = useState('');
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (model) {
      setProvider(model.provider);
      setDisplayName(model.displayName);
      setModelName(model.name);
      setApiKey(model.apiKey);
    } else {
      setProvider('google');
      setDisplayName('');
      setModelName('');
      setApiKey('');
    }
  }, [model]);

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
    if (displayName.trim() && modelName.trim() && apiKey.trim()) {
      onSave({
        id: model?.id,
        provider,
        displayName: displayName.trim(),
        name: modelName.trim(),
        apiKey: apiKey.trim(),
      });
    }
  };

  const isFormValid = displayName.trim() && modelName.trim() && apiKey.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm modal-backdrop" onClick={onClose}></div>
      
      <div className="relative z-10 w-full max-w-md bg-gray-800 border border-white/10 rounded-xl shadow-2xl modal-content">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">{model ? 'Edit' : 'Add'} Model Configuration</h2>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-md hover:bg-gray-700" aria-label="Close">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Provider</label>
            <div className="mt-2 flex space-x-4">
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="provider" value="google" checked={provider === 'google'} onChange={() => setProvider('google')} className="text-cyan-600 focus:ring-cyan-500 bg-gray-700 border-gray-600" />
                <span className="ml-2 text-sm text-gray-200">Google Gemini</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input type="radio" name="provider" value="openrouter" checked={provider === 'openrouter'} onChange={() => setProvider('openrouter')} className="text-cyan-600 focus:ring-cyan-500 bg-gray-700 border-gray-600" />
                <span className="ml-2 text-sm text-gray-200">OpenRouter</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="display-name" className="block text-sm font-medium text-gray-300">Configuration Name</label>
            <input
              id="display-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., My Gemini Flash"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="model-name" className="block text-sm font-medium text-gray-300">Model Name</label>
            <input
              id="model-name"
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder={provider === 'google' ? 'e.g., gemini-2.5-flash' : 'e.g., openai/gpt-4o'}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-300">API Key</label>
            <input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API Key"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md p-2.5 text-sm placeholder-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
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
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelConfigModal;
