// components/agents/DemissionModal.tsx
import React, { useState } from 'react'
import { Search, X, Calendar, User } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { Agent } from '@/lib/database/models/recutement/agent'
import { useConveyor } from '@/app/hooks/use-conveyor'

interface DemissionData {
  agentId: number
  dateDemission: string
  motif?: string
}

interface DemissionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agents: Agent[]
  onDemissionRecorded: () => void
}

export const DemissionModal: React.FC<DemissionModalProps> = ({ open, onOpenChange, agents, onDemissionRecorded }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [dateDemission, setDateDemission] = useState<string>('')
  const [motif, setMotif] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const { updateAgent } = useConveyor('app')

  // Filtrer les agents selon la recherche
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery) return false

    const query = searchQuery.toLowerCase()
    return (
      agent.matricule?.toLowerCase().includes(query) ||
      agent.nom.toLowerCase().includes(query) ||
      agent.prenom.toLowerCase().includes(query) ||
      `${agent.nom} ${agent.prenom}`.toLowerCase().includes(query) ||
      `${agent.prenom} ${agent.nom}`.toLowerCase().includes(query)
    )
  })

  const handleDemission = async () => {
    if (!selectedAgent || !dateDemission) return

    setLoading(true)
    try {
      const neuAgent: Partial<Agent> & { id: number } = {
        ...selectedAgent,
        dateFinContrat: dateDemission,
        id: selectedAgent.id as number,
      }

      // Appel à l'API pour enregistrer la démission
      await updateAgent(neuAgent)

      // Réinitialiser le formulaire
      resetForm()

      // Fermer la modale
      onOpenChange(false)

      // Notifier le parent
      onDemissionRecorded()
    } catch (error) {
      console.error('Erreur lors de lenregistrement de la démission:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSearchQuery('')
    setSelectedAgent(null)
    setDateDemission('')
    setMotif('')
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const getContractStatus = (agent: Agent) => {
    if (!agent.dateFinContrat) return { status: 'En cours', isActive: true }

    const endDate = new Date(agent.dateFinContrat)
    const now = new Date()
    const isActive = endDate > now

    return {
      status: isActive ? 'En cours' : 'Expiré',
      isActive,
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg bg-white dark:bg-neutral-800">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <User className="h-5 w-5" />
            Enregistrer une démission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Recherche d'agent */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Rechercher un agent</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Rechercher par nom, prénom ou matricule..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={!!selectedAgent}
                className="pl-10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Résultats de recherche */}
          {searchQuery && !selectedAgent && (
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-md max-h-60 overflow-y-auto">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((agent) => {
                  const contractStatus = getContractStatus(agent)
                  return (
                    <div
                      key={agent.id}
                      className="p-3 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer border-b border-neutral-100 dark:border-neutral-600 last:border-b-0"
                      onClick={() => {
                        setSelectedAgent(agent)
                        setSearchQuery(`${agent.nom} ${agent.prenom} - ${agent.matricule}`)
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {agent.nom} {agent.prenom}
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {agent.matricule} • {agent.poste_ocuper?.name || 'Poste non défini'}
                          </div>
                          <div className="text-xs text-neutral-400 dark:text-neutral-500">
                            Département: {agent.departement?.name}
                          </div>
                        </div>
                        <Badge variant={contractStatus.isActive ? 'default' : 'destructive'} className="text-xs">
                          {contractStatus.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-4 text-center text-neutral-500 dark:text-neutral-400">Aucun agent trouvé</div>
              )}
            </div>
          )}

          {/* Agent sélectionné */}
          {selectedAgent && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-700 rounded-md border border-neutral-200 dark:border-neutral-600">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {selectedAgent.nom?.charAt(0) ?? '-'}
                      {selectedAgent.prenom?.charAt(0) ?? '-'}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {selectedAgent.nom} {selectedAgent.prenom}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {selectedAgent.matricule} • {selectedAgent.poste_ocuper?.name}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500">Département:</span>
                      <div className="text-neutral-600 dark:text-neutral-300">
                        {selectedAgent.departement?.name || 'Non défini'}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-400 dark:text-neutral-500">Contrat:</span>
                      <div className="text-neutral-600 dark:text-neutral-300">
                        {selectedAgent.typeContrat?.toUpperCase() || 'Non défini'}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedAgent(null)
                    setSearchQuery('')
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Date de démission */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Date de démission <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                type="date"
                value={dateDemission}
                onChange={(e) => setDateDemission(e.target.value)}
                className="pl-10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Motif (optionnel) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Motif de la démission (optionnel)
            </label>
            <Input
              placeholder="Raison de la démission..."
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              className="bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
            className="border-neutral-300 dark:border-neutral-600"
          >
            Annuler
          </Button>
          <Button
            onClick={handleDemission}
            disabled={!selectedAgent || !dateDemission || loading}
            className="bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer la démission'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
