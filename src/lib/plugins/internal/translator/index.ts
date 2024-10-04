import * as novachat from '@novachat/plugin'
import { last } from 'lodash-es'
import { franc } from 'franc-min'

const SYSTEM_MESSAGE =
  'You are a professional, authentic machine translation engine.'
const USER_MESSAGE = `
Translate the following source text to {{to}}, Output translation directly without any additional text.
Source Text: {{text}}

Translated Text:
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
      const stream = novachat.model.stream({
        messages: [
          { from: 'system', content: SYSTEM_MESSAGE },
          {
            from: 'user',
            content: USER_MESSAGE.replace('{{to}}', toLanguage).replace(
              '{{text}}',
              lastMessage.content,
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
