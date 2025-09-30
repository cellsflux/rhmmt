import { handle } from '@/lib/main/shared'
import { AgentModel, Agent } from '@/lib/database/models/recutement/agent'

// Fonction helper pour convertir les null en undefined
const transformAgent = (agent: any): Agent => ({
  ...agent,
  id: agent.id || undefined,
  matricule: agent.matricule || undefined,
  email: agent.email || undefined,
  devise: agent.devise || undefined,
  habillement: agent.habillement || undefined,
  banque: agent.banque || undefined,
  brithday: agent.brithday || undefined,
  brithplace: agent.brithplace || undefined,
  adresse: agent.adresse || undefined,
  pere: agent.pere || undefined,
  mere: agent.mere || undefined,
  personneUrgence: agent.personneUrgence || undefined,
  carteIdentite: agent.carteIdentite || undefined,
  nomduconjoint: agent.nomduconjoint || undefined,
  nombre_enfants: agent.nombre_enfants || undefined,
  enfants: agent.enfants || undefined,
  typeContrat: agent.typeContrat || undefined,
  dateDebutContrat: agent.dateDebutContrat || undefined,
  dateFinContrat: agent.dateFinContrat || undefined,
  poste_ocuper: agent.poste_ocuper || undefined,
  saleaire: agent.saleaire || undefined,
  cncss: agent.cncss || undefined,
  nif: agent.nif || undefined,
  image: agent.image || undefined,
  signature: agent.signature || undefined,
  cardIdentiteImage: agent.cardIdentiteImage || undefined,
})

export const registerAgentHandlers = () => {
  handle('get-agents', () => {
    const agents = AgentModel.getAll()
    return agents.map(transformAgent)
  })

  handle('get-agent', (id: number) => {
    const agent = AgentModel.getById(id)
    return agent ? transformAgent(agent) : null
  })

  handle('add-agent', (agent: Omit<Agent, 'id'>) => {
    const createdAgent = AgentModel.create(agent)
    return transformAgent(createdAgent)
  })

  handle('add-agents', (agents: Omit<Agent, 'id'>[]) => {
    const createdAgents = AgentModel.createMany(agents)
    return createdAgents.map(transformAgent)
  })

  handle('update-agent', (agent: Partial<Agent> & { id: number }) => {
    const { id, ...data } = agent
    AgentModel.update(id, data)
    const updatedAgent = AgentModel.getById(id)
    return updatedAgent ? transformAgent(updatedAgent) : null
  })

  handle('delete-agent', (id: number) => {
    AgentModel.delete(id)
    return true
  })

  handle('search-agents', (query: Partial<Agent>) => {
    const agents = AgentModel.search(query)
    return agents.map(transformAgent)
  })
}
