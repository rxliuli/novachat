import * as novachat from '@novachat/plugin'
import type AnthropicTypes from '@anthropic-ai/sdk'
import { getImageAsBase64 } from './utils/base64'
import { AnthropicVertexWeb } from './web'

async function convertMessages(
  messages: novachat.QueryRequest['messages'],
): Promise<AnthropicTypes.MessageCreateParamsNonStreaming['messages']> {
  return Promise.all(
    messages.map(async (it) => {
      if (!it.content) {
        throw new Error('content is required')
      }
      if (!it.attachments) {
        return {
          role: it.role,
          content: it.content,
        } as AnthropicTypes.MessageParam
      }
      return {
        role: it.role,
        content: [
          {
            type: 'text',
            text: it.content,
          },
          ...(await Promise.all(
            it.attachments.map(async (it) => {
              return {
                type: 'image',
                source: {
                  type: 'base64',
                  ...(await getImageAsBase64(it.url)),
                },
              } as AnthropicTypes.ImageBlockParam
            }),
          )),
        ],
      } as AnthropicTypes.MessageParam
    }),
  )
}

function getModelMaxTokens(model: string): number {
  if (model.startsWith('claude-3-5')) {
    return 4096
  }
  return 8192
}

async function parseReq(
  req: novachat.QueryRequest,
  stream: boolean,
): Promise<AnthropicTypes.MessageCreateParams> {
  return {
    messages: await convertMessages(
      req.messages.filter((it) =>
        (
          [
            'user',
            'assistant',
          ] as novachat.QueryRequest['messages'][number]['role'][]
        ).includes(it.role),
      ),
    ),
    max_tokens: getModelMaxTokens(req.model),
    stream,
    model: req.model,
    system: req.messages.find((it) => it.role === 'system')?.content,
  } as AnthropicTypes.MessageCreateParamsNonStreaming
}

function parseResponse(
  resp: AnthropicTypes.Messages.Message,
): novachat.QueryResponse {
  if (resp.content.length !== 1) {
    console.error('Unsupported response', resp.content)
    throw new Error('Unsupported response')
  }
  return {
    content: (resp.content[0] as AnthropicTypes.TextBlock).text,
  }
}

export async function activate(context: novachat.PluginContext) {
  const createClient = async () => {
    const [clientEmail, privateKey, region, projectId] = await Promise.all([
      novachat.setting.get('vertexAnthropic.googleSaClientEmail'),
      novachat.setting.get('vertexAnthropic.googleSaPrivateKey'),
      novachat.setting.get('vertexAnthropic.region'),
      novachat.setting.get('vertexAnthropic.projectId'),
    ])
    return new AnthropicVertexWeb({
      clientEmail,
      privateKey,
      region,
      projectId,
    })
  }
  await novachat.model.registerProvider({
    name: 'VertexAnthropic',
    models: [
      { id: 'claude-3-5-sonnet-v2@20241022', name: 'Claude 3.5 Sonnet v2' },
      { id: 'claude-3-5-sonnet@20240620', name: 'Claude 3.5 Sonnet' },
      { id: 'claude-3-haiku@20240307', name: 'Claude 3 Haiku' },
      { id: 'claude-3-opus@20240229', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet@20240229', name: 'Claude 3 Sonnet' },
    ],
    async invoke(query) {
      const client = await createClient()
      return parseResponse(
        await client.messages.create(
          (await parseReq(
            query,
            false,
          )) as AnthropicTypes.MessageCreateParamsNonStreaming,
        ),
      )
    },
    async *stream(query) {
      const client = await createClient()
      const stream = await client.messages.create(
        (await parseReq(
          query,
          true,
        )) as AnthropicTypes.MessageCreateParamsStreaming,
      )
      for await (const it of stream) {
        if (it.type === 'content_block_delta') {
          if (it.delta.type !== 'text_delta') {
            throw new Error('Unsupported delta type')
          }
          yield {
            content: it.delta.text,
          }
        }
      }
    },
  })
}
