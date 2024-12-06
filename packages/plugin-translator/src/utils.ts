import type * as novachat from '@novachat/plugin'

export function parseEntities(entities: string): [string, string][] {
  return entities
    .split('\n')
    .map((it) => {
      const i = it.indexOf(':') === -1 ? it.indexOf('：') : it.indexOf(':')
      if (i === -1) {
        return
      }
      return [it.slice(0, i).trim(), it.slice(i + 1).trim()] as const
    })
    .filter((it) => it && it[0] && it[1]) as [string, string][]
}

export function getMessages(options: {
  systemPrompt: string
  entities: [string, string][]
  content: string
  toLanguage: string
}): novachat.QueryRequest['messages'] {
  const { systemPrompt, entities, content, toLanguage } = options
  return [
    {
      role: 'system',
      content: systemPrompt.replace('{{to}}', toLanguage).replace(
        '{{entities}}',
        entities
          .filter(([k]) => content.toLowerCase().includes(k.toLowerCase()))
          .map(([k, v]) => `${k}: ${v}`)
          .join('\n'),
      ),
    },
    {
      role: 'user',
      content: content,
    },
  ]
}

export async function* translate(options: {
  systemPrompt: string
  entities: [string, string][]
  content: string
  toLanguage: string
  model: string
  t: typeof novachat.model.stream
}) {
  const { systemPrompt, entities, content, toLanguage, model, t } = options
  const SPLITTER = '\n\n---\n\n'
  const chunks = content.split(SPLITTER)
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const stream = t({
      messages: getMessages({
        systemPrompt,
        entities,
        content: chunk,
        toLanguage,
      }),
      model,
    })
    for await (const it of stream) {
      yield it
    }
    if (i < chunks.length - 1) {
      yield {
        role: 'assistant',
        content: SPLITTER,
      }
    }
  }
}
