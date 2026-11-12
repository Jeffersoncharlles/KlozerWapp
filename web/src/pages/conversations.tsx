import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'

import { ConversationsContainer } from '../features/conversations/components/conversations-container'
import {
  addTagToContact,
  loadConversations,
  loadTags,
  removeTagFromContact,
  sendConversationMessage,
} from '../features/conversations/services/conversation-service'
import {
  conversationMutationSchema,
  type ConversationActionResult,
  type ConversationLoaderData,
} from '../features/conversations/types'

export async function loader({ request }: LoaderFunctionArgs): Promise<ConversationLoaderData> {
  const [conversations, tags] = await Promise.all([
    loadConversations(request.signal),
    loadTags(request.signal),
  ])
  return { conversations, tags }
}

export async function action({ request }: ActionFunctionArgs): Promise<ConversationActionResult> {
  try {
    const mutation = conversationMutationSchema.parse(await request.json())
    if (mutation.intent === 'send') {
      return {
        sentMessage: await sendConversationMessage(
          mutation.contactID,
          mutation.content,
          request.signal,
        ),
        message: 'Mensagem enviada',
      }
    }
    if (mutation.intent === 'add-tag') {
      await addTagToContact(mutation.contactID, mutation.tagID, request.signal)
      return {
        tagEvent: { contactID: mutation.contactID, tagID: mutation.tagID, added: true },
        message: 'Tag adicionada',
      }
    }
    await removeTagFromContact(mutation.contactID, mutation.tagID, request.signal)
    return {
      tagEvent: { contactID: mutation.contactID, tagID: mutation.tagID, added: false },
      message: 'Tag removida',
    }
  } catch (error) {
    if (error instanceof z.ZodError)
      return { error: error.issues.map((issue) => issue.message).join(', ') }
    return {
      error: error instanceof Error ? error.message : 'Não foi possível atualizar a conversa.',
    }
  }
}

export const Conversations = () => <ConversationsContainer />
