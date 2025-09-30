// components/UnderDevelopmentScreen.tsx
import React from 'react'
import { Construction } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { useNavigate } from 'react-router-dom'

interface UnderDevelopmentScreenProps {
  moduleName?: string
}

export const UnderDevelopmentScreen: React.FC<UnderDevelopmentScreenProps> = ({ moduleName = 'Ce module' }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-full mb-4">
            <Construction className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">En cours de développement</h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            {moduleName} est actuellement en cours de développement et sera disponible prochainement.
          </p>
        </div>

        <Button onClick={() => navigate(-1)} className="bg-orange-600 hover:bg-orange-700 text-white">
          Retour
        </Button>
      </div>
    </div>
  )
}
