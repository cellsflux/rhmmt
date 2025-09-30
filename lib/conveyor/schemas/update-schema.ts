import { z } from 'zod'

// Schéma de base pour les réponses avec statut de succès/erreur
const baseResponseSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
})

export const updateIpcSchema = {
  'check-for-updates': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      version: z.string().nullable().optional(),
      releaseDate: z.string().nullable().optional(),
      releaseNotes: z.string().nullable().optional(),
    }),
  },
  'download-update': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      status: z.enum(['download-started']).optional(),
      backupCreated: z.boolean().optional(),
      backupRestored: z.boolean().optional(),
    }),
  },
  'quit-and-install': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      status: z.enum(['installation-started']).optional(),
      message: z.string().optional(),
    }),
  },
  'restore-sqlite': {
    args: z.tuple([]),
    return: baseResponseSchema,
  },
  'verify-backup': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      exists: z.boolean().optional(),
      size: z.number().optional(),
      modified: z.date().optional(),
    }),
  },
  'create-backup': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      backupPath: z.string().optional(),
    }),
  },
  'get-app-version': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      version: z.string(),
      name: z.string(),
    }),
  },
  'get-update-status': {
    args: z.tuple([]),
    return: baseResponseSchema.extend({
      isUpdaterActive: z.boolean(),
      autoDownload: z.boolean(),
      autoInstallOnAppQuit: z.boolean(),
      currentVersion: z.string(),
    }),
  },
}

// Schema pour les événements de mise à jour (update-status)
export const updateStatusSchema = z.object({
  status: z.enum(['checking', 'available', 'not-available', 'download-progress', 'downloaded', 'installing', 'error']),
  timestamp: z.string(),
  message: z.string().optional(),
  version: z.string().optional(),
  releaseDate: z.string().optional(),
  releaseNotes: z.string().optional(),
  percent: z.number().optional(),
  bytesPerSecond: z.number().optional(),
  transferred: z.number().optional(),
  total: z.number().optional(),
  stack: z.string().optional(),
})
