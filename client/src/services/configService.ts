import { AgentConfig, ModelConfig } from '../types';

const API_BASE_URL = 'http://localhost:3001';

// Helper functions to convert between snake_case (server) and camelCase (client)
function modelFromServer(serverModel: any): ModelConfig {
  return {
    id: serverModel.id,
    provider: serverModel.provider,
    displayName: serverModel.display_name,
    name: serverModel.model_name,
    apiKey: serverModel.api_key,
  };
}

function agentFromServer(serverAgent: any): AgentConfig {
  return {
    id: serverAgent.id,
    name: serverAgent.name,
    type: serverAgent.type,
    description: serverAgent.description,
    temperature: serverAgent.temperature,
    systemInstruction: serverAgent.system_instruction,
  };
}

/**
 * Service layer for configuration API calls
 */
class ConfigService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // ==================== Model Configurations ====================

  /**
   * Get all model configurations
   */
  async getAllModels(): Promise<ModelConfig[]> {
    const data = await this.fetchApi<any[]>('/api/config/models');
    return (data || []).map(modelFromServer);
  }

  /**
   * Get a specific model configuration by ID
   */
  async getModelById(id: string): Promise<ModelConfig> {
    const data = await this.fetchApi<any>(`/api/config/models/${id}`);
    return modelFromServer(data);
  }

  /**
   * Create a new model configuration
   */
  async createModel(model: Omit<ModelConfig, 'id'>): Promise<ModelConfig> {
    // Convert camelCase to snake_case for server
    const serverModel = {
      id: `model-${Date.now()}`, // Generate ID client-side
      display_name: model.displayName,
      provider: model.provider,
      model_name: model.name,
      api_key: model.apiKey,
    };
    
    const data = await this.fetchApi<any>('/api/config/models', {
      method: 'POST',
      body: JSON.stringify(serverModel),
    });
    return modelFromServer(data);
  }

  /**
   * Update an existing model configuration
   */
  async updateModel(id: string, updates: Partial<Omit<ModelConfig, 'id'>>): Promise<ModelConfig> {
    // Convert camelCase to snake_case for server
    const serverUpdates: any = {};
    if (updates.displayName) serverUpdates.display_name = updates.displayName;
    if (updates.provider) serverUpdates.provider = updates.provider;
    if (updates.name) serverUpdates.model_name = updates.name;
    if (updates.apiKey) serverUpdates.api_key = updates.apiKey;
    
    const data = await this.fetchApi<any>(`/api/config/models/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serverUpdates),
    });
    return modelFromServer(data);
  }

  /**
   * Delete a model configuration
   */
  async deleteModel(id: string): Promise<void> {
    await this.fetchApi<any>(`/api/config/models/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Workflow Agents ====================

  /**
   * Get all workflow agents
   */
  async getAllAgents(): Promise<AgentConfig[]> {
    const data = await this.fetchApi<any[]>('/api/config/agents');
    return (data || []).map(agentFromServer);
  }

  /**
   * Get only active workflow agents
   */
  async getActiveAgents(): Promise<AgentConfig[]> {
    const data = await this.fetchApi<any[]>('/api/config/agents/active');
    return (data || []).map(agentFromServer);
  }

  /**
   * Get a specific workflow agent by ID
   */
  async getAgentById(id: number): Promise<AgentConfig> {
    const data = await this.fetchApi<any>(`/api/config/agents/${id}`);
    return agentFromServer(data);
  }

  /**
   * Create a new custom workflow agent
   */
  async createAgent(agent: Omit<AgentConfig, 'id'>): Promise<AgentConfig> {
    // Convert camelCase to snake_case for server
    const serverAgent = {
      name: agent.name,
      type: agent.type,
      description: agent.description,
      temperature: agent.temperature,
      system_instruction: agent.systemInstruction,
      is_active: 1,
      sort_order: 10, // Default sort order for custom agents
    };
    
    const data = await this.fetchApi<any>('/api/config/agents', {
      method: 'POST',
      body: JSON.stringify(serverAgent),
    });
    return agentFromServer(data);
  }

  /**
   * Update an existing workflow agent
   */
  async updateAgent(id: number, updates: Partial<Omit<AgentConfig, 'id'>>): Promise<AgentConfig> {
    // Convert camelCase to snake_case for server
    const serverUpdates: any = {};
    if (updates.name) serverUpdates.name = updates.name;
    if (updates.type) serverUpdates.type = updates.type;
    if (updates.description) serverUpdates.description = updates.description;
    if (updates.temperature !== undefined) serverUpdates.temperature = updates.temperature;
    if (updates.systemInstruction) serverUpdates.system_instruction = updates.systemInstruction;
    
    const data = await this.fetchApi<any>(`/api/config/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serverUpdates),
    });
    return agentFromServer(data);
  }

  /**
   * Delete a custom workflow agent
   */
  async deleteAgent(id: number): Promise<void> {
    await this.fetchApi<any>(`/api/config/agents/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reset workflow agents to default configuration
   */
  async resetAgentsToDefaults(): Promise<AgentConfig[]> {
    const data = await this.fetchApi<any[]>('/api/config/agents/reset', {
      method: 'POST',
    });
    return (data || []).map(agentFromServer);
  }
}

// Export singleton instance
export const configService = new ConfigService();
