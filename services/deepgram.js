import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export class DeepgramService {
  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY
    if (!this.apiKey) {
      throw new Error('DEEPGRAM_API_KEY is not set')
    }

    this.client = createClient(this.apiKey)
    this.connection = null
    this.transcriptCallback = null
    this.errorCallback = null
  }

  async connect() {
    try {
      // Create live transcription connection
      this.connection = this.client.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        punctuate: true,
        interim_results: false,
        utterance_end_ms: 1000,
        vad_events: true,
        endpointing: 300
      })

      // Setup event handlers
      this.connection.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened')
      })

      this.connection.on(LiveTranscriptionEvents.Transcript, (data) => {
        const transcript = data.channel.alternatives[0].transcript

        if (transcript && transcript.trim() !== '' && data.is_final) {
          if (this.transcriptCallback) {
            this.transcriptCallback(transcript)
          }
        }
      })

      this.connection.on(LiveTranscriptionEvents.Error, (error) => {
        console.error('Deepgram error:', error)
        if (this.errorCallback) {
          this.errorCallback(error)
        }
      })

      this.connection.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed')
      })

      // Wait for connection to be ready
      await new Promise((resolve) => {
        this.connection.on(LiveTranscriptionEvents.Open, resolve)
      })

    } catch (error) {
      console.error('Failed to connect to Deepgram:', error)
      throw error
    }
  }

  send(audioData) {
    if (this.connection && this.connection.getReadyState() === 1) {
      this.connection.send(audioData)
    }
  }

  disconnect() {
    if (this.connection) {
      this.connection.finish()
      this.connection = null
    }
  }

  onTranscript(callback) {
    this.transcriptCallback = callback
  }

  onError(callback) {
    this.errorCallback = callback
  }
}
