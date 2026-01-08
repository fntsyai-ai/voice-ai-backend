import { useState, useEffect, useRef } from 'react'
import io from 'socket.io-client'
import './App.css'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

function App() {
  const [isCallActive, setIsCallActive] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState('Click to start your conversation')
  const [transcript, setTranscript] = useState([])
  const [isSpeaking, setIsSpeaking] = useState(false)

  const socketRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioContextRef = useRef(null)
  const audioQueueRef = useRef([])
  const isPlayingRef = useRef(false)

  useEffect(() => {
    // Connect to server with proper CORS configuration
    socketRef.current = io(SERVER_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketRef.current.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to server')
    })

    socketRef.current.on('disconnect', () => {
      setIsConnected(false)
      console.log('Disconnected from server')
    })

    socketRef.current.on('status', (message) => {
      setStatus(message)
    })

    socketRef.current.on('transcript', (data) => {
      setTranscript(prev => [...prev, { type: 'user', text: data.text }])
    })

    socketRef.current.on('ai-response', (data) => {
      setTranscript(prev => [...prev, { type: 'ai', text: data.text }])
    })

    socketRef.current.on('audio-response', (audioData) => {
      playAudioResponse(audioData)
    })

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error)
      setStatus(`Error: ${error.message}`)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [])

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsCallActive(true)
      setStatus('Call started - AI is listening...')
      setTranscript([])

      // Initialize audio context for playback
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      })

      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current) {
          socketRef.current.emit('audio-stream', event.data)
        }
      }

      mediaRecorder.start(250) // Send chunks every 250ms

      // Notify server call started
      socketRef.current.emit('call-start')

    } catch (error) {
      console.error('Error starting call:', error)
      setStatus('Error: Could not access microphone')
    }
  }

  const endCall = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
    }

    socketRef.current.emit('call-end')
    setIsCallActive(false)
    setStatus('Call ended')
    setIsSpeaking(false)
  }

  const playAudioResponse = async (audioData) => {
    try {
      setIsSpeaking(true)

      // Convert base64 to audio buffer
      const audioBuffer = base64ToArrayBuffer(audioData)
      const decodedAudio = await audioContextRef.current.decodeAudioData(audioBuffer)

      const source = audioContextRef.current.createBufferSource()
      source.buffer = decodedAudio
      source.connect(audioContextRef.current.destination)

      source.onended = () => {
        setIsSpeaking(false)
      }

      source.start(0)
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsSpeaking(false)
    }
  }

  const base64ToArrayBuffer = (base64) => {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1 className="title">Voice AI Agent</h1>
          <p className="subtitle">Have a natural conversation with AI</p>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '● Connected' : '○ Disconnected'}
          </div>
        </header>

        <div className="call-container">
          <div className={`call-button-wrapper ${isCallActive ? 'active' : ''}`}>
            {!isCallActive ? (
              <button
                className="call-button start"
                onClick={startCall}
                disabled={!isConnected}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Start Call
              </button>
            ) : (
              <button
                className="call-button end"
                onClick={endCall}
              >
                <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                End Call
              </button>
            )}

            {isSpeaking && (
              <div className="speaking-indicator">
                <div className="speaking-wave"></div>
                <div className="speaking-wave"></div>
                <div className="speaking-wave"></div>
              </div>
            )}
          </div>

          <p className="status">{status}</p>
        </div>

        {transcript.length > 0 && (
          <div className="transcript">
            <h3 className="transcript-title">Conversation</h3>
            <div className="transcript-messages">
              {transcript.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  <span className="message-label">{msg.type === 'user' ? 'You' : 'AI'}:</span>
                  <span className="message-text">{msg.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
