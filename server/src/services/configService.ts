/**
 * Service layer for configuration management
 * This file provides a clean interface between the API routes and database queries
 */

import { ModelConfig, modelConfigQueries, WorkflowAgent, workflowAgentQueries } from '../database/db.js';

export interface CreateModelConfigDto {
  id: string;
  display_name: string;
  provider: 'google' | 'openrouter';
  model_name: string;
  api_key: string;
}

export interface UpdateModelConfigDto {
  display_name?: string;
  provider?: 'google' | 'openrouter';
  model_name?: string;
  api_key?: string;
}

export interface CreateWorkflowAgentDto {
  name: string;
  type: 'core' | 'optional';
  description: string;
  temperature: number;
  system_instruction: string;
  is_active: boolean;
  sort_order: number;
}

export interface UpdateWorkflowAgentDto {
  name?: string;
  type?: 'core' | 'optional';
  description?: string;
  temperature?: number;
  system_instruction?: string;
  is_active?: boolean;
  sort_order?: number;
}

export class ConfigService {
  // ==================== MODEL CONFIGS ====================
  
  async getAllModelConfigs(): Promise<ModelConfig[]> {
    return await modelConfigQueries.getAll();
  }

  async getModelConfigById(id: string): Promise<ModelConfig | undefined> {
    return await modelConfigQueries.getById(id);
  }

  async createModelConfig(data: CreateModelConfigDto): Promise<ModelConfig | undefined> {
    return await modelConfigQueries.create(data);
  }

  async updateModelConfig(id: string, data: UpdateModelConfigDto): Promise<ModelConfig | undefined> {
    return await modelConfigQueries.update(id, data);
  }

  async deleteModelConfig(id: string): Promise<boolean> {
    return await modelConfigQueries.delete(id);
  }

  // ==================== WORKFLOW AGENTS ====================
  
  async getAllWorkflowAgents(): Promise<WorkflowAgent[]> {
    return await workflowAgentQueries.getAll();
  }

  async getActiveWorkflowAgents(): Promise<WorkflowAgent[]> {
    return await workflowAgentQueries.getActive();
  }

  async getWorkflowAgentById(id: number): Promise<WorkflowAgent | undefined> {
    return await workflowAgentQueries.getById(id);
  }

  async createWorkflowAgent(data: CreateWorkflowAgentDto): Promise<WorkflowAgent | undefined> {
    return await workflowAgentQueries.create({
      ...data,
      is_active: data.is_active ? 1 : 0
    });
  }

  async updateWorkflowAgent(id: number, data: UpdateWorkflowAgentDto): Promise<WorkflowAgent | undefined> {
    const updateData: any = { ...data };
    if (data.is_active !== undefined) {
      updateData.is_active = data.is_active ? 1 : 0;
    }
    return await workflowAgentQueries.update(id, updateData);
  }

  async deleteWorkflowAgent(id: number): Promise<boolean> {
    return await workflowAgentQueries.delete(id);
  }

  async resetWorkflowToDefaults(): Promise<WorkflowAgent[]> {
    return await workflowAgentQueries.resetToDefaults();
  }
}

export const configService = new ConfigService();
