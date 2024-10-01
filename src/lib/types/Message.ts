import type { Timestamps } from './Timestamps'

export type Attachment = Timestamps & {
  id: string
  data: Blob
  name: string
  type: 'image/jpeg'
  url: string
}

export type Message = Timestamps & {
  from: 'user' | 'assistant' | 'system'
  id: string
  content: string
  attachments?: Attachment[]
}
