import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WorkflowStep } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';
import { ArrowDownTrayIcon } from '../icons/ArrowDownTrayIcon';
import { ArrowsPointingOutIcon } from '../icons/ArrowsPointingOutIcon';
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
}

const WorkflowStatus: React.FC<WorkflowStatusProps> = ({
  steps,
  markdownOutput,
  currentTask,
  isRunning,
  onReturnToConfig,
  onStopWorkflow,
}) => {
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [copyButtonText, setCopyButtonText] = useState('Copy');

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

  const handleCopy = useCallback(() => {
    if (!markdownOutput) return;
    navigator.clipboard.writeText(markdownOutput).then(() => {
      setCopyButtonText('Copied!');
    });
  }, [markdownOutput]);

  const handleDownloadMd = useCallback(() => {
    if (!markdownOutput) return;
    const blob = new Blob([markdownOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'autonotes-output.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [markdownOutput]);


  return (
    <>
      <Card className="flex flex-col h-full">
        <h2 className="text-xl font-semibold text-white mb-4">Monitor & Export</h2>
        
        <div className="space-y-4 my-2">
          <WorkflowStepsList steps={steps} />
        </div>

        <div className="flex items-center justify-between mb-4 mt-2">
          <h3 className="text-lg font-semibold text-white">Processed Content</h3>
          <div className="flex items-center space-x-1 bg-gray-800/70 p-1 rounded-md">
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${viewMode === 'code' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Code
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${viewMode === 'preview' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="relative flex-grow flex flex-col min-h-0 group">
          <div className="relative bg-gray-900/50 rounded-lg border border-gray-700 flex-grow overflow-hidden shadow-inner">
            {!markdownOutput && isRunning ? (
              <LoadingSkeleton />
            ) : !markdownOutput && !isRunning ? (
              <div className="flex items-center justify-center h-full text-gray-500 text-center p-4">
                The workflow has started. Processed content will appear here.
              </div>
            ) : viewMode === 'code' ? (
              <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm p-4 overflow-y-auto h-full">{markdownOutput}</pre>
            ) : (
              <div 
                className="markdown-preview p-4 overflow-y-auto h-full"
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
                    <ArrowsPointingOutIcon className="w-10 h-10 mb-2" />
                    <span className="font-semibold">Expand</span>
                </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:items-stretch">
          {isRunning ? (
            <Button onClick={onStopWorkflow} variant="secondary" className="bg-red-800/80 hover:bg-red-700/80">
              <XCircleIcon className="w-5 h-5 mr-2" />
              Stop Workflow
            </Button>
          ) : (
            steps.length > 0 && (
              <>
                {markdownOutput && (
                  <>
                    <Button onClick={handleCopy} variant="secondary">
                      <DocumentDuplicateIcon className="w-5 h-5 mr-2" />
                      {copyButtonText}
                    </Button>
                    <Button onClick={handleDownloadMd} variant="secondary">
                      <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                      Download .MD
                    </Button>
                  </>
                )}
                <Button onClick={onReturnToConfig}>
                  <DocumentPlusIcon className="w-5 h-5 mr-2" />
                  {markdownOutput ? 'Process Another File' : 'Return to Configuration'}
                </Button>
              </>
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