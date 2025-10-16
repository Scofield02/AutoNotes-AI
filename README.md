# AutoNotes AI - Intelligent Note Generation

> 🎓 Trasforma documenti in appunti strutturati con AI

Un'applicazione web avanzata che utilizza l'intelligenza artificiale per convertire automaticamente documenti (PDF, DOCX, TXT, ecc.) in appunti accademici ben formattati in formato Markdown.

## ✨ Features

- 📄 **Multi-formato**: Supporta PDF, DOCX, TXT, ODT, Excel e più formati
- 🤖 **AI-Powered**: Utilizza Google Gemini AI per elaborazione intelligente
- ⚙️ **Configurabile**: Sistema di agenti AI personalizzabili
- 📝 **Output Markdown**: Genera appunti in formato Markdown professionale
- 🎨 **UI Moderna**: Interfaccia pulita con Tailwind CSS
- 🔄 **Workflow Trasparente**: Monitoraggio in tempo reale dell'elaborazione

## 🚀 Quick Start

**Prerequisiti:** Node.js 18+

1. **Installa dipendenze:**
   ```bash
   npm install
   ```

2. **Configura API Key:**
   - Crea file `.env.local`
   - Aggiungi: `GEMINI_API_KEY=your_api_key_here`

3. **Avvia app:**
   ```bash
   npm run dev
   ```

4. **Apri browser:**
   - Vai su `http://localhost:3000`

## 📁 Struttura Progetto

```
src/
├── components/
│   ├── common/        # Componenti riutilizzabili (5)
│   ├── modals/        # Dialog e modal (4)
│   ├── sections/      # Sezioni UI (3)
│   ├── workflow/      # Gestione workflow (2)
│   ├── settings/      # Configurazioni (4)
│   └── icons/         # Icone SVG (16)
├── config/            # Costanti e configurazioni
├── types/             # TypeScript definitions
├── utils/             # Utility functions
├── hooks/             # Custom React hooks (pronto)
├── services/          # Business logic (pronto)
├── App.tsx            # Componente principale
└── main.tsx           # Entry point

📚 Documentazione:
├── ARCHITECTURE.md    # Architettura dettagliata
├── MIGRATION_GUIDE.md # Guida migrazione
├── QUICKSTART.md      # Guida rapida
└── SUMMARY.md         # Riepilogo completo
```

## 🎯 Come Funziona

1. **Upload**: Carica un documento (PDF, DOCX, etc.)
2. **Estrazione**: L'app estrae il testo dal documento
3. **Elaborazione**: Sistema di agenti AI processa il testo in step sequenziali
4. **Output**: Genera appunti strutturati in Markdown

## ⚙️ Configurazione Agenti

L'app utilizza un sistema modulare di agenti AI:

- **Formattatore**: Struttura il contenuto in Markdown
- **Organizzatore**: Ordina e categorizza informazioni
- **Arricchitore**: Aggiunge esempi e chiarimenti
- **Correttore**: Verifica e corregge errori
- **Synthesizer** (Opzionale): Aumenta densità informativa

Ogni agente è configurabile con temperatura e istruzioni personalizzate.

## 🛠️ Tecnologie

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS
- **Build**: Vite

## 🤝 Contributing

Il progetto è strutturato per essere facilmente estendibile:

1. **Aggiungi componenti** in `src/components/[categoria]/`
2. **Crea hooks** in `src/hooks/`
3. **Implementa servizi** in `src/services/`
4. **Segui le convenzioni** documentate

## 📄 License

---

**Made with ❤️ using React + TypeScript + Google Gemini AI**
