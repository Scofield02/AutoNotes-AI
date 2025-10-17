import { GoogleGenAI } from '@google/genai';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import Button from './components/common/Button';
import Card from './components/common/Card';
import ProgressBar from './components/common/ProgressBar';
import { CogIcon } from './components/icons/CogIcon';
import AgentConfigModal from './components/modals/AgentConfigModal';
import ConfirmationModal from './components/modals/ConfirmationModal';
import ErrorModal from './components/modals/ErrorModal';
import FileUpload from './components/sections/FileUpload';
import AgentConfig from './components/settings/AgentConfig';
import AgentSettings from './components/settings/AgentSettings';
import WorkflowStatus from './components/workflow/WorkflowStatus';
import { INITIAL_AGENTS, SYNTHESIZER_AGENT } from './config/constants';
import { AppError, ErrorHandlingService } from './services/errorHandlingService';
import { AgentConfig as AgentConfigType, ModelConfig, WorkflowStatusEnum, WorkflowStep } from './types';
import { chunkText } from './utils/textChunker';


// Inform TypeScript that these libraries are available on the global window object.
// They are loaded via <script> tags in index.html.
declare const pdfjsLib: any;
declare const mammoth: any;
declare const JSZip: any;
declare const XLSX: any;


const App: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [markdownOutput, setMarkdownOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [currentTask, setCurrentTask] = useState('');
  
  // View management
  const [currentView, setCurrentView] = useState<'config' | 'monitor'>('config');

  // Model management state
  const [savedModels, setSavedModels] = useState<ModelConfig[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modelToDelete, setModelToDelete] = useState<ModelConfig | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  
  // Agent and workflow state
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [activeTab, setActiveTab] = useState<'workflow' | 'settings'>('workflow');
  const [allAgents, setAllAgents] = useState<AgentConfigType[]>([]);
  const [draftAgents, setDraftAgents] = useState<AgentConfigType[]>([]);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfigType | null>(null);
  const [newAgentType, setNewAgentType] = useState<'core' | 'optional'>('core');
  const [isAgentDeleteModalOpen, setIsAgentDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<AgentConfigType | null>(null);

  // Error management state
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);

  // Cancellation management
  const isCancelledRef = useRef(false);

  // Load models and agent settings from localStorage on initial render
  useEffect(() => {
    // Load models
    try {
      const storedModels = localStorage.getItem('savedAiModels');
      if (storedModels) {
        const parsedModels: ModelConfig[] = JSON.parse(storedModels);
        if (parsedModels.length > 0 && parsedModels[0].id && parsedModels[0].provider) {
          setSavedModels(parsedModels);
          if (parsedModels.length > 0) {
            setSelectedModelId(parsedModels[0].id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to load models from localStorage", error);
    }
    
    // Load agent settings
    try {
      const storedAgents = localStorage.getItem('savedAgentSettings');
      let loadedAgents: AgentConfigType[];
      if (storedAgents) {
        let parsedAgents: AgentConfigType[] = JSON.parse(storedAgents);
        
        // Backwards compatibility migration for missing properties
        const agentsWithAllProps = parsedAgents.map(agent => {
            let migratedAgent = { ...agent };
            if (!migratedAgent.type) {
              migratedAgent.type = migratedAgent.id >= 5 ? 'optional' : 'core';
            }
            if (!migratedAgent.description) {
                migratedAgent.description = `Default description for ${migratedAgent.name}.`;
            }
            return migratedAgent as AgentConfigType;
        });

        if (agentsWithAllProps.length > 0 && agentsWithAllProps[0].id && agentsWithAllProps[0].name) {
          loadedAgents = agentsWithAllProps;
        } else {
          throw new Error("Invalid agent settings format in localStorage");
        }
      } else {
        loadedAgents = [...INITIAL_AGENTS, SYNTHESIZER_AGENT];
      }
      setAllAgents(loadedAgents);
      setDraftAgents(loadedAgents); // Initialize draft state
    } catch (error) {
       console.error("Failed to load agent settings, using defaults.", error);
       const defaultAgents = [...INITIAL_AGENTS, SYNTHESIZER_AGENT];
       setAllAgents(defaultAgents);
       setDraftAgents(defaultAgents); // Initialize draft state with defaults
    }
  }, []);

  const handleSaveModel = (modelConfig: Omit<ModelConfig, 'id'> & { id?: string }) => {
    // Check for duplicate display names, excluding the current model being edited
    if (savedModels.some(m => m.displayName === modelConfig.displayName && m.id !== modelConfig.id)) {
      alert("A model configuration with this name already exists.");
      return false; // Indicate failure
    }

    let newModels: ModelConfig[];
    let newSelectedModelId = selectedModelId;

    if (modelConfig.id) { // Editing existing model
      newModels = savedModels.map(m => m.id === modelConfig.id ? { ...m, ...modelConfig } : m);
    } else { // Adding new model
      const newModel: ModelConfig = {
        ...modelConfig,
        id: `model-${Date.now()}`
      };
      newModels = [...savedModels, newModel];
      newSelectedModelId = newModel.id; // Auto-select the new model
    }
    
    setSavedModels(newModels);
    setSelectedModelId(newSelectedModelId);
    try {
      localStorage.setItem('savedAiModels', JSON.stringify(newModels));
    } catch (error) {
      console.error("Failed to save models to localStorage", error);
    }
    return true; // Indicate success
  };
  
  const handleOpenDeleteModal = (modelId: string) => {
    const model = savedModels.find(m => m.id === modelId);
    if (model) {
      setModelToDelete(model);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (!modelToDelete) return;

    const newModels = savedModels.filter(m => m.id !== modelToDelete.id);
    setSavedModels(newModels);
    
    if (selectedModelId === modelToDelete.id) {
      setSelectedModelId(newModels.length > 0 ? newModels[0].id : '');
    }
    
    try {
      localStorage.setItem('savedAiModels', JSON.stringify(newModels));
    } catch (error) {
      console.error("Failed to update models in localStorage after deletion", error);
    }

    setIsDeleteModalOpen(false);
    setModelToDelete(null);
  };

  const handleSaveAgentSettings = () => {
    setAllAgents(draftAgents);
     try {
      localStorage.setItem('savedAgentSettings', JSON.stringify(draftAgents));
    } catch (error) {
      console.error("Failed to save agent settings to localStorage", error);
    }
  };

  const handleBack = () => {
    // Discard changes by resetting draft to the last saved state
    setDraftAgents(allAgents);
  };

  const handleRequestResetAgents = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmResetAgents = () => {
    const defaultAgents = [...INITIAL_AGENTS, SYNTHESIZER_AGENT];
    setDraftAgents(defaultAgents); // Reset the draft state
    setIsResetModalOpen(false);
  };

  const handleOpenAddAgentModal = (type: 'core' | 'optional') => {
    setEditingAgent(null);
    setNewAgentType(type);
    setIsAgentModalOpen(true);
  };

  const handleOpenEditAgentModal = (agent: AgentConfigType) => {
    setEditingAgent(agent);
    setIsAgentModalOpen(true);
  };
  
  const handleSaveAgent = (agentData: Omit<AgentConfigType, 'id' | 'type'> & { id?: number }) => {
    let updatedAgents;
    if (agentData.id) { // Editing existing agent
      updatedAgents = draftAgents.map(a => a.id === agentData.id ? { ...a, ...agentData } as AgentConfigType : a);
    } else { // Adding new agent
      const newAgent: AgentConfigType = {
        ...agentData,
        id: Date.now(),
        type: newAgentType
      };
      updatedAgents = [...draftAgents, newAgent];
    }
    setDraftAgents(updatedAgents);
    setIsAgentModalOpen(false);
  };

  const handleRequestDeleteAgent = (agentId: number) => {
    const agent = draftAgents.find(a => a.id === agentId);
    if (agent) {
      setAgentToDelete(agent);
      setIsAgentDeleteModalOpen(true);
    }
  };

  const handleConfirmDeleteAgent = () => {
    if (!agentToDelete) return;

    // Prevent deleting the last core agent
    if (agentToDelete.type === 'core' && draftAgents.filter(a => a.type === 'core').length <= 1) {
        alert("You cannot delete the last core agent.");
        setIsAgentDeleteModalOpen(false);
        setAgentToDelete(null);
        return;
    }

    const updatedAgents = draftAgents.filter(a => a.id !== agentToDelete.id);
    setDraftAgents(updatedAgents);

    setIsAgentDeleteModalOpen(false);
    setAgentToDelete(null);
  };

  // Error handling functions
  const handleError = useCallback((error: unknown, context?: string, retryAction?: () => void) => {
    const classifiedError = ErrorHandlingService.classifyError(error, context);
    setCurrentError(classifiedError);
    setLastFailedAction(retryAction ? () => retryAction : null);
    console.error(ErrorHandlingService.formatErrorForLogging(classifiedError));
  }, []);

  const handleCloseError = useCallback(() => {
    setCurrentError(null);
    setLastFailedAction(null);
  }, []);

  const handleRetryError = useCallback(() => {
    if (lastFailedAction) {
      handleCloseError();
      lastFailedAction();
    }
  }, [lastFailedAction, handleCloseError]);

  const handleCancelError = useCallback(() => {
    handleCloseError();
    // If a workflow is running, stop it
    if (isRunning) {
      isCancelledRef.current = true;
      setIsRunning(false);
      setProgress(0);
      setCurrentTask('');
    }
  }, [isRunning, handleCloseError]);

  const handleFileSelect = useCallback(async (file: File | null) => {
    setSelectedFile(file);
    setExtractedText('');
    setWorkflowSteps([]);
    setMarkdownOutput('');
    setProgress(0);
    setCurrentTask('');

    if (file) {
      setIsRunning(true);
      
      try {
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        let fullText = '';
        const arrayBuffer = await file.arrayBuffer();

        switch (fileExtension) {
          case 'pdf': {
            setCurrentTask('Extracting text from PDF...');
            const typedArray = new Uint8Array(arrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            const yTolerance = 4;

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              
              if (!textContent.items || textContent.items.length === 0) {
                fullText += '\n\n';
                continue;
              }

              const sortedItems: any[] = textContent.items.slice().sort((a: any, b: any) => {
                if (a.transform[5] > b.transform[5] + yTolerance) return -1;
                if (a.transform[5] < b.transform[5] - yTolerance) return 1;
                return a.transform[4] - b.transform[4];
              });
              
              let pageText = '';
              if (sortedItems.length > 0) {
                  let lastY = sortedItems[0].transform[5];
                  for (const item of sortedItems) {
                      if (!('str' in item) || item.str.trim().length === 0) continue;
                      const currentY = item.transform[5];
                      if (currentY < lastY - yTolerance) pageText += '\n';
                      else if (pageText.length > 0 && !pageText.endsWith('\n') && !pageText.endsWith(' ')) pageText += ' ';
                      pageText += item.str;
                      lastY = currentY;
                  }
              }
              fullText += pageText + '\n\n';
            }
            break;
          }

          case 'docx': {
            setCurrentTask('Extracting text from DOCX...');
            const result = await mammoth.extractRawText({ arrayBuffer });
            fullText = result.value;
            break;
          }

          case 'pptx': {
            setCurrentTask('Extracting text from PPTX...');
            const zip = await JSZip.loadAsync(arrayBuffer);
            const slidePromises: Promise<string>[] = [];
            const slideRegex = /^ppt\/slides\/slide\d+\.xml$/;

            zip.forEach((relativePath: string, zipEntry: any) => {
                if (slideRegex.test(relativePath)) {
                    slidePromises.push(
                        zipEntry.async('string').then((xmlContent: string) => {
                            const parser = new DOMParser();
                            const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');
                            const textNodes = xmlDoc.getElementsByTagName('a:t');
                            let slideText = '';
                            for (let i = 0; i < textNodes.length; i++) {
                                if (textNodes[i].textContent) {
                                    slideText += textNodes[i].textContent + ' ';
                                }
                            }
                            return slideText.trim();
                        })
                    );
                }
            });

            const slideTexts = await Promise.all(slidePromises);
            fullText = slideTexts.join('\n\n');
            break;
          }
          
          case 'xlsx': {
            setCurrentTask('Extracting text from XLSX...');
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            let sheetContent = '';
            workbook.SheetNames.forEach((sheetName: string) => {
                const worksheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                sheetContent += data.map((row: any[]) => row.join(' ')).join('\n');
                sheetContent += '\n\n';
            });
            fullText = sheetContent.trim();
            break;
          }

          case 'txt':
          case 'md': {
            setCurrentTask(`Reading ${fileExtension.toUpperCase()} file...`);
            const decoder = new TextDecoder('utf-8');
            fullText = decoder.decode(arrayBuffer);
            break;
          }

          default:
            throw new Error(`Unsupported file type: .${fileExtension}`);
        }

        setExtractedText(fullText.trim());
        setCurrentTask('Text extracted. Ready to start workflow.');
      } catch (error) {
        console.error('Error parsing file:', error);
        setCurrentTask('Error processing file');
        setWorkflowSteps([{ message: `Error processing file`, status: WorkflowStatusEnum.Error }]);
        handleError(error, 'File processing', () => handleFileSelect(file));
      } finally {
        setIsRunning(false);
      }
    }
  }, [handleError]);

  const runWorkflow = async () => {
    if (!extractedText) {
      alert('Please upload a file and wait for text extraction.');
      return;
    }
    
    const selectedConfig = savedModels.find(m => m.id === selectedModelId);
    if (!selectedConfig || !selectedConfig.apiKey) {
      alert('Please select a configured model with a valid API key.');
      return;
    }
    
    isCancelledRef.current = false;
    setCurrentView('monitor');
    setIsRunning(true);
    setMarkdownOutput('');
    setProgress(0);

    const agentsToRun = allAgents.filter(a => a.type === 'core');
    
    if (agentsToRun.length === 0) {
      alert("No agents configured to run. Please add agents to the core workflow in settings.");
      setIsRunning(false);
      setCurrentView('config');
      return;
    }
    
    const initialSteps: WorkflowStep[] = agentsToRun.map(agent => ({
        message: agent.name,
        status: WorkflowStatusEnum.Pending,
    }));
    setWorkflowSteps(initialSteps);

    let currentText = extractedText;
    const totalSteps = agentsToRun.length;

    try {
      for (let i = 0; i < totalSteps; i++) {
        if (isCancelledRef.current) break;

        const agent = agentsToRun[i];
        setCurrentTask(agent.name);
        
        setWorkflowSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: WorkflowStatusEnum.Running } : step
        ));

        const MAX_CHUNK_SIZE = 15000;
        const textChunks = chunkText(currentText, MAX_CHUNK_SIZE);
        let processedText = '';
        
        if (isCancelledRef.current) break;

        if (selectedConfig.provider === 'google') {
          const ai = new GoogleGenAI({ apiKey: selectedConfig.apiKey });
          for (let j = 0; j < textChunks.length; j++) {
            if (isCancelledRef.current) break;
            setCurrentTask(`${agent.name} (chunk ${j + 1}/${textChunks.length})`);
            const userPrompt = `Testo da elaborare:\n${textChunks[j]}`;
            // FIX: Simplified the `contents` property for single-text prompts as per @google/genai SDK guidelines.
            const response = await ai.models.generateContent({
              model: selectedConfig.name,
              contents: userPrompt,
              config: {
                systemInstruction: agent.systemInstruction,
                temperature: agent.temperature,
              }
            });
            processedText += response.text;
          }
        } else if (selectedConfig.provider === 'openrouter') {
          const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
          for (let j = 0; j < textChunks.length; j++) {
            if (isCancelledRef.current) break;
            setCurrentTask(`${agent.name} (chunk ${j + 1}/${textChunks.length})`);
            const userPrompt = `Testo da elaborare:\n${textChunks[j]}`;
            const response = await fetch(OPENROUTER_API_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${selectedConfig.apiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: selectedConfig.name,
                messages: [
                  { role: 'system', content: agent.systemInstruction },
                  { role: 'user', content: userPrompt }
                ],
                temperature: agent.temperature,
              })
            });

            if (!response.ok) {
              const errorBody = await response.text();
              console.error('OpenRouter API Error:', errorBody);
              let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
              try {
                  const errorJson = JSON.parse(errorBody);
                  if (errorJson.error && errorJson.error.message) {
                      if (errorJson.error.message.includes("is not a valid model ID")) {
                          errorMessage = `Invalid Model Name: "${selectedConfig.name}". Please use the Model ID from OpenRouter (e.g., 'openai/gpt-4o').`;
                      } else {
                          errorMessage = `OpenRouter Error: ${errorJson.error.message}`;
                      }
                  } else {
                    errorMessage += ` - ${errorBody}`;
                  }
              } catch (e) {
                  errorMessage += ` - ${errorBody}`;
              }
              throw new Error(errorMessage);
            }

            const data = await response.json();
            processedText += data.choices[0].message.content;
          }
        }
        
        if (isCancelledRef.current) break;

        currentText = processedText;

        setWorkflowSteps(prev => prev.map((step, index) => 
          index === i ? { ...step, status: WorkflowStatusEnum.Success } : step
        ));

        const newProgress = Math.round(((i + 1) / totalSteps) * 100);
        setProgress(newProgress);
      }

      if (!isCancelledRef.current) {
        setMarkdownOutput(currentText);
        setWorkflowSteps(prev => prev.map((step, index) => 
          (index < totalSteps) ? { ...step, status: WorkflowStatusEnum.Success } : step
        ));
        setCurrentTask('Workflow completed!');
      }

    } catch (error) {
      if (isCancelledRef.current) {
        console.log("Workflow stopped, ignoring subsequent error.");
        return;
      }
      console.error('An error occurred during the workflow:', error);
      const errorStepIndex = workflowSteps.findIndex(s => s.status === WorkflowStatusEnum.Running);

      if(errorStepIndex !== -1) {
        setWorkflowSteps(prev => prev.map((step, index) => {
            if (index === errorStepIndex) {
              return { ...step, status: WorkflowStatusEnum.Error, message: `${step.message} - Failed` };
            }
            return step;
        }));
      }
      setCurrentTask('Workflow error occurred');
      handleError(error, 'AI workflow', runWorkflow);
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleRequestStopWorkflow = () => {
    setIsStopModalOpen(true);
  };

  const handleConfirmStopWorkflow = () => {
    isCancelledRef.current = true;
    handleReturnToConfig();
    setIsStopModalOpen(false);
  };

  const handleReturnToConfig = () => {
    setSelectedFile(null);
    setExtractedText('');
    setMarkdownOutput('');
    setIsRunning(false);
    setProgress(0);
    setCurrentTask('');
    setWorkflowSteps([]);
    setCurrentView('config');
  };

  const isButtonDisabled = isRunning || !selectedFile || !extractedText || !selectedModelId;

  return (
    <div className="bg-transparent text-white min-h-screen font-sans flex flex-col overflow-x-hidden">
       <div className="w-full px-4 sm:px-8 pt-4">
            <ProgressBar
                currentTask={currentTask}
                progress={progress}
                visible={currentView === 'monitor'}
            />
        </div>
      <main className="relative flex-grow flex items-center justify-center container mx-auto p-4 sm:p-8 overflow-y-auto overflow-x-hidden">
        <div className="relative w-full max-w-7xl h-[85vh] overflow-x-hidden">
          {/* Configuration View */}
          <div
            className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
              currentView === 'config' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
            }`}
          >
            <Card className="flex flex-col">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl title-shine">AutoNotes AI</h1>
                <p className="mt-2 text-lg text-gray-400">
                    Process your slides, documents, and notes.
                </p>
                
                <div className="mt-8 border-b border-gray-700">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('workflow')}
                            className={`${
                                activeTab === 'workflow'
                                ? 'border-cyan-400 text-cyan-300'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Workflow
                        </button>
                        <button
                            onClick={() => {
                                setDraftAgents(allAgents); // Initialize draft state when switching to tab
                                setActiveTab('settings');
                            }}
                            className={`${
                                activeTab === 'settings'
                                ? 'border-cyan-400 text-cyan-300'
                                : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            Configuration
                        </button>
                    </nav>
                </div>
                
                <div className="pr-2">
                    {activeTab === 'workflow' && (
                      <div id="workflow-panel">
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-white mb-2">Upload File</h2>
                            <FileUpload selectedFile={selectedFile} onFileSelect={handleFileSelect} disabled={isRunning} />
                            {!isRunning && currentTask && !extractedText && <p className="text-sm text-red-400 mt-2">{currentTask}</p>}
                        </div>
                        
                        <AgentConfig
                          savedModels={savedModels}
                          selectedModelId={selectedModelId}
                          onModelChange={setSelectedModelId}
                          onSaveModel={handleSaveModel}
                          onDeleteModel={handleOpenDeleteModal}
                          disabled={isRunning}
                        />
                      </div>
                    )}
                    
                    {activeTab === 'settings' && (
                        <div id="settings-panel" className="mt-6">
                            <AgentSettings
                                agents={draftAgents}
                                savedAgents={allAgents}
                                onAgentsUpdate={setDraftAgents}
                                onReset={handleRequestResetAgents}
                                onAddAgent={handleOpenAddAgentModal}
                                onEditAgent={handleOpenEditAgentModal}
                                onDeleteAgent={handleRequestDeleteAgent}
                                onSave={handleSaveAgentSettings}
                                onBack={handleBack}
                                disabled={isRunning}
                            />
                        </div>
                    )}
                </div>

                <div className="pt-8 border-t border-gray-800">
                    <Button 
                        onClick={runWorkflow}
                        disabled={isButtonDisabled}
                        className="w-full text-lg"
                    >
                        {isRunning ? (
                            <>
                                <CogIcon className="w-6 h-6 mr-2 animate-spin-slow" />
                                Processing...
                            </>
                        ) : 'Start Workflow'}
                    </Button>
                </div>
             </Card>
          </div>

          {/* Monitor View */}
          <div
            className={`absolute top-0 left-0 w-full h-full transition-all duration-700 ease-in-out ${
              currentView === 'monitor' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
            }`}
          >
            <WorkflowStatus 
                steps={workflowSteps}
                markdownOutput={markdownOutput}
                currentTask={currentTask}
                isRunning={isRunning}
                onReturnToConfig={handleReturnToConfig}
                onStopWorkflow={handleRequestStopWorkflow}
                onError={handleError}
            />
          </div>
        </div>
      </main>
      
      {isDeleteModalOpen && modelToDelete && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Configuration"
          confirmText="Delete"
        >
          <p className="text-gray-300">Are you sure you want to delete the configuration <strong className="font-semibold text-white">"{modelToDelete.displayName}"</strong>?</p>
          <p className="mt-2 text-sm text-gray-400">This action cannot be undone.</p>
        </ConfirmationModal>
      )}

      {isStopModalOpen && (
        <ConfirmationModal
          isOpen={isStopModalOpen}
          onClose={() => setIsStopModalOpen(false)}
          onConfirm={handleConfirmStopWorkflow}
          title="Stop Workflow"
          confirmText="Stop & Return"
          cancelText="Keep Running"
        >
          <p className="text-gray-300">Are you sure you want to stop this workflow?</p>
          <p className="mt-2 text-sm text-gray-400">All progress will be lost and you will return to the configuration screen.</p>
        </ConfirmationModal>
      )}

      {isResetModalOpen && (
        <ConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmResetAgents}
          title="Reset Agent Settings"
          confirmText="Reset Now"
        >
          <p className="text-gray-300">Are you sure you want to reset all agent settings to their defaults?</p>
          <p className="mt-2 text-sm text-gray-400">This will only affect your current unsaved changes. You will still need to save.</p>
        </ConfirmationModal>
      )}

      {isAgentModalOpen && (
        <AgentConfigModal
            agent={editingAgent}
            agentType={newAgentType}
            onClose={() => setIsAgentModalOpen(false)}
            onSave={handleSaveAgent}
        />
      )}

      {isAgentDeleteModalOpen && agentToDelete && (
        <ConfirmationModal
            isOpen={isAgentDeleteModalOpen}
            onClose={() => setIsAgentDeleteModalOpen(false)}
            onConfirm={handleConfirmDeleteAgent}
            title="Delete Agent"
            confirmText="Delete"
        >
          <p className="text-gray-300">Are you sure you want to delete the agent <strong className="font-semibold text-white">"{agentToDelete.name}"</strong>?</p>
          <p className="mt-2 text-sm text-gray-400">This action will be applied to your current unsaved changes.</p>
        </ConfirmationModal>
      )}

      {currentError && (
        <ErrorModal
          error={currentError}
          onClose={handleCloseError}
          onRetry={currentError.retryable ? handleRetryError : undefined}
          onCancel={isRunning ? handleCancelError : undefined}
        />
      )}
    </div>
  );
};

export default App;