# Struttura del Progetto AutoNotes AI

Questa cartella contiene tutto il codice sorgente dell'applicazione, organizzato secondo le best practices per progetti React/TypeScript.

## 📁 Struttura delle Cartelle

### `/components`
Tutti i componenti React dell'applicazione, organizzati per categoria:

#### `/components/common`
Componenti riutilizzabili di base utilizzati in tutta l'app:
- `Button.tsx` - Componente pulsante personalizzato
- `Card.tsx` - Container con stile per contenuti
- `LoadingSkeleton.tsx` - Placeholder durante il caricamento
- `ProgressBar.tsx` - Barra di avanzamento
- `ToggleSwitch.tsx` - Switch on/off

#### `/components/modals`
Tutti i componenti modal/dialog:
- `AgentConfigModal.tsx` - Modal per configurare gli agenti
- `ConfirmationModal.tsx` - Modal di conferma azioni
- `ModelConfigModal.tsx` - Modal per configurare i modelli AI
- `PreviewModal.tsx` - Modal per preview del contenuto

#### `/components/sections`
Sezioni principali dell'interfaccia:
- `CollapsibleSection.tsx` - Sezione espandibile/collassabile
- `FileUpload.tsx` - Componente per upload file
- `Header.tsx` - Header dell'applicazione

#### `/components/workflow`
Componenti relativi al workflow di elaborazione:
- `WorkflowStatus.tsx` - Visualizza lo stato del workflow
- `WorkflowStepsList.tsx` - Lista degli step del workflow

#### `/components/settings`
Componenti per la gestione delle impostazioni:
- `AgentConfig.tsx` - Configurazione degli agenti
- `AgentSettings.tsx` - Impostazioni avanzate agenti
- `ApiKeyManager.tsx` - Gestione chiavi API
- `ModelProviderConfig.tsx` - Configurazione provider modelli

#### `/components/icons`
Tutti i componenti icona SVG

### `/config`
File di configurazione e costanti:
- `constants.ts` - Configurazioni degli agenti e costanti globali

### `/hooks` *(pianificato)*
Custom React hooks per logica riutilizzabile

### `/services` *(pianificato)*
Logica di business e servizi:
- Interazioni con API AI
- Elaborazione file
- Gestione workflow

### `/types`
Definizioni TypeScript:
- `index.ts` - Tutti i types e interfaces dell'app

### `/utils`
Funzioni utility:
- `textChunker.ts` - Suddivisione testo in chunks

## 🎯 Vantaggi di questa Struttura

1. **Manutenibilità**: Facile trovare e modificare componenti specifici
2. **Scalabilità**: Semplice aggiungere nuove features senza caos
3. **Riutilizzabilità**: Componenti comuni ben separati
4. **Team-friendly**: Struttura standard comprensibile da tutti
5. **Performance**: Possibilità di lazy loading per ottimizzazioni future

## 📝 Convenzioni

- **Naming**: PascalCase per componenti (es. `AgentConfig.tsx`)
- **Import relativi**: Usa path relativi corretti in base alla posizione
- **Export**: Preferisci named exports per utilities, default per componenti
- **Types**: Definisci props interface nello stesso file del componente
