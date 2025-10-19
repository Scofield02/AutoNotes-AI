import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { pdfExportService } from '../../services/pdfExportService';
import { WorkflowStep } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { ArrowsPointingOutIcon } from '../icons/ArrowsPointingOutIcon';
import { DocumentArrowDownIcon } from '../icons/DocumentArrowDownIcon';
import { DocumentDuplicateIcon } from '../icons/DocumentDuplicateIcon';
import { DocumentPlusIcon } from '../icons/DocumentPlusIcon';
import { XCircleIcon } from '../icons/XCircleIcon';
import PreviewModal from '../modals/PreviewModal';
import WorkflowStepsList from './WorkflowStepsList';


// This is loaded from a <script> tag in index.html
declare var marked: any;

interface WorkflowStatusProps {
  steps: WorkflowStep[];
  markdownOutput: string;
  currentTask: string;
  isRunning: boolean;
  onReturnToConfig: () => void;
  onStopWorkflow: () => void;
  onError?: (error: unknown, context?: string, retryAction?: () => void) => void;
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  steps,
  markdownOutput,
  currentTask,
  isRunning,
  onReturnToConfig,
  onStopWorkflow,
  onError,
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const renderedHtml = useMemo(() => {
    if (!markdownOutput) return '';
    // Handle Obsidian's ==highlight== syntax by replacing it with <mark> tags
    const textWithHighlights = markdownOutput.replace(/==(.*?)==/g, '<mark>$1</mark>');
    // Use marked to parse the markdown into HTML
    return marked.parse(textWithHighlights);
  }, [markdownOutput]);

  useEffect(() => {
    if (copyButtonText === 'Copied!') {
      const timer = setTimeout(() => setCopyButtonText('Copy'), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyButtonText]);

  // Extract filename from first H1 heading or use default
  const getFilename = useCallback((content: string): string => {
    if (!content) return 'appunti_generati';
    
    // Try to find first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
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
    if (!markdownOutput) return;
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setCopyButtonText('Copied!');
    } catch (error) {
      console.error('Copy failed:', error);
      if (onError) {
        onError(error, 'Copia negli appunti', handleCopy);
      }
    }
  }, [markdownOutput, onError]);

  const handleDownloadMd = useCallback(() => {
    if (!markdownOutput) return;
    try {
      const filename = getFilename(markdownOutput);
      const blob = new Blob([markdownOutput], { type: 'text/markdown;charset=utf-8' });
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
  }, [markdownOutput, getFilename, onError]);

  const handleExportPDF = useCallback(async () => {
    if (!markdownOutput || isExportingPDF) return;
    
    setIsExportingPDF(true);
    try {
      const filename = getFilename(markdownOutput);
      await pdfExportService.exportAndDownload(
        markdownOutput,
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
  }, [markdownOutput, isExportingPDF, getFilename, onError]);


  return (
    <>
      <Card className="flex flex-col">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-3 sm:mb-4">Monitor & Export</h2>
        
        <div className="space-y-3 sm:space-y-4 my-2">
          <WorkflowStepsList steps={steps} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 mt-2 gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-white">Processed Content</h3>
          <div className="flex items-center space-x-1 bg-gray-800/70 p-1 rounded-md w-full sm:w-auto">
            <button
              onClick={() => setViewMode('code')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded transition-colors ${viewMode === 'code' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`flex-1 sm:flex-none px-3 py-1 text-xs font-semibold rounded transition-colors ${viewMode === 'preview' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="relative group mb-4 sm:mb-6">
          <div className="relative bg-gray-900/50 rounded-lg border border-gray-700 shadow-inner overflow-hidden">
            {!markdownOutput && isRunning ? (
              <LoadingSkeleton />
            ) : !markdownOutput && !isRunning ? (
              <div className="flex items-center justify-center min-h-[120px] text-gray-500 text-center p-4">
                The workflow has started. Processed content will appear here.
              </div>
            ) : viewMode === 'code' ? (
              <pre className="whitespace-pre-wrap text-gray-300 font-mono text-xs sm:text-sm p-3 sm:p-4 overflow-y-auto max-h-[50vh]">{markdownOutput}</pre>
            ) : (
              <div 
                className="markdown-preview p-3 sm:p-4 overflow-y-auto max-h-[50vh] text-sm sm:text-base"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            )}
          </div>

          {markdownOutput && (
            <div 
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out rounded-lg cursor-pointer"
                onClick={() => setIsPreviewModalOpen(true)}
                role="button"
                aria-label="Expand Preview"
            >
                <div className="flex flex-col items-center text-gray-200 pointer-events-none">
                    <ArrowsPointingOutIcon className="w-8 h-8 sm:w-10 sm:h-10 mb-2" />
                    <span className="font-semibold text-sm sm:text-base">Expand</span>
                </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:gap-3">
          {isRunning ? (
            <Button onClick={onStopWorkflow} variant="secondary" className="bg-red-800/80 hover:bg-red-700/80 w-full text-sm sm:text-base">
              <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Stop Workflow
            </Button>
          ) : (
            steps.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                {markdownOutput && (
                  <>
                    <Button onClick={handleCopy} variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
                      <DocumentDuplicateIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {copyButtonText}
                    </Button>
                    <Button onClick={handleDownloadMd} variant="secondary" className="w-full sm:w-auto text-sm sm:text-base">
                      <ArrowDownTrayIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Download .MD
                    </Button>
                    <Button 
                      onClick={handleExportPDF} 
                      variant="secondary"
                      disabled={isExportingPDF}
                      className="w-full sm:w-auto bg-blue-600/80 hover:bg-blue-500/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <DocumentArrowDownIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {isExportingPDF ? 'Exporting...' : 'Export PDF'}
                    </Button>
                  </>
                )}
                <Button onClick={onReturnToConfig} className="w-full sm:w-auto text-sm sm:text-base">
                  <DocumentPlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">{markdownOutput ? 'Process Another File' : 'Return to Configuration'}</span>
                  <span className="sm:hidden">{markdownOutput ? 'New File' : 'Back'}</span>
                </Button>
              </div>
            )
          )}
        </div>
      </Card>
      
      {isPreviewModalOpen && (
        <PreviewModal 
          content={markdownOutput}
          onClose={() => setIsPreviewModalOpen(false)}
        />
      )}
    </>
  );
};

export default WorkflowStatus;