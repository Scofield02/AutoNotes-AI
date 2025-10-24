# 🚀 AutoNotes AI

> Intelligent document processing system that transforms study materials into structured, high-quality notes using AI multi-agent workflows.

AutoNotes AI is a full-stack application that combines React frontend with Express backend to automatically convert documents (PDF, DOCX, TXT, etc.) into well-organized Markdown notes and professional PDF exports.

## ✨ Key Features

- 📄 **Multi-format Support** - PDF, DOCX, TXT, ODT, Excel, PowerPoint
- 🤖 **AI Multi-Agent System** - Configurable specialized agents for text processing
- 📝 **Structured Output** - Clean, formatted Markdown notes
- 🎨 **Professional PDF Export** - High-quality rendering with Puppeteer
- 💾 **Persistent Configuration** - SQLite database for models and agents
- 🔄 **Real-time Workflow** - Step-by-step processing with live updates

## 🏗️ Architecture

```
AutoNotes-AI/
├── client/          # React + TypeScript + Vite
├── server/          # Express + SQLite + Puppeteer
├── SETUP.md         # Database setup guide
├── API.md           # API documentation
└── README.md        # This file
```

**Tech Stack:**
- Frontend: React 19, TypeScript, Tailwind CSS
- Backend: Express, SQLite, Puppeteer, Handlebars
- AI Integration: Google Gemini, OpenRouter

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Docker & Docker Compose (optional)

### Option 1: Local Development

```bash
# 1. Clone repository
git clone <repo-url>
cd AutoNotes-AI

# 2. Install dependencies
cd client && npm install
cd ../server && npm install

# 3. Configure environment (server/.env)
cd server
cp .env.example .env
# Add your API keys

# 4. Start services
# Terminal 1 - Backend (port 3001)
cd server
npm run dev

# Terminal 2 - Frontend (port 3000)
cd client
npm run dev
```

### Option 2: Docker

```bash
# 1. Clone repository
git clone <repo-url>
cd AutoNotes-AI

# 2. Configure environment
cd server
cp .env.example .env
# Add your API keys

# 3. Start with Docker Compose
docker-compose up --build

# Stop containers
docker-compose down
```

Open `http://localhost:3000` in your browser.

## 📖 Usage

1. **Configure AI Model** - Add your Google Gemini or OpenRouter API key
2. **Upload Document** - Drop your study material (PDF, DOCX, etc.)
3. **Run Workflow** - Let AI agents process and structure the content
4. **Export PDF** - Download professional formatted notes

## 🔧 Configuration

### Environment Variables

**Server** (`server/.env`):
```env
PORT=3001
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

No additional configuration needed - database initializes automatically on first run with default agents.

## 🗄️ Database

AutoNotes uses **SQLite** for persistent storage:
- Model configurations (API keys, providers)
- Workflow agents (5 default agents included)
- Custom agent definitions

Database auto-initializes at `server/data/autonotes.db` on first server start.

## 📝 Project Structure

- **Client**: React SPA with Vite, handles UI and file processing
- **Server**: Express API for PDF generation and database management
- **Database**: SQLite for configuration persistence
- **AI Integration**: Multi-provider support (Google, OpenRouter)

## 📄 License

MIT License - see LICENSE file for details

## 📋 Changelog

### v1.0.1
- 🐳 **Docker Support** - Added Dockerfile and docker-compose for containerized deployment
- 🔧 **Improved Configuration** - Simplified setup with `.dockerignore` files
- 📦 **Persistent Storage** - Docker volume for database persistence
- 🛠️ **Enhanced Stability** - Fixed native module compilation in containerized environments

### v1.0.0
- 🎉 Initial stable release
- Multi-format document processing
- AI multi-agent workflow system
- SQLite database integration
- Markdown and PDF export
- Real-time workflow monitoring

---

**Built with React, TypeScript, Express, and AI** 🤖
