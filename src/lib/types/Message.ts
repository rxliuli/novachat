import type { Timestamps } from './Timestamps'

export interface Attachment {
  url: string
  name: string
  type: 'image/jpeg'
}

export type Message = Timestamps & {
  from: 'user' | 'assistant' | 'system'
  id: string
  content: string
  attachments?: Attachment[]
}
