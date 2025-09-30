import { handle } from '@/lib/main/shared'
import { User } from '@/lib/database'

export const registerUserHandlers = () => {
  handle('get-users', () => {
    return User.all().map((u) => ({ id: Number(u.id), name: u.name, email: u.email }))
  })

  handle('add-user', (user: { name: string; email: string }) => {
    const inserted = User.insert(user)
    return {
      id: Number(inserted.id), // s’assure que id n’est jamais undefined
      name: inserted.name,
      email: inserted.email,
    }
  })
}
