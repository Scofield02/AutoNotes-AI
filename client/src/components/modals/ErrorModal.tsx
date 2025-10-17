import React, { useEffect } from 'react';
import type { AppError } from '../../services/errorHandlingService';
import { ErrorSeverity } from '../../services/errorHandlingService';
import { ExclamationCircleIcon } from '../icons/ExclamationCircleIcon';
import { ExclamationTriangleIcon } from '../icons/ExclamationTriangleIcon';
import { InformationCircleIcon } from '../icons/InformationCircleIcon';
import { XMarkIcon } from '../icons/XMarkIcon';

interface ErrorModalProps {
  error: AppError | null;
  onClose: () => void;
  onRetry?: () => void;
  onCancel?: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose, onRetry, onCancel }) => {
  // Handle ESC key to close dismissable errors
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && error?.dismissable) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [error?.dismissable, onClose]);

  if (!error) return null;

  const getSeverityIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <ExclamationCircleIcon className="w-12 h-12 text-red-500" />;
      case ErrorSeverity.ERROR:
        return <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />;
      case ErrorSeverity.WARNING:
        return <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />;
      case ErrorSeverity.INFO:
        return <InformationCircleIcon className="w-12 h-12 text-blue-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return 'border-red-500/30';
      case ErrorSeverity.WARNING:
        return 'border-yellow-500/30';
      case ErrorSeverity.INFO:
        return 'border-blue-500/30';
    }
  };

  const getBackgroundGradient = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.ERROR:
        return 'from-red-500/5 to-transparent';
      case ErrorSeverity.WARNING:
        return 'from-yellow-500/5 to-transparent';
      case ErrorSeverity.INFO:
        return 'from-blue-500/5 to-transparent';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className={`bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border-2 ${getSeverityColor()} max-w-md w-full animate-slideUp overflow-hidden`}
        role="alertdialog"
        aria-labelledby="error-title"
        aria-describedby="error-description"
      >
        {/* Gradient header background */}
        <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${getBackgroundGradient()} pointer-events-none`} />
        
        {/* Header */}
        <div className="relative flex items-start justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getSeverityIcon()}
            </div>
            <div>
              <h3 id="error-title" className="text-xl font-semibold text-white">
                {error.title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {new Date(error.timestamp).toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
            </div>
          </div>
          {error.dismissable && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-lg"
              aria-label="Chiudi"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="relative p-6 space-y-4">
          <p id="error-description" className="text-gray-300 leading-relaxed">
            {error.message}
          </p>

          {error.details && (
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">
                <span className="font-medium text-gray-300">Dettagli: </span>
                {error.details}
              </p>
            </div>
          )}

          {/* Development only: show stack trace */}
          {process.env.NODE_ENV === 'development' && error.originalError && (
            <details className="text-xs text-gray-500">
              <summary className="cursor-pointer hover:text-gray-400 select-none">
                Stack Trace (solo in sviluppo)
              </summary>
              <pre className="mt-2 p-3 bg-gray-900/50 rounded-lg overflow-x-auto text-[10px] leading-tight">
                {error.originalError.stack}
              </pre>
            </details>
          )}
        </div>

        {/* Footer with actions */}
        <div className="relative flex items-center justify-end gap-3 p-6 border-t border-gray-700/50 bg-gray-800/30">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              Annulla
            </button>
          )}

          {error.dismissable && !error.retryable && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700/80 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Chiudi
            </button>
          )}

          {error.retryable && onRetry && (
            <>
              {error.dismissable && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
                >
                  Chiudi
                </button>
              )}
              <button
                onClick={onRetry}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Riprova
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
