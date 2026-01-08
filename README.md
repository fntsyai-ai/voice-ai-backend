# Voice AI Backend

Real-time voice AI server with WebSocket support. Handles speech-to-text, LLM processing, and text-to-speech.

## Features

- WebSocket server for real-time communication
- Multi-session support (concurrent calls)
- Speech-to-text with Deepgram
- LLM integration (OpenAI GPT or Google Gemini)
- Text-to-speech with ElevenLabs
- Full conversation context management

## Tech Stack

- Node.js + Express
- Socket.io (WebSocket)
- Deepgram SDK (Speech-to-Text)
- OpenAI API / Google Gemini (LLM)
- ElevenLabs SDK (Text-to-Speech)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get API Keys

You'll need API keys from:

- **Deepgram**: https://deepgram.com
- **OpenAI**: https://platform.openai.com (or Google AI for Gemini)
- **ElevenLabs**: https://elevenlabs.io

### 3. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your API keys:

```env
PORT=3001

# Add your actual API keys
DEEPGRAM_API_KEY=your_actual_key_here
OPENAI_API_KEY=your_actual_key_here
ELEVENLABS_API_KEY=your_actual_key_here

# Choose LLM provider
LLM_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini

# Or use Gemini
# LLM_PROVIDER=gemini
# GOOGLE_API_KEY=your_actual_key_here
# GEMINI_MODEL=gemini-2.0-flash-exp
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start on http://localhost:3001

### 5. Run Production Server

```bash
npm start
```

## Deployment (Railway)

### Option 1: Deploy via GitHub

1. Push this repo to GitHub
2. Go to [Railway](https://railway.app)
3. Create new project → "Deploy from GitHub repo"
4. Choose your repository
5. Railway auto-detects Node.js
6. Add environment variables (all API keys)
7. Deploy!

### Option 2: Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

## Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Server port | No (default: 3001) | `3001` |
| `DEEPGRAM_API_KEY` | Deepgram API key | Yes | `abc123...` |
| `OPENAI_API_KEY` | OpenAI API key | If using OpenAI | `sk-...` |
| `GOOGLE_API_KEY` | Google AI API key | If using Gemini | `AIza...` |
| `ELEVENLABS_API_KEY` | ElevenLabs API key | Yes | `xyz789...` |
| `LLM_PROVIDER` | LLM to use (`openai` or `gemini`) | No (default: openai) | `openai` |
| `OPENAI_MODEL` | OpenAI model name | No (default: gpt-4o-mini) | `gpt-4o-mini` |
| `GEMINI_MODEL` | Gemini model name | No (default: gemini-2.0-flash-exp) | `gemini-2.0-flash-exp` |
| `ELEVENLABS_VOICE_ID` | ElevenLabs voice ID | No (default: Rachel) | `21m00Tcm4TlvDq8ikWAM` |

## Project Structure

```
voice-ai-backend/
├── services/
│   ├── deepgram.js        # Speech-to-text service
│   ├── llm.js             # LLM service (OpenAI/Gemini)
│   └── elevenlabs.js      # Text-to-speech service
├── server.js              # Main server + WebSocket handlers
├── package.json           # Dependencies
├── railway.json           # Railway deployment config
├── nixpacks.toml          # Nixpacks build config
├── .env                   # Environment variables (create from .env.example)
└── README.md              # This file
```

## API Endpoints

### HTTP Endpoints

- `GET /health` - Health check endpoint

### WebSocket Events

**Client → Server:**
- `call-start` - Start a new call session
- `audio-stream` - Stream audio data
- `call-end` - End the call session

**Server → Client:**
- `connect` - WebSocket connection established
- `disconnect` - WebSocket connection closed
- `status` - Status message update
- `transcript` - Transcribed user speech
- `ai-response` - AI text response
- `audio-response` - AI audio response (base64)
- `error` - Error message

## How It Works

1. Client connects via WebSocket
2. Client emits `call-start`
3. Server initializes Deepgram, LLM, and ElevenLabs services
4. Client streams audio via `audio-stream` events
5. Deepgram transcribes audio to text
6. LLM generates response
7. ElevenLabs converts response to speech
8. Server streams audio back to client
9. Process repeats for conversation

## Switching Between OpenAI and Gemini

In your `.env` file:

**For OpenAI (GPT-4o-mini):**
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini
```

**For Google Gemini:**
```env
LLM_PROVIDER=gemini
GOOGLE_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash-exp
```

## Troubleshooting

### "DEEPGRAM_API_KEY is not set"
- Make sure `.env` file exists
- Verify API key is properly set

### "Connection refused"
- Check if server is running
- Verify PORT is not in use
- Check firewall settings

### "Failed to connect to Deepgram"
- Verify Deepgram API key
- Check internet connection
- Ensure you have credits

### "LLM error"
- Verify OpenAI/Google API key
- Check rate limits
- Ensure model name is correct

### "ElevenLabs error"
- Verify ElevenLabs API key
- Check character quota
- Ensure voice ID is valid

## Cost Estimates

**Per minute of conversation:**
- Deepgram: ~$0.0043/min
- OpenAI (GPT-4o-mini): ~$0.002/min
- ElevenLabs: ~$0.018/min
- **Total: ~$0.024/min** ($1.44/hour)

## License

MIT
