import * as novachat from '@novachat/plugin'
import { last } from 'lodash-es'
import { franc } from 'franc-min'
import { configuration } from './plugin.json'
import { parseEntities, translate } from './utils'

async function getTargetLanguage(content: string) {
  const _localLanguage =
    (await novachat.setting.get('translator.localLanguage')) ?? 'eng'
  const language = franc(content)
  const toLanguage = language === _localLanguage ? 'eng' : _localLanguage
  const translateConfig = configuration.properties['translator.localLanguage']
  return translateConfig.enum[translateConfig.enum.indexOf(toLanguage)]
}

async function getModel() {
  const [model, defaultModel] = await Promise.all([
    novachat.setting.get('translator.model'),
    novachat.model.getDefault(),
  ])
  return model ?? defaultModel?.id
}

export async function activate() {
  await novachat.model.registerBot({
    id: 'translator',
    name: 'Translator',
    async *stream(
      query: novachat.QueryRequest,
    ): AsyncGenerator<novachat.QueryChunkResponse> {
      const [systemPrompt, entitiesString] = await Promise.all([
        novachat.setting.get('translator.systemPrompt'),
        novachat.setting.get('translator.entities'),
      ])
      const content = last(query.messages)?.content
      if (!content) {
        throw new Error('No last message')
      }
      const model = await getModel()
      if (!model) {
        throw new Error('No default model')
      }
      const toLanguage = await getTargetLanguage(content)
      const stream = translate({
        systemPrompt,
        entities: parseEntities(entitiesString),
        content,
        toLanguage,
        model,
        t: novachat.model.stream,
      })
      for await (const it of stream) {
        yield it
      }
    },
  })
}
