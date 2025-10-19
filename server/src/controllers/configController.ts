import { Request, Response, Router } from 'express';
import { modelConfigQueries, workflowAgentQueries } from '../database/db.js';

export const configRouter = Router();

// ==================== MODEL CONFIGS ====================

// Get all model configurations
configRouter.get('/models', async (req: Request, res: Response) => {
  try {
    const configs = await modelConfigQueries.getAll();
    res.json(configs);
  } catch (error) {
    console.error('Error fetching model configs:', error);
    res.status(500).json({ error: 'Failed to fetch model configurations' });
  }
});

// Get model configuration by ID
configRouter.get('/models/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await modelConfigQueries.getById(id);
    
    if (!config) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    res.json(config);
  } catch (error) {
    console.error('Error fetching model config:', error);
    res.status(500).json({ error: 'Failed to fetch model configuration' });
  }
});

// Create new model configuration
configRouter.post('/models', async (req: Request, res: Response) => {
  try {
    const { id, display_name, provider, model_name, api_key } = req.body;
    
    // Validation
    if (!id || !display_name || !provider || !model_name || !api_key) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (provider !== 'google' && provider !== 'openrouter') {
      return res.status(400).json({ error: 'Invalid provider. Must be "google" or "openrouter"' });
    }
    
    const newConfig = await modelConfigQueries.create({
      id,
      display_name,
      provider,
      model_name,
      api_key
    });
    
    res.status(201).json(newConfig);
  } catch (error: any) {
    console.error('Error creating model config:', error);
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Model configuration with this ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create model configuration' });
  }
});

// Update model configuration
configRouter.put('/models/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { display_name, provider, model_name, api_key } = req.body;
    
    // Validation for provider if provided
    if (provider && provider !== 'google' && provider !== 'openrouter') {
      return res.status(400).json({ error: 'Invalid provider. Must be "google" or "openrouter"' });
    }
    
    const updatedConfig = await modelConfigQueries.update(id, {
      display_name,
      provider,
      model_name,
      api_key
    });
    
    if (!updatedConfig) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    res.json(updatedConfig);
  } catch (error) {
    console.error('Error updating model config:', error);
    res.status(500).json({ error: 'Failed to update model configuration' });
  }
});

// Delete model configuration
configRouter.delete('/models/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await modelConfigQueries.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Model configuration not found' });
    }
    
    res.json({ success: true, message: 'Model configuration deleted' });
  } catch (error) {
    console.error('Error deleting model config:', error);
    res.status(500).json({ error: 'Failed to delete model configuration' });
  }
});

// ==================== WORKFLOW AGENTS ====================

// Get all workflow agents
configRouter.get('/agents', async (req: Request, res: Response) => {
  try {
    const agents = await workflowAgentQueries.getAll();
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch workflow agents' });
  }
});

// Get active workflow agents only
configRouter.get('/agents/active', async (req: Request, res: Response) => {
  try {
    const agents = await workflowAgentQueries.getActive();
    res.json(agents);
  } catch (error) {
    console.error('Error fetching active agents:', error);
    res.status(500).json({ error: 'Failed to fetch active workflow agents' });
  }
});

// Get workflow agent by ID
configRouter.get('/agents/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }
    
    const agent = await workflowAgentQueries.getById(id);
    
    if (!agent) {
      return res.status(404).json({ error: 'Workflow agent not found' });
    }
    
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch workflow agent' });
  }
});

// Create new workflow agent (custom only)
configRouter.post('/agents', async (req: Request, res: Response) => {
  try {
    const { name, type, description, temperature, system_instruction, is_active, sort_order } = req.body;
    
    // Validation
    if (!name || !type || !description || temperature === undefined || !system_instruction || sort_order === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (type !== 'core' && type !== 'optional') {
      return res.status(400).json({ error: 'Invalid type. Must be "core" or "optional"' });
    }
    
    if (temperature < 0 || temperature > 1) {
      return res.status(400).json({ error: 'Temperature must be between 0 and 1' });
    }
    
    const newAgent = await workflowAgentQueries.create({
      name,
      type,
      description,
      temperature,
      system_instruction,
      is_active: is_active ? 1 : 0,
      sort_order
    });
    
    res.status(201).json(newAgent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create workflow agent' });
  }
});

// Update workflow agent
configRouter.put('/agents/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }
    
    const { name, type, description, temperature, system_instruction, is_active, sort_order } = req.body;
    
    // Validation for type if provided
    if (type && type !== 'core' && type !== 'optional') {
      return res.status(400).json({ error: 'Invalid type. Must be "core" or "optional"' });
    }
    
    // Validation for temperature if provided
    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      return res.status(400).json({ error: 'Temperature must be between 0 and 1' });
    }
    
    const updatedAgent = await workflowAgentQueries.update(id, {
      name,
      type,
      description,
      temperature,
      system_instruction,
      is_active: is_active !== undefined ? (is_active ? 1 : 0) : undefined,
      sort_order
    });
    
    if (!updatedAgent) {
      return res.status(404).json({ error: 'Workflow agent not found' });
    }
    
    res.json(updatedAgent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update workflow agent' });
  }
});

// Delete workflow agent (custom only)
configRouter.delete('/agents/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid agent ID' });
    }
    
    const deleted = await workflowAgentQueries.delete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow agent not found or cannot be deleted (only custom agents can be deleted)' });
    }
    
    res.json({ success: true, message: 'Workflow agent deleted' });
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete workflow agent' });
  }
});

// Reset workflow to defaults
configRouter.post('/agents/reset', async (req: Request, res: Response) => {
  try {
    const agents = await workflowAgentQueries.resetToDefaults();
    res.json({ success: true, message: 'Workflow reset to defaults', agents });
  } catch (error) {
    console.error('Error resetting workflow:', error);
    res.status(500).json({ error: 'Failed to reset workflow to defaults' });
  }
});
