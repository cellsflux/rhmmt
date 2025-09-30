import { z } from 'zod'

// Schéma complet avec tous les champs requis
const domaineObject = z.object({
  id: z.number(),
  departementId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
})

export const domaineIpcSchema = {
  'get-domaines': {
    args: z.tuple([]),
    return: z.array(domaineObject), // Retourne un tableau avec tous les champs
  },
  'update-domaine': {
    args: z.tuple([domaineObject.partial().required({ id: true })]),
    return: domaineObject,
  },
  'get-domaine': {
    args: z.tuple([z.number()]),
    return: domaineObject.nullable(),
  },
  'add-domaine': {
    args: z.tuple([domaineObject.omit({ id: true })]),
    return: domaineObject,
  },
  'delete-domaine': {
    args: z.tuple([z.number()]),
    return: z.boolean(),
  },
  'search-domaines': {
    args: z.tuple([domaineObject.pick({ departementId: true, name: true }).partial()]),
    return: z.array(domaineObject),
  },
}
