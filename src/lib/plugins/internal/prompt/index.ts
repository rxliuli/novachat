import * as novachat from '@novachat/plugin'
import { SYSTEM_PROMPT } from './prompt'
import { last } from 'lodash-es'

export async function activate(context: novachat.PluginContext) {
  await novachat.model.registerBot({
    id: 'novachat.prompt-generator',
    name: 'Prompt Generator',
    async *stream(query) {
      const defaultModel = await novachat.model.getDefault()
      if (!defaultModel) {
        throw new Error('No default model found')
      }
      const stream = novachat.model.stream({
        messages: [
          {
            from: 'user',
            content: SYSTEM_PROMPT.replace(
              '{{{{TASK}}}}',
              last(query.messages)!.content,
            ),
          },
        ],
        model: defaultModel.id,
      })
      for await (const it of stream) {
        yield it
      }
    },
  })
}
