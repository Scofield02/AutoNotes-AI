import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';
import { XMarkIcon } from '../icons/XMarkIcon';

// This is loaded from a <script> tag in index.html
declare var marked: any;

interface PreviewModalProps {
  content: string;
  onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ content, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');

  const renderedHtml = useMemo(() => {
    if (!content) return '';
    const textWithHighlights = content.replace(/==(.*?)==/g, '<mark>$1</mark>');
    return marked.parse(textWithHighlights);
  }, [content]);

  useEffect(() => {
    // Disable scrolling on the body when the modal is open
    document.body.style.overflow = 'hidden';
    // Add event listener for Escape key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (copyButtonText === 'Copied!') {
      const timer = setTimeout(() => {
        setCopyButtonText('Copy');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copyButtonText]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopyButtonText('Copied!');
    });
  }, [content]);

  const handleDownloadMd = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autonotes-output.md';
    link.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm modal-backdrop"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 flex flex-col w-full h-full max-w-6xl bg-gray-800/80 border border-white/10 rounded-xl shadow-2xl modal-content">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 id="modal-title" className="text-lg font-semibold text-white">
            Content Preview
          </h2>
          <div className="flex items-center space-x-2">
            <button onClick={handleCopy} title="Copy Markdown" className="px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center">
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                {copyButtonText}
            </button>
             <button onClick={handleDownloadMd} title="Download as Markdown" className="px-3 py-1.5 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors flex items-center">
                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        <main className="flex-grow p-6 overflow-y-auto">
          <div
            className="markdown-preview"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </main>
      </div>
    </div>
  );
};

export default PreviewModal;
