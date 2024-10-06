import * as novachat from '@novachat/plugin'
import { last } from 'lodash-es'
import { franc } from 'franc-min'
import { configuration } from './plugin.json'

const SYSTEM_MESSAGE = `
You are a professional, authentic machine translation engine. Translate the following source text to {{to}}, Output translation directly without any additional text.
`.trim()

export async function activate() {
  await novachat.model.registerBot({
    id: 'translator',
    name: 'Translator',
    async *stream(
      query: novachat.QueryRequest,
    ): AsyncGenerator<novachat.QueryChunkResponse> {
      const lastMessage = last(query.messages)
      if (!lastMessage) {
        throw new Error('No last message')
      }
      const defaultModel = await novachat.model.getDefault()
      if (!defaultModel) {
        throw new Error('No default model')
      }
      const localLanguage =
        (await novachat.setting.get('translator.localLanguage')) ?? 'eng'
      const language = franc(lastMessage.content)
      const toLanguage = language === localLanguage ? 'eng' : localLanguage
      const translateConfig =
        configuration.properties['translator.localLanguage']
      const stream = novachat.model.stream({
        messages: [
          {
            role: 'system',
            content: SYSTEM_MESSAGE.replace(
              '{{to}}',
              translateConfig.enumDescriptions[
                translateConfig.enum.indexOf(toLanguage)
              ],
            ),
          },
          {
            role: 'user',
            content: lastMessage.content,
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
