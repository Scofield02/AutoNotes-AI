export type ModelProvider = 'google' | 'openrouter';

export interface ModelConfig {
  id: string; // Unique identifier for the config
  provider: ModelProvider;
  displayName: string; // User-friendly name for the config
  name: string; // The actual model name/ID (e.g., 'gemini-2.5-flash' or 'openai/gpt-4o')
  apiKey: string;
}

export interface AgentConfig {
  id: number;
  name: string;
  type: 'core' | 'optional';
  description: string;
  temperature: number;
  systemInstruction: string;
}

export enum WorkflowStatusEnum {
  Pending = 'pending',
  Running = 'running',
  Success = 'success',
  Error = 'error',
}

export interface WorkflowStep {
  message: string;
  status: WorkflowStatusEnum;
}