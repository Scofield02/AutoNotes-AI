# 🚀 AutoNotes AI - Monorepo

> Sistema completo di generazione automatica di appunti con AI e esportazione PDF professionale

Architettura monorepo con frontend React e backend Express per la conversione intelligente di documenti in appunti strutturati e la generazione di PDF di alta qualità.

## 📦 Struttura Monorepo

```
AutoNotes-AI/
├── client/                 # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API clients (pdfExportService)
│   │   └── ...
│   └── package.json
│
├── server/                 # Backend Express + Puppeteer
│   ├── src/
│   │   ├── controllers/    # API endpoints (pdfController)
│   │   ├── services/       # PDF generation, templates
│   │   └── server.ts
│   └── package.json
│
├── package.json            # Root workspace config
└── README.md              # This file
```

## ✨ Features

### Frontend (Client)
- 📄 **Multi-formato**: PDF, DOCX, TXT, ODT, Excel
- 🤖 **AI Multi-Agent**: Sistema configurabile di agent specializzati
- 📝 **Markdown Output**: Appunti strutturati e formattati
- 🎨 **UI Moderna**: React 19 + Tailwind CSS responsive
- 🔄 **Workflow Real-time**: Monitoraggio step-by-step

### Backend (Server)
- �️ **PDF Generation**: Puppeteer per rendering professionale
- 🎨 **Template System**: Handlebars con styling customizzabile
- 📐 **Layout Quality**: Nessun troncamento, formattazione perfetta
- 🚀 **REST API**: Endpoint semplici e documentati
- 🔒 **CORS Ready**: Configurazione sicura per produzione

## 🚀 Quick Start

### Installazione Completa

```bash
# Installa dipendenze client
cd client
npm install

# Installa dipendenze server
cd ../server
npm install
```

### Development

Apri **due terminali separati**:

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```
Server su `http://localhost:3001`

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```
Client su `http://localhost:3000`

### Build Produzione

```bash
# Build server
cd server
npm run build
npm start

# Build client (in altro terminale)
cd client
npm run build
npm run preview
```

## 📚 Documentazione

- **[Client README](./client/README.md)**: Setup frontend, componenti, deployment
- **[Server README](./server/README.md)**: API endpoints, PDF generation, troubleshooting

## 🛠️ Comandi Disponibili

### Client

```bash
cd client
npm run dev      # Development server
npm run build    # Build per produzione
npm run preview  # Preview build locale
```

### Server

```bash
cd server
npm run dev      # Development server
npm run build    # Build TypeScript
npm start        # Avvia server compilato
```

## 🔧 Configurazione

### Client Setup

```bash
cd client
npm install
npm run dev
```

Vedi [client/README.md](./client/README.md) per dettagli.

### Server Setup

```bash
cd server
npm install

# Crea .env da template
cp .env.example .env

npm run dev
```

Variabili richieste in `server/.env`:
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

Vedi [server/README.md](./server/README.md) per dettagli completi.

## 🎯 Workflow Completo

### 1. Upload Documento
- Utente carica file (PDF, DOCX, etc.) nel client
- Frontend estrae testo dal documento

### 2. Elaborazione AI
- Sistema multi-agent processa il contenuto
- Ogni agent applica la propria specializzazione:
  - **Formattatore**: Struttura Markdown
  - **Organizzatore**: Categorizza informazioni
  - **Arricchitore**: Aggiunge esempi
  - **Correttore**: Verifica qualità

### 3. Export PDF
- Client invia contenuto Markdown al backend
- Backend:
  1. Converte Markdown → HTML con Marked
  2. Applica template Handlebars con styling professionale
  3. Genera PDF con Puppeteer (headless Chrome)
- Client riceve e scarica PDF

## 🏗️ Architettura

### Frontend Stack
- **React 19**: UI declarativa
- **TypeScript**: Type safety
- **Vite**: Build veloce, HMR
- **Tailwind CSS**: Utility-first styling

### Backend Stack
- **Express 4.18**: Web server
- **Puppeteer 21.6**: PDF generation
- **Handlebars 4.7**: Templating
- **Marked 11.0**: Markdown parsing

### Communication
- **REST API**: JSON over HTTP
- **CORS**: Cross-origin configurato
- **Content-Type**: `application/pdf` per export

## 📡 API Endpoints

### POST /api/pdf/generate
Genera PDF da contenuto Markdown

**Request:**
```json
{
  "content": "# Title\n\nMarkdown content...",
  "metadata": {
    "title": "Document Title",
    "author": "Author Name",
    "date": "2025-10-16"
  }
}
```

**Response:** PDF binary (`application/pdf`)

### GET /api/pdf/health
Health check del servizio PDF

### GET /health
Health check generale del server

Vedi [server/README.md](./server/README.md) per documentazione API completa.

## 🧪 Testing

```bash
# Test manuale del backend
curl -X POST http://localhost:3001/api/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"content": "# Test\n\nContenuto di prova"}' \
  --output test.pdf
```

## 🚀 Deployment

### Frontend (Vercel)

```bash
cd client
npm i -g vercel
vercel
```

### Backend (Railway / Render)

1. Connect repository
2. Set directory: `server`
3. Build: `npm run build`
4. Start: `npm start`
5. Environment variables:
   ```
   PORT=3001
   CLIENT_URL=https://your-client-url.vercel.app
   NODE_ENV=production
   ```

## 🐛 Troubleshooting

### Client non si connette al server

✅ **Verifica:**
- Server è avviato su porta 3001
- `CLIENT_URL` in server `.env` è corretto
- CORS configurato correttamente

### Puppeteer non si avvia

```bash
# Linux
sudo apt-get install -y chromium-browser

# macOS
brew install chromium
```

### Errori build

```bash
# Pulisci e reinstalla
rm -rf client/node_modules server/node_modules
rm -rf client/dist server/dist
cd client && npm install
cd ../server && npm install
```

## 📝 TODO

### High Priority
- [ ] Docker Compose per dev/prod
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Unit tests (Vitest + Jest)
- [ ] E2E tests (Playwright)

### Features
- [ ] Rate limiting sul backend
- [ ] Authentication system
- [ ] PDF caching strategy
- [ ] WebSocket per progress real-time
- [ ] Dark mode

### Infrastructure
- [ ] Monitoring (Sentry)
- [ ] Logging centralizzato
- [ ] Metrics & analytics
- [ ] CDN per assets statici

## 🤝 Contributing

### Setup Development Environment

```bash
# 1. Clone repository
git clone <repo-url>
cd AutoNotes-AI

# 2. Install client dependencies
cd client
npm install

# 3. Install server dependencies
cd ../server
npm install
cp .env.example .env

# 4. Start development (2 terminals)
# Terminal 1:
cd server
npm run dev

# Terminal 2:
cd client
npm run dev
```

### Code Style

- TypeScript strict mode
- ESLint + Prettier (TODO)
- Componenti modulari e riutilizzabili
- API RESTful conventions

## 📄 License

MIT License - vedi LICENSE file per dettagli

---

**Made with ❤️ for AutoNotes AI**

## 🔗 Links

- [Frontend Documentation](./client/README.md)
- [Backend Documentation](./server/README.md)
- [API Reference](./server/README.md#-api-endpoints)


**Made with ❤️ using React + TypeScript + Google Gemini AI**
