import { Agent } from '@/lib/database/models/recutement/agent'
import { Departement } from '@/lib/database/models/recutement/departemen'
import { ConveyorApi } from '@/lib/preload/shared'
import { z } from 'zod'

export const domaineObject = z.object({
  id: z.number().optional(),
  departementId: z.string().or(z.number()).nullable().optional(),
  name: z.string().optional(),
  description: z.string().nullable().optional(),
})

export class AppApi extends ConveyorApi {
  version = () => this.invoke('version')

  /** Agents */
  getAgents = (): Promise<Agent[]> => this.invoke('get-agents')
  getAgent = (id: number): Promise<Agent | null> => this.invoke('get-agent', id)
  addAgent = (agent: Omit<Agent, 'id'>): Promise<Agent> => this.invoke('add-agent', agent)
  addAgents = (agents: Omit<Agent, 'id'>[]): Promise<Agent[]> => this.invoke('add-agents', agents)
  updateAgent = (agent: Partial<Agent> & { id: number }): Promise<Agent | null> => {
    // S'assurer que l'id est bien présent
    if (!agent.id) {
      return Promise.reject(new Error("L'ID de l'agent est requis pour la mise à jour"))
    }
    return this.invoke('update-agent', agent)
  }
  deleteAgent = (id: number): Promise<boolean> => this.invoke('delete-agent', id)
  searchAgents = (query: Partial<Agent>): Promise<Agent[]> => this.invoke('search-agents', query)

  /**Departements */
  addDepartement = (dep: Omit<Departement, 'id'>) => this.invoke('add-departement', dep)
  deleteDepartement = (id: number) => this.invoke('delete-departement', id)
  getDepartements = () => this.invoke('get-departements')
  getDepartement = (id: number) => this.invoke('get-departement', id)
  updateDepartement = (dep: Partial<Omit<Departement, 'id'>> & { id: number }) => this.invoke('update-departement', dep)
  searchDepartements = (query: { nom?: string; prefixMatricule?: string }) => this.invoke('search-departements', query)
  /** Domaines */
  getDomaines = (): Promise<z.infer<typeof domaineObject>[]> => this.invoke('get-domaines')
  getDomaine = (id: number): Promise<z.infer<typeof domaineObject> | null> => this.invoke('get-domaine', id)
  addDomaine = (dep: Omit<z.infer<typeof domaineObject>, 'id'>): Promise<z.infer<typeof domaineObject>> =>
    this.invoke('add-domaine', dep)
  updateDomaine = (
    dep: Partial<Omit<z.infer<typeof domaineObject>, 'id'>> & { id: number }
  ): Promise<z.infer<typeof domaineObject>> => this.invoke('update-domaine', dep)

  deleteDomaine = (id: number): Promise<boolean> => this.invoke('delete-domaine', id)

  searchDomaines = (query: {
    departementId?: string | number
    name?: string
  }): Promise<z.infer<typeof domaineObject>[]> => this.invoke('search-domaines', query)

  // Update handlers
  checkForUpdates = () => this.invoke('check-for-updates')
  downloadUpdate = () => this.invoke('download-update')
  quitAndInstall = () => this.invoke('quit-and-install')
  restoreSQLite = () => this.invoke('restore-sqlite')
  getAppVersion = () => this.invoke('get-app-version')

  // Ajoutez ces méthodes manquantes :
  verifyBackup = () => this.invoke('verify-backup')
  createBackup = () => this.invoke('create-backup')
  getUpdateStatus = () => this.invoke('get-update-status')
}
