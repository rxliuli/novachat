import type { Message } from './Message'
import type { Timestamps } from './Timestamps'

export type Conversation = Timestamps & {
  id: string
  title: string
  model: string // 会话使用的 model，可以是官方的 OpenAI 模型，也可以是自定义的 Bot，或是插件提供的 Bot
  messages: Message[]
}
