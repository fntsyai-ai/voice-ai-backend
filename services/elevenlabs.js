import { ElevenLabsClient } from 'elevenlabs'

export class ElevenLabsService {
  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY
    if (!this.apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set')
    }

    this.client = new ElevenLabsClient({ apiKey: this.apiKey })
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Rachel voice
  }

  async textToSpeech(text) {
    try {
      const audio = await this.client.textToSpeech.convert(this.voiceId, {
        text: text,
        model_id: 'eleven_turbo_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })

      // Convert audio stream to base64
      const chunks = []
      for await (const chunk of audio) {
        chunks.push(chunk)
      }

      const audioBuffer = Buffer.concat(chunks)
      return audioBuffer.toString('base64')

    } catch (error) {
      console.error('ElevenLabs error:', error)
      throw error
    }
  }
}
