import type { Conversation } from './Conversation'
import type { Attachment, Message } from './Message'

export type ConversationDB = Omit<Conversation, 'messages'>
export type MessageDB = Omit<Message, 'attachments'> & {
  conversationId: string
}
export type AttachmentDB = Omit<Attachment, 'url'> & {
  messageId: string
}

export interface PaginationOptions {
  cursor?: string | string[]
  limit?: number
}

export interface PaginationResult<T> {
  data: T[]
  nextCursor?: string | string[]
}

export interface IConversationDAO {
  getAll(options?: PaginationOptions): Promise<PaginationResult<ConversationDB>>
  create(conversation: ConversationDB): Promise<void>
  delete(id: string): Promise<void>
  update(
    conversation: Pick<ConversationDB, 'id' | 'updatedAt' | 'title'>,
  ): Promise<void>
}

export interface IMessageDAO {
  create(message: MessageDB): Promise<void>
  delete(id: string): Promise<void>
  update(message: MessageDB): Promise<void>
  getAll(
    options: { conversationId: string } & PaginationOptions,
  ): Promise<PaginationResult<MessageDB>>
}

export interface IAttachmentDAO {
  getAllByMessageId(messageId: string): Promise<AttachmentDB[]>
  create(attachment: AttachmentDB): Promise<void>
  delete(id: string): Promise<void>
}
