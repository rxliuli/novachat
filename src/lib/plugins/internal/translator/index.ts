import * as novachat from '@novachat/plugin'
import { last } from 'lodash-es'

const SYSTEM_MESSAGE = 'You are a helpful translator'

export async function activate(context: novachat.PluginContext) {
  await novachat.model.registerProvider({
    name: 'Translator',
    models: [
      {
        id: 'translator',
        name: 'Translator',
      },
    ],
    async invoke(query) {
      const lastMessage = last(query.messages)
      if (!lastMessage) {
        throw new Error('No last message')
      }
      const defaultModel = await novachat.model.getDefault()
      return novachat.model.invoke({
        messages: [{ from: 'system', content: SYSTEM_MESSAGE }, lastMessage],
        model: defaultModel.id,
      })
    },
    async *stream(
      query: novachat.QueryRequest,
    ): AsyncGenerator<novachat.QueryChunkResponse> {
      const lastMessage = last(query.messages)
      if (!lastMessage) {
        throw new Error('No last message')
      }
      const defaultModel = await novachat.model.getDefault()
      const stream = novachat.model.stream({
        messages: [{ from: 'system', content: SYSTEM_MESSAGE }, lastMessage],
        model: defaultModel.id,
      })
      for await (const it of stream) {
        yield it
      }
    },
  })
}
