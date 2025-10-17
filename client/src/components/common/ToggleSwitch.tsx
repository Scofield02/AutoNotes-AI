import React from 'react';

interface ToggleSwitchProps {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, description, enabled, onChange, disabled = false }) => {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!enabled);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex-grow pr-4">
        <span className={`block text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-200'}`}>{label}</span>
        <span className="block text-xs text-gray-500">{description}</span>
      </div>
      <button
        type="button"
        className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 ${
          disabled ? 'cursor-not-allowed opacity-50' : ''
        } ${enabled ? 'bg-cyan-600' : 'bg-gray-600'}`}
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={disabled}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200 ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;
