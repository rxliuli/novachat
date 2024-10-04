import * as novachat from '@novachat/plugin'
import OpenAI from 'openai'

function convertReq(
  req: novachat.QueryRequest,
  stream?: boolean,
): OpenAI.ChatCompletionCreateParams {
  return {
    model: req.model,
    messages: req.messages.map((it) => {
      if (it.from === 'user' && it.attachments) {
        return {
          role: 'user',
          content: [
            {
              type: 'text',
              text: it.content,
            },
            ...it.attachments.map(
              (atta) =>
                ({
                  type: 'image_url',
                  image_url: { url: atta.url },
                } as OpenAI.ChatCompletionContentPartImage),
            ),
          ],
        }
      }
      return {
        content: it.content,
        role: it.from,
      }
    }),
    stream,
  }
}

export async function activate(context: novachat.PluginContext) {
  const client = async () => {
    return new OpenAI({
      apiKey: await novachat.setting.get('openai.apiKey'),
      dangerouslyAllowBrowser: true,
    })
  }
  await novachat.model.registerProvider({
    name: 'OpenAI',
    models: [
      { id: 'o1-preview', name: 'o1-preview' },
      { id: 'o1-mini', name: 'o1-mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4o-turbo' },
    ],
    async invoke(query) {
      const response = await (
        await client()
      ).chat.completions.create(
        convertReq(query) as OpenAI.ChatCompletionCreateParamsNonStreaming,
      )
      return {
        content: response.choices[0].message.content ?? '',
      }
    },
    async *stream(query) {
      const response = await (
        await client()
      ).chat.completions.create(
        convertReq(query, true) as OpenAI.ChatCompletionCreateParamsStreaming,
      )
      for await (const it of response) {
        yield {
          content: it.choices[0].delta.content ?? '',
        }
      }
    },
  })
}
