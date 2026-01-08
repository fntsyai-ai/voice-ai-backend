import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

export class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openai'

    if (this.provider === 'openai') {
      this.initOpenAI()
    } else if (this.provider === 'gemini') {
      this.initGemini()
    } else {
      throw new Error(`Unsupported LLM provider: ${this.provider}`)
    }
  }

  initOpenAI() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    this.client = new OpenAI({ apiKey })
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  }

  initGemini() {
    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not set')
    }

    this.client = new GoogleGenerativeAI(apiKey)
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp'
  }

  async generateResponse(conversationHistory) {
    try {
      if (this.provider === 'openai') {
        return await this.generateOpenAIResponse(conversationHistory)
      } else if (this.provider === 'gemini') {
        return await this.generateGeminiResponse(conversationHistory)
      }
    } catch (error) {
      console.error('LLM error:', error)
      throw error
    }
  }

  async generateOpenAIResponse(conversationHistory) {
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful, friendly AI voice assistant. Keep your responses natural and conversational,
as if you're talking to someone on the phone. Be concise but engaging. Remember details from earlier
in the conversation to provide personalized responses.`
    }

    const messages = [systemPrompt, ...conversationHistory]

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 150
    })

    return completion.choices[0].message.content
  }

  async generateGeminiResponse(conversationHistory) {
    const model = this.client.getGenerativeModel({ model: this.model })

    const systemPrompt = `You are a helpful, friendly AI voice assistant. Keep your responses natural and conversational,
as if you're talking to someone on the phone. Be concise but engaging. Remember details from earlier
in the conversation to provide personalized responses.`

    // Convert conversation history to Gemini format
    const chat = model.startChat({
      history: conversationHistory.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.7
      }
    })

    // Get the last user message
    const lastMessage = conversationHistory[conversationHistory.length - 1]
    const prompt = `${systemPrompt}\n\nUser: ${lastMessage.content}`

    const result = await chat.sendMessage(prompt)
    const response = await result.response
    return response.text()
  }
}
