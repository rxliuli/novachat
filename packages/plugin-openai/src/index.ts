import * as novachat from '@novachat/plugin'
import OpenAI from 'openai'

function convertReq(
  req: novachat.QueryRequest,
  stream?: boolean,
): OpenAI.ChatCompletionCreateParams {
  return {
    model: req.model,
    messages: req.messages.map((it) => {
      if (it.role === 'user' && it.attachments) {
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
        role: it.role,
      }
    }),
    stream,
  }
}

async function getProvider(): Promise<
  | {
      client: OpenAI
      models: OpenAI.Model[]
    }[]
> {
  const providers = (await novachat.setting.get('openai.providers')) as {
    apiKey: string
    baseURL: string
  }[]
  const apiKey = await novachat.setting.get('openai.apiKey')
  const baseURL = await novachat.setting.get('openai.baseURL')
  if (apiKey && baseURL) {
    providers.push({
      apiKey,
      baseURL,
    })
  }
  const list = await Promise.all(
    providers.map(async (it) => {
      const client = new OpenAI({
        apiKey: it.apiKey,
        baseURL: it.baseURL,
        dangerouslyAllowBrowser: true,
      })
      const list = await client.models.list()
      try {
        return {
          client,
          models: list.data,
        }
      } catch (e) {
        return null
      }
    }),
  )
  return list.filter((it) => it !== null)
}

export async function activate(context: novachat.PluginContext) {
  const providers = await getProvider()
  const models = providers.flatMap((it) => it.models)
  function getClient(modelId: string) {
    const client = providers.find((it) =>
      it.models.some((model) => model.id === modelId),
    )?.client
    if (!client) {
      throw new Error('Model not found' + modelId)
    }
    return client
  }
  await novachat.model.registerProvider({
    name: 'OpenAI',
    models: models
      .filter((model) =>
        ['text-', 'dall-', 'tts-', 'winsper-', 'davinci', 'babbage'].every(
          (it) => !(model.id as string).startsWith(it),
        ),
      )
      .map((it) => ({
        id: it.id,
        name: it.id,
      })) ?? [
      { id: 'o1-preview', name: 'o1-preview' },
      { id: 'o1-mini', name: 'o1-mini' },
      { id: 'gpt-4o', name: 'GPT-4o' },
      { id: 'gpt-4o-mini', name: 'GPT-4o-mini' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4o-turbo' },
    ],
    async invoke(query) {
      const client = getClient(query.model)
      const response = await client.chat.completions.create(
        convertReq(query) as OpenAI.ChatCompletionCreateParamsNonStreaming,
      )
      return {
        content: response.choices[0].message.content ?? '',
      }
    },
    async *stream(query) {
      const client = getClient(query.model)
      const response = await client.chat.completions.create(
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
