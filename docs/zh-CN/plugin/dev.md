# 创建插件

插件根目录至少需要包含两个文件：

- plugin.json: 描述插件信息的 json 文件
- index.js: 实现功能的 JavaScript 脚本

## 配置 plugin.json

| 字段          | 类型   | 是否必须 | 说明                                                                           |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------ |
| id            | string | ✅       | 插件的唯一标识符，必须由数字、小写字母和 . 组成。                              |
| name          | string | ✅       | 插件名称，无限制，建议别太长。                                                 |
| version       | string | ✅       | 插件版本号，必须由数字、小写字母和 . 组成。                                    |
| description   | string | -        | 插件描述信息。                                                                 |
| configuration | object | -        | 插件选项数组，该字段用于提供一些选项供用户选择或填写，详情见 `config object`。 |

### config object

| 字段       | 类型                   | 是否必须 | 说明                       |
| ---------- | ---------------------- | -------- | -------------------------- |
| title      | string                 | ✅       | 插件在配置页面显示的分类   |
| properties | Record<string, object> | ✅       | 配置 JSON Schema，示例如下 |

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

## 实现 index.js

前文提到，index.js 是一个 JavaScript 脚本，需要导出一个 activate 函数供 NovaChat 初始化，而所有插件相关的 API 都从 `@novachat/plugin` 中导入。

下面是一个不做任何事情的插件：

```ts
export async function activate() {
  console.log('demo plugin activated')
}
```

### 添加 LLM 支持

要添加新的 LLM 支持，需要使用 `novachat.model.registerProvider` 注册新的 LLM Provider，一般会提供多个模型。

下面是 OpenAI Provider 的实现：

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

上面使用 `novachat.setting.get('openai.apiKey')` 获取用户配置的 API Key，所以还需要在 plugin.json 中添加配置选项。

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

### 实现 Prompt Bot

有时候只想使用提示词来进行角色扮演或其他任何事情，希望使用已经配置的 LLM Provider。这种情况下可以实现一个 Prompt Bot，下面是一个翻译插件，它会检测输入内容的语言，如果与用户配置的默认语言相同，就会翻译为英语，否则翻译为用户配置的语言。

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
