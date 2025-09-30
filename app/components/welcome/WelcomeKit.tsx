import { useEffect, useRef, useState } from 'react'
import EraShape from './EraShape'
import EraContent from './contents/EraContent'
import ElectronContent from './contents/ElectronContent'
import ReactContent from './contents/ReactContent'
import ViteContent from './contents/ViteContent'
import ShadContent from './contents/ShadContent'
import TailwindContent from './contents/TailwindContent'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '../ui/badge'
import './styles.css'
import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react'
import { useConveyor } from '@/app/hooks/use-conveyor'

export default function WelcomeKit() {
  const [activePath, setActivePath] = useState<number>(5)

  const handlePathHover = (index: number) => {
    setActivePath(index)
  }

  const handlePathReset = () => {
    setActivePath(5)
  }

  const content = () => {
    switch (activePath) {
      case 0:
        return <ElectronContent />
      case 1:
        return <ReactContent />
      case 2:
        return <ViteContent />
      case 3:
        return <ShadContent />
      case 4:
        return <TailwindContent />
      case 5:
        return <EraContent />
      default:
        return <EraContent />
    }
  }

  return (
    <div className="welcome-content light:bg-white dark:bg-gray-900 flex flex-col gap-5">
      <div className="flex gap-5 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={'content-' + activePath}
            style={{ zIndex: 2, flex: 1 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut',
            }}
          >
            {content()}
          </motion.div>
        </AnimatePresence>
        <EraShape onPathHover={handlePathHover} onPathReset={handlePathReset} />
      </div>
      <div className="flex justify-center items-center gap-4 opacity-50 hover:opacity-80 transition-opacity">
        <DarkModeToggle />
      </div>
    </div>
  )
}

export type Theme = 'system' | 'dark' | 'light'

export const DarkModeToggle = () => {
  const [theme, setTheme] = useState<Theme>('system')

  // Charger le thème au montage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['system', 'dark', 'light'].includes(savedTheme)) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    }
  }, [])

  // Appliquer le thème
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')

    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else if (newTheme === 'light') {
      root.classList.add('light')
    } else {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.add(systemPrefersDark ? 'dark' : 'light')
    }
  }

  // Changer de thème
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const options = [
    { value: 'light' as Theme, icon: Sun, label: 'Clair' },
    { value: 'system' as Theme, icon: Monitor, label: 'Auto' },
    { value: 'dark' as Theme, icon: Moon, label: 'Sombre' },
  ]

  return (
    <div className="p-4">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Thème</div>

      <div className="flex gap-2">
        {options.map((option) => {
          const Icon = option.icon
          const isSelected = theme === option.value

          return (
            <button
              key={option.value}
              onClick={() => changeTheme(option.value)}
              className={`flex flex-col cursor-pointer items-center gap-2 p-3 rounded-lg border transition-colors flex-1 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
