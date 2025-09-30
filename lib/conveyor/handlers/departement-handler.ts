import { handle } from '@/lib/main/shared'
import { DepartementModel, Departement } from '@/lib/database/models/recutement/departemen'

function normalizeDepartement(d: Departement): {
  id: number
  nom: string
  descriptions?: string
  prefixMatricule?: string
} {
  return {
    id: d.id ?? 0, // forcer number
    nom: d.nom,
    descriptions: d.descriptions,
    prefixMatricule: d.prefixMatricule,
  }
}

export const registerDepartementHandlers = () => {
  handle('get-departements', () => {
    return DepartementModel.getAll().map(normalizeDepartement)
  })

  handle('get-departement', (id: number) => {
    const dep = DepartementModel.getById(id)
    return dep ? normalizeDepartement(dep) : null
  })

  handle('add-departement', (data: Omit<Departement, 'id'>) => {
    const newDep = DepartementModel.create(data)
    return normalizeDepartement(newDep)
  })

  handle('delete-departement', (id: number) => {
    DepartementModel.delete(id)
    return true
  })

  handle('search-departements', (query: { nom?: string; prefixMatricule?: string }) => {
    return DepartementModel.search(query).map(normalizeDepartement)
  })
}
