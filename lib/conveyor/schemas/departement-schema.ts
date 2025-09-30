import { z } from 'zod'

export const departementIpcSchema = {
  'update-departement': {
    args: z.tuple([
      z.object({
        id: z.number(),
        nom: z.string().optional(),
        descriptions: z.string().optional(),
        prefixMatricule: z.string().optional(),
      }),
    ]),
    return: z.object({
      id: z.number(),
      nom: z.string(),
      descriptions: z.string().optional(),
      prefixMatricule: z.string().optional(),
    }),
  },

  'get-departements': {
    args: z.tuple([]),
    return: z.array(
      z.object({
        id: z.number(),
        nom: z.string(),
        descriptions: z.string().optional(),
        prefixMatricule: z.string().optional(),
      })
    ),
  },
  'get-departement': {
    args: z.tuple([z.number()]),
    return: z
      .object({
        id: z.number(),
        nom: z.string(),
        descriptions: z.string().optional(),
        prefixMatricule: z.string().optional(),
      })
      .nullable(),
  },
  'add-departement': {
    args: z.tuple([
      z.object({
        nom: z.string(),
        descriptions: z.string().optional(),
        prefixMatricule: z.string().optional(),
      }),
    ]),
    return: z.object({
      id: z.number(),
      nom: z.string(),
      descriptions: z.string().optional(),
      prefixMatricule: z.string().optional(),
    }),
  },
  'delete-departement': {
    args: z.tuple([z.number()]),
    return: z.boolean(),
  },
  'search-departements': {
    args: z.tuple([
      z.object({
        nom: z.string().optional(),
        prefixMatricule: z.string().optional(),
      }),
    ]),
    return: z.array(
      z.object({
        id: z.number(),
        nom: z.string(),
        descriptions: z.string().optional(),
        prefixMatricule: z.string().optional(),
      })
    ),
  },
}
