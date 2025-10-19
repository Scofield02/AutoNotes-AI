# Services Layer

This directory contains service modules that handle external API communications and business logic.

## Available Services

### `configService.ts`

Service layer for managing model configurations and workflow agents via REST API.

**Features:**
- ✅ Full CRUD operations for Model Configurations
- ✅ Full CRUD operations for Workflow Agents
- ✅ Reset agents to default configuration
- ✅ Type-safe API calls with TypeScript interfaces
- ✅ Centralized error handling
- ✅ Singleton pattern for consistent instance

**Usage Example:**

```typescript
import { configService } from '@services/configService';

// Get all models
const models = await configService.getAllModels();

// Create a new model
const newModel = await configService.createModel({
  provider: 'google',
  displayName: 'My Gemini Config',
  name: 'gemini-2.5-flash',
  apiKey: 'your-api-key'
});

// Update a model
const updated = await configService.updateModel('model-123', {
  displayName: 'Updated Name'
});

// Delete a model
await configService.deleteModel('model-123');

// Get all agents
const agents = await configService.getAllAgents();

// Get only active agents
const activeAgents = await configService.getActiveAgents();

// Update an agent
const updatedAgent = await configService.updateAgent(1, {
  temperature: 0.3,
  isActive: true
});

// Reset agents to defaults
const resetAgents = await configService.resetAgentsToDefaults();
```

**API Base URL:**
- Default: `http://localhost:3001`
- Configurable via environment variables (future enhancement)

**Error Handling:**
All methods throw errors if the API request fails. Wrap calls in try-catch blocks:

```typescript
try {
  const models = await configService.getAllModels();
  console.log('Models loaded:', models);
} catch (error) {
  console.error('Failed to load models:', error);
  alert('Failed to load model configurations');
}
```

### `errorHandlingService.ts`

Service for classifying and handling application errors.

**Features:**
- Error classification (network, validation, API, etc.)
- Error formatting for logging
- User-friendly error messages

### `pdfExportService.ts`

Service for exporting documents to PDF format.

**Features:**
- PDF generation from text content
- Template-based rendering
- Download management

## Migration from localStorage

The app has been migrated from `localStorage` to a persistent SQLite database:

### Before (localStorage):
```typescript
// Load models
const storedModels = localStorage.getItem('savedAiModels');
const models = JSON.parse(storedModels || '[]');

// Save models
localStorage.setItem('savedAiModels', JSON.stringify(models));
```

### After (Database + API):
```typescript
// Load models
const models = await configService.getAllModels();

// Save model
const newModel = await configService.createModel(modelData);
```

### Benefits:
- ✅ **Persistent storage** - Data survives browser cache clear
- ✅ **Server-side validation** - Ensures data integrity
- ✅ **Centralized configuration** - Single source of truth
- ✅ **Better error handling** - Structured error responses
- ✅ **Scalability** - Easy to add new features
- ✅ **Security** - API keys stored on server (future: encryption)

## Future Enhancements

- [ ] Add request caching for better performance
- [ ] Implement retry logic for failed requests
- [ ] Add request/response interceptors
- [ ] Environment-based API URL configuration
- [ ] WebSocket support for real-time updates
- [ ] Optimistic UI updates with rollback on error
