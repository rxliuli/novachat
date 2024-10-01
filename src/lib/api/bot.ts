import { OpenAI } from 'openai'
import type { Message } from '$lib/types/Message'
import { get } from 'svelte/store'
import { settingsStore } from '$lib/stores/settings'
import { blobToDataURI } from '$lib/utils/datauri'

interface ChatCompletionChunk {
  text: string
  replace?: boolean
}

interface ChatCompletion {
  text: string
}

export type EndpointMessage = Pick<Message, 'from' | 'content' | 'attachments'>

interface BotRequest {
  messages: EndpointMessage[]
  controller: AbortController
  model: string
}

interface Bot {
  name: string
  invoke(req: BotRequest): Promise<ChatCompletion>
  stream(req: BotRequest): AsyncGenerator<ChatCompletionChunk>
}

function convertReq(
  req: BotRequest,
  stream: true,
): OpenAI.ChatCompletionCreateParamsStreaming
function convertReq(
  req: BotRequest,
): OpenAI.ChatCompletionCreateParamsNonStreaming
function convertReq(
  req: BotRequest,
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

function openai(): Bot {
  const client = () => {
    const store = get(settingsStore)
    return new OpenAI({
      apiKey: store.apiKey,
      baseURL: store.baseUrl,
      dangerouslyAllowBrowser: true,
    })
  }
  return {
    name: 'OpenAI',
    async invoke(options: BotRequest) {
      const response = await client().chat.completions.create(
        convertReq(options),
      )
      return {
        text: response.choices[0].message.content ?? '',
      }
    },
    async *stream(options): AsyncGenerator<ChatCompletionChunk> {
      const response = await client().chat.completions.create(
        convertReq(options, true),
      )
      options.controller.signal.addEventListener(
        'abort',
        response.controller.abort,
      )
      for await (const it of response) {
        if (options.controller.signal.aborted) {
          break
        }
        yield {
          text: it.choices[0].delta.content ?? '',
        }
      }
    },
  }
}

export const bot = openai()
