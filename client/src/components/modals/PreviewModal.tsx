import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { pdfExportService } from '../../services/pdfExportService';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';
import { XMarkIcon } from '../icons/XMarkIcon';

// This is loaded from a <script> tag in index.html
declare var marked: any;

interface PreviewModalProps {
  content: string;
  onClose: () => void;
  onError?: (error: unknown, context?: string, retryAction?: () => void) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ content, onClose, onError }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('preview');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

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

  // Extract filename from first H1 heading or use default
  const getFilename = useCallback((text: string): string => {
    if (!text) return 'appunti_generati';
    
    // Try to find first H1 heading
    const h1Match = text.match(/^#\s+(.+)$/m);
    if (h1Match && h1Match[1]) {
      // Clean the title: remove special chars, replace spaces with underscores
      return h1Match[1]
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '_')      // Replace spaces with underscores
        .toLowerCase()
        .substring(0, 50);         // Limit length
    }
    
    return 'appunti_generati';
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyButtonText('Copied!');
    } catch (error) {
      console.error('Copy failed:', error);
      if (onError) {
        onError(error, 'Copia negli appunti', handleCopy);
      }
    }
  }, [content, onError]);

  const handleDownloadMd = useCallback(() => {
    try {
      const filename = getFilename(content);
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download MD failed:', error);
      if (onError) {
        onError(error, 'Download Markdown', handleDownloadMd);
      }
    }
  }, [content, getFilename, onError]);

  const handleExportPDF = useCallback(async () => {
    if (isExportingPDF) return;
    
    setIsExportingPDF(true);
    try {
      const filename = getFilename(content);
      await pdfExportService.exportAndDownload(
        content,
        `${filename}.pdf`,
        {
          title: 'AutoNotes Document',
          author: 'AutoNotes AI',
          date: new Date().toLocaleDateString('it-IT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      );
    } catch (error) {
      console.error('PDF Export failed:', error);
      if (onError) {
        onError(error, 'Export PDF', handleExportPDF);
      } else {
        alert('Failed to export PDF. Please make sure the server is running.');
      }
    } finally {
      setIsExportingPDF(false);
    }
  }, [content, isExportingPDF, getFilename, onError]);

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
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 gap-3">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h2 id="modal-title" className="text-lg font-semibold text-white">
              Content Preview
            </h2>
            <button
              onClick={onClose}
              className="sm:hidden p-1.5 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-700/50 p-1 rounded-md">
              <button
                onClick={() => setViewMode('code')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded transition-colors ${viewMode === 'code' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                Code
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-semibold rounded transition-colors ${viewMode === 'preview' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-600'}`}
              >
                Preview
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy} 
                title="Copy Markdown" 
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <DocumentDuplicateIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{copyButtonText}</span>
              </button>
              <button 
                onClick={handleDownloadMd} 
                title="Download as Markdown" 
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center"
              >
                <ArrowDownTrayIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Download .MD</span>
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                title="Export as PDF" 
                className="flex-1 sm:flex-none px-3 py-1.5 text-sm font-medium text-white bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <DocumentArrowDownIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isExportingPDF ? 'Exporting...' : 'Export PDF'}</span>
              </button>
              <button
                onClick={onClose}
                className="hidden sm:block p-1.5 text-gray-400 rounded-md hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-grow p-4 sm:p-6 overflow-y-auto">
          {viewMode === 'code' ? (
            <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs sm:text-sm bg-gray-900/50 rounded-lg p-4 border border-gray-700">{content}</pre>
          ) : (
            <div
              className="markdown-preview"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default PreviewModal;
