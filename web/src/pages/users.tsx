import { useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from 'react-router'
import { z } from 'zod'

import { UsersContainer } from '../features/users/components/users-container'
import {
  createUser,
  loadUsers,
  updateUser,
  updateUserStatus,
} from '../features/users/services/user-service'
import {
  userMutationSchema,
  type UserActionResult,
  type UserLoaderData,
} from '../features/users/types'

export async function loader({ request }: LoaderFunctionArgs): Promise<UserLoaderData> {
  return { users: await loadUsers(request.signal) }
}

export async function action({ request }: ActionFunctionArgs): Promise<UserActionResult> {
  try {
    const mutation = userMutationSchema.parse(await request.json())
    if (mutation.intent === 'status') {
      await updateUserStatus(mutation.id, mutation.isActive, request.signal)
      return { message: 'Status atualizado.' }
    }
    if (mutation.id) await updateUser(mutation.id, mutation.user, request.signal)
    else await createUser(mutation.user, request.signal)
    return { message: 'Usuário salvo.' }
  } catch (error) {
    return {
      error:
        error instanceof z.ZodError
          ? error.issues.map((issue) => issue.message).join(', ')
          : error instanceof Error
            ? error.message
            : 'Não foi possível salvar o usuário.',
    }
  }
}

export function Users() {
  return <UsersContainer data={useLoaderData() as UserLoaderData} />
}
