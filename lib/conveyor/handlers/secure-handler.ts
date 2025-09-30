import { handle } from '@/lib/main/shared'

export const registerSecureDataHandlers = () => {
  handle('encripte', () => {
    return ///secure
  })

  handle('decripte', (id: number) => {
    return //data normale
  })
}
