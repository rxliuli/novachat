interface Timestamps {
  createdAt: string
  updatedAt: string
}

export type Attachment = Timestamps & {
  id: string
  data: Blob
  name: string
  type: 'image/jpeg'
  url: string
}

export type Message = Timestamps & {
  role: 'user' | 'assistant' | 'system'
  id: string
  content: string
  attachments?: Attachment[]
}
