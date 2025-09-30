import { handle } from '@/lib/main/shared'
import { DomaineModel, Domaine } from '@/lib/database/models/recutement/domaine'

function normalizeDomaine(d: Domaine): { id: number; departementId: string; name: string; description: string | null } {
  return {
    id: d.id ?? 0, // fallback si jamais non défini
    departementId: d.departementId, // Correction: departementId (pas departemenId)
    name: d.name,
    description: d.description ?? null, // Correction: description (pas desciption)
  }
}

export const registerDomaineHandlers = () => {
  handle('get-domaines', () => {
    return DomaineModel.getAll().map(normalizeDomaine)
  })

  handle('get-domaine', (id: number) => {
    const domaine = DomaineModel.getById(id)
    return domaine ? normalizeDomaine(domaine) : null
  })

  handle('add-domaine', (data: Omit<Domaine, 'id'>) => {
    const newDomaine = DomaineModel.create(data)
    return normalizeDomaine(newDomaine)
  })

  handle('update-domaine', (data: Domaine) => {
    // Ajout du handler manquant
    const { id, ...updateData } = data
    const updated = DomaineModel.update(id, updateData)
    return updated ? normalizeDomaine(updated) : null
  })

  handle('delete-domaine', (id: number) => {
    DomaineModel.delete(id)
    return true
  })

  handle('search-domaines', (query: { departementId?: string; name?: string }) => {
    // Correction: departementId est string
    return DomaineModel.search(query).map(normalizeDomaine)
  })
}
