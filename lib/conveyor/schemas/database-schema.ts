import { z } from 'zod'

export const dbIpcSchema = {
  'get-users': {
    args: z.tuple([]),
    return: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
      })
    ),
  },
  'add-user': {
    args: z.tuple([
      z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    ]),
    return: z.object({
      id: z.number(),
      name: z.string(),
      email: z.string(),
    }),
  },
} as const

export type DbIpcSchema = typeof dbIpcSchema
