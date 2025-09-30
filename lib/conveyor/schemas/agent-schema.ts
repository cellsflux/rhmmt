import { optional, z } from 'zod'

const adresseSchema = z
  .object({
    ville: z.string().optional(),
    commune: z.string().optional(),
    quartier: z.string().optional(),
    avenue: z.string().optional(),
    numero: z.string().optional(),
  })
  .strict()

const personneUrgenceSchema = z
  .object({
    nom: z.string(),
    prenom: z.string().optional(),
    telephone: z.string(),
    relationShip: z.string(),
  })
  .strict()

const pieceIdentiteSchema = z
  .object({
    carteType: z.enum(['cartedelecteur', 'pasport', 'autre']),
    numero: z.string(),
    nomdedelacarte: z.string().optional(),
  })
  .strict()

const habillementSchema = z
  .object({
    booteTaille: z.string().optional(),
    tshartTaille: z.string().optional(),
  })
  .strict()

const banqueSchema = z
  .object({
    nom: z.string().optional(),
    numeroCompte: z.string().optional(),
  })
  .strict()

const salaireSchema = z
  .object({
    montant: z.number(),
    type: z.enum(['jouranlier', 'mensuelle', 'trimestrielle', 'annuelle']),
  })
  .strict()

const posteSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
  })
  .strict()

const departementSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().optional(),
  })
  .strict()

const enfantSchema = z
  .object({
    nom: z.string().optional(),
    postnom: z.string().optional(),
    prenom: z.string().optional(),
    brithday: z.string().optional(),
    brithplace: z.string().optional(),
    gendre: optional(z.enum(['M', 'F'])),
  })
  .strict()

export const agentSchema = z
  .object({
    id: z.number().optional(),
    matricule: z.string().optional(),
    nom: z.string(),
    postnom: z.string(),
    prenom: z.string(),
    genre: z.string(),
    email: z.string().optional(),
    telephone: z.string(),
    devise: z.enum(['CDF', 'USD']).optional(),
    habillement: habillementSchema.optional(),
    banque: banqueSchema.optional(),
    brithday: z.string().optional(),
    brithplace: z.string().optional(),
    adresse: adresseSchema.optional(),
    pere: z.string().optional(),
    mere: z.string().optional(),
    personneUrgence: personneUrgenceSchema.optional(),
    etatcivil: z.enum(['marie', 'celibataire', 'divorcee', 'veuf']),
    nationalite: z.string(),
    carteIdentite: z.array(pieceIdentiteSchema).optional(),
    nomduconjoint: z.string().optional(),
    nombre_enfants: z.number().optional(),
    enfants: z.array(enfantSchema).optional(),
    typeContrat: z.enum(['cdd', 'cdi', 'durrere']).optional(),
    dateDebutContrat: z.string().optional(),
    dateFinContrat: z.string().optional(),
    poste_ocuper: posteSchema.optional(),
    periode_essai: z.string(),
    saleaire: salaireSchema.optional(),
    departement: departementSchema,
    nuvieau_etudes: z.enum(['diplome', 'gradue', 'brevet', 'licence', 'autre']),
    anne_experience: z.number(),
    cncss: z.string().optional(),
    nif: z.string().optional(),
    image: z.string().optional(),
    signature: z.string().optional(),
    cardIdentiteImage: z.string().optional(),
  })
  .strict()

// Fonction de transformation pour convertir null en undefined depuis la base de données
const transformAgent = agentSchema.transform((data) => {
  const transformValue = <T>(value: T | null): T | undefined => (value === null ? undefined : value)

  const transformObject = <T extends Record<string, any>>(obj: T | null | undefined): T | undefined => {
    if (obj === null || obj === undefined) return undefined
    const result: any = {}
    for (const key in obj) {
      const value = obj[key]
      if (value === null) {
        result[key] = undefined
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) =>
          item && typeof item === 'object' ? transformObject(item) : transformValue(item)
        )
      } else if (value && typeof value === 'object') {
        result[key] = transformObject(value)
      } else {
        result[key] = transformValue(value)
      }
    }
    return result
  }

  return {
    ...transformObject(data),
    // Assurer que les champs obligatoires sont bien présents
    nom: data.nom,
    postnom: data.postnom,
    prenom: data.prenom,
    genre: data.genre,
    telephone: data.telephone,
    etatcivil: data.etatcivil,
    nationalite: data.nationalite,
    periode_essai: data.periode_essai,
    departement: transformObject(data.departement)!,
    nuvieau_etudes: data.nuvieau_etudes,
    anne_experience: data.anne_experience,
  }
})

export const agentIpcSchema = {
  'get-agents': {
    args: z.tuple([]),
    return: z.array(transformAgent),
  },
  'get-agent': {
    args: z.tuple([z.number()]),
    return: transformAgent.nullable(),
  },
  'add-agent': {
    args: z.tuple([agentSchema.omit({ id: true })]),
    return: transformAgent,
  },
  'add-agents': {
    args: z.tuple([z.array(agentSchema.omit({ id: true }))]),
    return: z.array(transformAgent),
  },
  'update-agent': {
    args: z.tuple([agentSchema.partial().extend({ id: z.number() })]),
    return: transformAgent.nullable(),
  },
  'delete-agent': {
    args: z.tuple([z.number()]),
    return: z.boolean(),
  },
  'search-agents': {
    args: z.tuple([agentSchema.partial()]),
    return: z.array(transformAgent),
  },
}
