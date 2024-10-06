import * as novachat from '@novachat/plugin'
import ollama from 'ollama/browser'

function convertMessages(messages: novachat.QueryRequest['messages']) {
  return messages.map((it) => ({
    role: it.role,
    content: it.content,
    images: it.attachments?.map((it) => it.url),
  }))
}

export async function activate() {
  const list = await ollama.list()
  await novachat.model.registerProvider({
    name: 'Ollama',
    models: list.models.map((it) => ({ id: it.name, name: it.name })),
    async invoke(query) {
      const r = await ollama.chat({
        model: query.model,
        messages: convertMessages(query.messages),
      })
      return {
        content: r.message.content,
      }
    },
    async *stream(query) {
      const r = await ollama.chat({
        model: query.model,
        messages: convertMessages(query.messages),
        stream: true,
      })
      for await (const it of r) {
        yield {
          content: it.message.content,
        }
      }
    },
  })
}
