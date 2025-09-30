import React, { useEffect, useState } from 'react'
import { useConveyor } from '../hooks/use-conveyor'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Agent } from '@/lib/database/models/recutement/agent'
import { AgentDetail } from '../components/agents/detailAgent'
import PriterModelOne from '../components/printings/printer01'

export default function AgentDetailsScreen() {
  const { getAgent } = useConveyor('app')
  const [parames] = useSearchParams()
  const [agent, setaAgent] = useState<Agent>()
  const navigate = useNavigate() // hook pour navigation

  const [tab, setTab] = useState<'agent' | 'printe'>('agent')

  const loadUser = async (id: number) => {
    const user = await getAgent(id)
    if (user) {
      setaAgent(user)
    }
  }

  useEffect(() => {
    const idParam = parames.get('id')
    if (idParam) {
      loadUser(parseInt(idParam))
    }
  }, [parames])

  const handleRetour = () => {
    navigate(-1) // retourne à la page précédente
  }

  return (
    <div className="py-12 gap-1 bg-neutral-100 dark:bg-transparent justify-center flex flex-col items-center">
      {/* Détails de l'agent */}

      {agent && <PriterModelOne open={tab === 'printe'} agent={agent} onClose={() => setTab('agent')} />}
      {agent && <AgentDetail agent={agent} openPrint={() => setTab('printe')} />}
    </div>
  )
}
