import path, { dirname } from 'path';
import { Database } from 'sqlite';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './init-db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const DB_PATH = path.join(__dirname, '../../data/autonotes.db');

// Singleton database instance
let dbInstance: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await initializeDatabase(DB_PATH);
  }
  return dbInstance;
}

export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
}

// Types for database entities
export interface ModelConfig {
  id: string;
  display_name: string;
  provider: 'google' | 'openrouter';
  model_name: string;
  api_key: string;
  created_at: number;
  updated_at: number;
}

export interface WorkflowAgent {
  id: number;
  name: string;
  type: 'core' | 'optional';
  description: string;
  temperature: number;
  system_instruction: string;
  is_active: number;
  is_custom: number;
  sort_order: number;
  created_at: number;
  updated_at: number;
}

// Model Configs queries
export const modelConfigQueries = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.all('SELECT * FROM model_configs ORDER BY created_at DESC') as ModelConfig[];
  },

  getById: async (id: string) => {
    const db = await getDatabase();
    return await db.get('SELECT * FROM model_configs WHERE id = ?', id) as ModelConfig | undefined;
  },

  create: async (config: Omit<ModelConfig, 'created_at' | 'updated_at'>) => {
    const db = await getDatabase();
    await db.run(`
      INSERT INTO model_configs (id, display_name, provider, model_name, api_key)
      VALUES (?, ?, ?, ?, ?)
    `, config.id, config.display_name, config.provider, config.model_name, config.api_key);
    return await modelConfigQueries.getById(config.id);
  },

  update: async (id: string, config: Partial<Omit<ModelConfig, 'id' | 'created_at' | 'updated_at'>>) => {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (config.display_name !== undefined) {
      fields.push('display_name = ?');
      values.push(config.display_name);
    }
    if (config.provider !== undefined) {
      fields.push('provider = ?');
      values.push(config.provider);
    }
    if (config.model_name !== undefined) {
      fields.push('model_name = ?');
      values.push(config.model_name);
    }
    if (config.api_key !== undefined) {
      fields.push('api_key = ?');
      values.push(config.api_key);
    }

    if (fields.length === 0) return await modelConfigQueries.getById(id);

    values.push(id);
    await db.run(`UPDATE model_configs SET ${fields.join(', ')} WHERE id = ?`, ...values);
    return await modelConfigQueries.getById(id);
  },

  delete: async (id: string) => {
    const db = await getDatabase();
    const result = await db.run('DELETE FROM model_configs WHERE id = ?', id);
    return result.changes !== undefined && result.changes > 0;
  }
};

// Workflow Agents queries
export const workflowAgentQueries = {
  getAll: async () => {
    const db = await getDatabase();
    return await db.all('SELECT * FROM workflow_agents ORDER BY sort_order ASC') as WorkflowAgent[];
  },

  getActive: async () => {
    const db = await getDatabase();
    return await db.all('SELECT * FROM workflow_agents WHERE is_active = 1 ORDER BY sort_order ASC') as WorkflowAgent[];
  },

  getById: async (id: number) => {
    const db = await getDatabase();
    return await db.get('SELECT * FROM workflow_agents WHERE id = ?', id) as WorkflowAgent | undefined;
  },

  create: async (agent: Omit<WorkflowAgent, 'id' | 'created_at' | 'updated_at' | 'is_custom'>) => {
    const db = await getDatabase();
    const result = await db.run(`
      INSERT INTO workflow_agents (name, type, description, temperature, system_instruction, is_active, is_custom, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?)
    `, agent.name, agent.type, agent.description, agent.temperature, agent.system_instruction, agent.is_active, agent.sort_order);
    return await workflowAgentQueries.getById(result.lastID!);
  },

  update: async (id: number, agent: Partial<Omit<WorkflowAgent, 'id' | 'created_at' | 'updated_at' | 'is_custom'>>) => {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (agent.name !== undefined) {
      fields.push('name = ?');
      values.push(agent.name);
    }
    if (agent.type !== undefined) {
      fields.push('type = ?');
      values.push(agent.type);
    }
    if (agent.description !== undefined) {
      fields.push('description = ?');
      values.push(agent.description);
    }
    if (agent.temperature !== undefined) {
      fields.push('temperature = ?');
      values.push(agent.temperature);
    }
    if (agent.system_instruction !== undefined) {
      fields.push('system_instruction = ?');
      values.push(agent.system_instruction);
    }
    if (agent.is_active !== undefined) {
      fields.push('is_active = ?');
      values.push(agent.is_active);
    }
    if (agent.sort_order !== undefined) {
      fields.push('sort_order = ?');
      values.push(agent.sort_order);
    }

    if (fields.length === 0) return await workflowAgentQueries.getById(id);

    values.push(id);
    await db.run(`UPDATE workflow_agents SET ${fields.join(', ')} WHERE id = ?`, ...values);
    return await workflowAgentQueries.getById(id);
  },

  delete: async (id: number) => {
    const db = await getDatabase();
    // Only allow deletion of custom agents
    const agent = await workflowAgentQueries.getById(id);
    if (!agent || !agent.is_custom) {
      return false;
    }
    const result = await db.run('DELETE FROM workflow_agents WHERE id = ? AND is_custom = 1', id);
    return result.changes !== undefined && result.changes > 0;
  },

  resetToDefaults: async () => {
    const db = await getDatabase();
    // Delete all custom agents
    await db.run('DELETE FROM workflow_agents WHERE is_custom = 1');
    // Reset all default agents to their original state
    await db.run('UPDATE workflow_agents SET is_active = 1 WHERE is_custom = 0 AND id <= 4');
    await db.run('UPDATE workflow_agents SET is_active = 0 WHERE is_custom = 0 AND id = 5');
    return await workflowAgentQueries.getAll();
  }
};
