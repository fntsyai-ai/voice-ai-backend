# Voice AI Frontend

Real-time voice conversation interface with AI agents. Built with React and Vite.

## Features

- Real-time voice conversation with AI
- WebSocket connection to backend
- Clean, modern UI with gradient design
- Live conversation transcript
- Speaking indicator animation
- Responsive design

## Tech Stack

- React 18
- Vite
- Socket.io Client
- Web Audio API
- MediaRecorder API

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your backend URL:

```env
VITE_SERVER_URL=http://localhost:3001
```

For production, use your Railway backend URL:

```env
VITE_SERVER_URL=https://your-backend.railway.app
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:5173

### 4. Build for Production

```bash
npm run build
```

## Deployment (Netlify)

### Option 1: Deploy via GitHub

1. Push this repo to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Choose your GitHub repo
5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Add environment variable:
   - `VITE_SERVER_URL`: Your Railway backend URL
7. Deploy!

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend WebSocket server URL | `http://localhost:3001` |

## Project Structure

```
voice-ai-frontend/
├── src/
│   ├── App.jsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── vite.config.js        # Vite configuration
├── netlify.toml          # Netlify deployment config
├── package.json          # Dependencies
└── .env                  # Environment variables (create from .env.example)
```

## How It Works

1. User clicks "Start Call" button
2. Browser requests microphone permission
3. Audio is captured and streamed to backend via WebSocket
4. Backend processes audio (STT → LLM → TTS)
5. AI audio response streams back to frontend
6. Audio plays through user's speakers
7. Conversation transcript updates in real-time

## Browser Requirements

- Modern browser with WebSocket support
- Microphone access
- HTTPS (required for mic access in production)

## Troubleshooting

### "Could not access microphone"
- Check browser permissions
- Ensure HTTPS in production
- Try different browser

### "Connection failed"
- Verify backend URL in `.env`
- Check if backend is running
- Look for CORS issues in console

### "No audio playing"
- Check speaker/volume settings
- Look for errors in browser console
- Verify audio format compatibility

## License

MIT
