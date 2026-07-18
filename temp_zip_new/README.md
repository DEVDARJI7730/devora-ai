# Devora AI | Your Intelligent AI Assistant Platform

Devora AI is a production-ready, highly secure, and elegant AI companion dashboard styled with a modern dark theme and glassmorphic panels. It offers streaming completions, Stable Diffusion image generations, speech synthesis, document summarization, and specialized productivity tools.

---

## 🛠️ Architecture & Tech Stack

Devora AI is structured as a monorepo splits into three main layers:

```
├── backend/            # Express, Node.js, MongoDB (Mongoose), JWT, Google Auth, Cloudinary
├── fastapi-ai/         # Python, FastAPI, Gemini Free API, stable diffusion, speech synthesis
├── frontend/           # React.js (Vite), Tailwind CSS, Framer Motion, Zustand
└── package.json        # Root scripts utilizing concurrently to launch everything together
```

- **Frontend Core**: React 18 (Vite) + Tailwind CSS + Lucide Icons + Framer Motion (micro-animations). State handled via **Zustand** stores for instant client updates.
- **Express Database Server**: Manages user registrations, login hashes, JWT cookies verification, Google Auth callbacks, chat history database logging, and image uploads to **Cloudinary**.
- **FastAPI AI Server**: Focuses strictly on heavy AI calculations. Utilizes Server-Sent Events (SSE) to stream Gemini content line-by-line, calls Stable Diffusion endpoints, extracts PDF/CSV spreadsheet data, and synthesizes vocals.

---

## 🚀 Installation & Local Launch

### Prerequisites
1. **Node.js** (v18 or higher)
2. **Python** (v3.9 or higher)

### Setup & Installation

1. Clone or copy the project to your local workspace directory.
2. In the root directory, run the installer script:
   ```bash
   npm run install:all
   ```
   This will install top-level developer scripts, initialize the Node.js Express server dependencies, and setup the React Vite packages.

3. **Python Virtual Environment**:
   Initialize and install dependencies inside `/fastapi-ai`:
   ```bash
   cd fastapi-ai
   python -m venv venv
   # On Windows powershell:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   pip install -r requirements.txt
   ```

---

## 🔑 Environment Variables Configuration

Copy variables templates or create the following files:

### 1. Backend (`/backend/.env`)
Create a file named `.env` in the `/backend` folder:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/devora_ai
JWT_SECRET=your_jwt_secret_key_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=http://localhost:5173
```

### 2. FastAPI AI (`/fastapi-ai/.env`)
Create a file named `.env` in the `/fastapi-ai` folder:
```env
PORT=8000
GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
```

---

## 🚀 Running Devora AI

To start the servers concurrently:

1. Launch the FastAPI python server first:
   ```bash
   cd fastapi-ai
   # Make sure venv is active
   uvicorn main:app --reload --port 8000
   ```

2. From another terminal (in the project root directory), run:
   ```bash
   npm run dev
   ```
   This boot up:
   - Node/Express Backend at `http://localhost:5000`
   - Vite React Frontend at `http://localhost:5173`

Navigate your browser to `http://localhost:5173` to explore Devora AI!

---

## 📄 API Documentation Overview

### Express Auth Endpoints
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Verify password and return JWT
- `POST /api/auth/google` - Verifies Google tokens & sign-in
- `GET  /api/auth/me` - Get profile metadata
- `PUT  /api/auth/update-profile` - Modify names, avatars, emails
- `DELETE /api/auth/delete-account` - Permanent cleanup

### Express Chat History
- `GET  /api/chats` - List user conversations
- `POST /api/chats` - Start new empty chat
- `POST /api/chats/:id/messages` - Log message exchanges
- `PUT  /api/chats/:id/rename` - Change sidebar label
- `PUT  /api/chats/:id/pin` - Toggle priority pinning
- `DELETE /api/chats/:id` - Remove chat session

### FastAPI AI Workflows
- `POST /api/ai/chat` - Streams text content delta chunks (SSE)
- `POST /api/ai/image` - Style select stable diffusion generator
- `POST /api/ai/voice/tts` - Audio synthesis (returns MP3 stream)
- `POST /api/ai/file/summarize` - Extract and evaluate PDF/Excel/Word sheets
- `POST /api/ai/tools` - Dedicated template processors
