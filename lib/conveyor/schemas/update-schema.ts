import { z } from 'zod'

export const updateIpcSchema = {
  'check-for-updates': {
    args: z.tuple([]),
    return: z.object({
      version: z.string().optional(),
      releaseNotes: z.string().optional(),
    }),
  },
  'download-update': {
    args: z.tuple([]),
    return: z.object({
      status: z.enum(['started', 'completed']).optional(),
    }),
  },
  'quit-and-install': {
    args: z.tuple([]),
    return: z.object({ status: z.literal('ok') }),
  },
  'restore-sqlite': {
    args: z.tuple([]),
    return: z.object({ status: z.literal('restored') }),
  },
  'get-app-version': {
    args: z.tuple([]),
    return: z.object({ version: z.string() }),
  },
}
