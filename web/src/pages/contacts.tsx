import { useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'

import { ContactsContainer } from '../features/contacts/components/contacts-container'
import {
  createContact,
  loadContacts,
  updateContact,
  updateContactArchive,
} from '../features/contacts/services/contact-service'
import {
  contactMutationSchema,
  type ContactActionResult,
  type ContactLoaderData,
} from '../features/contacts/types'

export async function loader({ request }: LoaderFunctionArgs): Promise<ContactLoaderData> {
  return { contacts: await loadContacts(request.signal) }
}

export async function action({ request }: ActionFunctionArgs): Promise<ContactActionResult> {
  try {
    const mutation = contactMutationSchema.parse(await request.json())
    if (mutation.intent === 'archive') {
      await updateContactArchive(mutation.id, mutation.archived, request.signal)
      return { message: 'Contato atualizado.' }
    }
    if (mutation.id) await updateContact(mutation.id, mutation.contact, request.signal)
    else await createContact(mutation.contact, request.signal)
    return { message: 'Contato salvo.' }
  } catch (error) {
    return {
      error:
        error instanceof z.ZodError
          ? error.issues.map((issue) => issue.message).join(', ')
          : error instanceof Error
            ? error.message
            : 'Não foi possível salvar o contato.',
    }
  }
}

export function Contacts() {
  return <ContactsContainer data={useLoaderData() as ContactLoaderData} />
}
