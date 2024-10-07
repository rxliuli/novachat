# Creating a Plugin

The root directory of a plugin must contain at least two files:

- plugin.json: A JSON file describing the plugin information
- index.js: A JavaScript script implementing the functionality

The plugin bundle is a zip archive of these two files.

## Configuring plugin.json

| Field         | Type   | Required | Description                                                                                                         |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------------- |
| id            | string | ✅       | Unique identifier for the plugin, must consist of numbers, lowercase letters, and dots.                             |
| name          | string | ✅       | Plugin name, no restrictions, but it's recommended to keep it short.                                                |
| version       | string | ✅       | Plugin version number, must consist of numbers, lowercase letters, and dots.                                        |
| description   | string | -        | Plugin description.                                                                                                 |
| configuration | object | -        | Array of plugin options, this field is used to provide options for users to select or fill in, see `config object`. |

### config object

| Field      | Type                   | Required | Description                                                 |
| ---------- | ---------------------- | -------- | ----------------------------------------------------------- |
| title      | string                 | ✅       | Category displayed on the configuration page for the plugin |
| properties | Record<string, object> | ✅       | Configuration JSON Schema, example below                    |

```json
{
  "title": "OpenAI",
  "properties": {
    "openai.apiKey": {
      "type": "string",
      "description": "The API key to use for OpenAI",
      "default": "",
      "format": "password"
    }
  }
}
```

## Implementing index.js

As mentioned earlier, index.js is a JavaScript script that needs to export an activate function for NovaChat to initialize, and all plugin-related APIs are imported from `@novachat/plugin`.

Here's a plugin that doesn't do anything:

```ts
export async function activate() {
  console.log('demo plugin activated')
}
```

### Adding LLM Support

To add support for a new LLM, use `novachat.model.registerProvider` to register a new LLM Provider, which generally provides multiple models.

Here's an implementation of the OpenAI Provider:

```ts
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
```

The above uses `novachat.setting.get('openai.apiKey')` to get the user-configured API Key, so you also need to add configuration options in plugin.json.

```json
{
  "configuration": {
    "title": "OpenAI",
    "properties": {
      "openai.apiKey": {
        "type": "string",
        "description": "The API key to use for OpenAI",
        "default": "",
        "format": "password"
      }
    }
  }
}
```

> Reference: <https://github.com/rxliuli/novachat/tree/main/packages/plugin-openai>

### Implementing a Prompt Bot

Sometimes you just want to use prompts for role-playing or other purposes, hoping to use the already configured LLM Provider. In this case, you can implement a Prompt Bot. Here's a translation plugin that detects the language of the input content and translates it to English if it matches the user's default language, otherwise translates it to the user's configured language.

```ts
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
```

> Reference: <https://github.com/rxliuli/novachat/tree/main/packages/plugin-translator>
