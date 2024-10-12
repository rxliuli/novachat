import * as novachat from '@novachat/plugin'
import GoogleAI, { GoogleGenerativeAI } from '@google/generative-ai'

function parseRequest(
  req: novachat.QueryRequest,
): GoogleAI.GenerateContentRequest {
  const systemInstruction = () => {
    const system = req.messages.find((m) => m.role === 'system')?.content
    if (!system) {
      return undefined
    }
    return system
  }
  return {
    systemInstruction: systemInstruction(),
    contents: req.messages.map(
      (m) =>
        ({
          role: m.role,
          parts: [{ text: m.content }],
        } as GoogleAI.Content),
    ),
  }
}

export async function activate() {
  console.log('Default model:', await novachat.model.getDefault())

  async function createClient(req: novachat.QueryRequest) {
    const apiKey = await novachat.setting.get('gemini.apiKey')
    if (!apiKey) {
      throw new Error('API key is not set')
    }
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: req.model })
    return model
  }
  novachat.model.registerProvider({
    name: 'Gemini',
    models: [
      { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
      { id: 'gemini-1.5-pro-exp-0801', name: 'Gemini 1.5 Pro Exp 0801' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemma-2-2b-it', name: 'Gemma 2.2b IT' },
      { id: 'gemma-2-9b-it', name: 'Gemma 2.9b IT' },
      { id: 'gemma-2-27b-it', name: 'Gemma 2.27b IT' },
    ],
    invoke: async (req) => {
      const { response } = await (
        await createClient(req)
      ).generateContent(parseRequest(req))
      return {
        content: response.text(),
      }
    },
    async *stream(req) {
      const model = await createClient(req)
      const stream = await model.generateContentStream(parseRequest(req))
      for await (const chunk of stream.stream) {
        yield {
          content: chunk.text(),
        }
      }
    },
  })
}
