import { useState, useEffect } from 'react'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Button } from '@/app/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/app/components/ui/chart'
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Percent,
  Target,
  Calendar,
  Venus,
  Mars,
  RefreshCw,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import appConfig from '../constants/App'
import { useConveyor } from '../hooks/use-conveyor'
import ChartSelector from '../components/Chart'
import { Theme } from '../components/welcome/WelcomeKit'

// Types basés sur vos interfaces
interface Departement {
  id?: number
  nom: string
  descriptions?: string
  prefixMatricule?: string
}

interface Domaine {
  id: number
  departementId: string
  name: string
  description: string | null
}

interface Poste {
  id?: number
  name?: string
}

interface Salaire {
  montant: number
  type: 'jouranlier' | 'mensuelle' | 'trimestrielle' | 'annuelle'
  devise: 'USD' | 'CDF'
}

interface Agent {
  id?: number
  matricule?: string
  nom: string
  postnom: string
  prenom: string
  genre: 'M' | 'F'
  email?: string
  telephone: string
  typeContrat?: 'cdd' | 'cdi' | 'durrere'
  dateDebutContrat?: string
  dateFinContrat?: string
  poste_ocuper?: Poste
  saleaire?: Salaire
  departement: Departement
  nuvieau_etudes: 'diplome' | 'gradue' | 'brevet' | 'licence' | 'autre'
  anne_experience: number
}

// Carte métrique RH
const MetricCard = ({ title, value, change, trend, description, color, icon: Icon }) => {
  const [mounted, setMounted] = useState(false)
  const isPositive = trend === 'up'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative p-4 rounded-xl overflow-hidden bg-white dark:bg-[#100e0e] hover:scale-105 transition-transform duration-300">
        <CardHeader className="flex items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</CardTitle>
          <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-2">
            <div
              className={`text-2xl font-bold transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'}`}
            >
              {value}
            </div>
            <Badge
              variant={isPositive ? 'default' : 'destructive'}
              className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
                isPositive
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'
              }`}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{change}</span>
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{description.main}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description.sub}</p>
          </div>
        </CardContent>
      </div>
    </motion.div>
  )
}

// Types pour les filtres de période
type TimeFilter = 'semaine' | 'mois' | 'annee' | '3_ans' | 'personnalise'

export default function Dashboard() {
  const [isDark, setIsDark] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [domaines, setDomaines] = useState<Domaine[]>([])
  const [loading, setLoading] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('mois')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [stats, setStats] = useState({
    totalAgents: 0,
    totalHommes: 0,
    totalFemmes: 0,
    totalDepartements: 0,
    totalDomaines: 0,
    tauxOccupation: 0,
    salaireMoyenUSD: 0,
    salaireMoyenCDF: 0,
    contratsCDI: 0,
    contratsCDD: 0,
    experienceMoyenne: 0,
    embauchesMois: 0,
    departsMois: 0,
    tauxRotation: 0,
    ratioHommesFemmes: 0,
  })

  const { getAgents, getDepartements, getDomaines } = useConveyor('app')

  // Taux de change fictif (à remplacer par un service réel)
  const tauxChangeUSD_CDF = 2500

  // Fonction pour convertir les salaires
  const convertirSalaire = (salaire: Salaire | undefined) => {
    if (!salaire) return { usd: 0, cdf: 0 }

    let montantMensuel = salaire.montant
    // Conversion vers mensuel
    if (salaire.type === 'jouranlier') montantMensuel *= 22
    else if (salaire.type === 'annuelle') montantMensuel /= 12
    else if (salaire.type === 'trimestrielle') montantMensuel /= 3

    if (salaire.devise === 'USD') {
      return {
        usd: montantMensuel,
        cdf: montantMensuel * tauxChangeUSD_CDF,
      }
    } else {
      return {
        usd: montantMensuel / tauxChangeUSD_CDF,
        cdf: montantMensuel,
      }
    }
  }

  // Fonction pour obtenir les dates de début et fin selon le filtre
  const getDateRange = (filter: TimeFilter, year?: number) => {
    const maintenant = new Date()
    let dateDebut: Date
    let dateFin: Date

    switch (filter) {
      case 'semaine':
        dateDebut = new Date(maintenant)
        dateDebut.setDate(maintenant.getDate() - 6)
        dateFin = new Date(maintenant)
        break
      case 'mois':
        dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
        dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0)
        break
      case 'annee':
        dateDebut = new Date(maintenant.getFullYear(), 0, 1)
        dateFin = new Date(maintenant.getFullYear(), 11, 31)
        break
      case '3_ans':
        dateDebut = new Date(maintenant.getFullYear() - 3, 0, 1)
        dateFin = new Date(maintenant.getFullYear(), 11, 31)
        break
      case 'personnalise':
        dateDebut = new Date(year!, 0, 1)
        dateFin = new Date(year!, 11, 31)
        break
      default:
        dateDebut = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1)
        dateFin = new Date(maintenant.getFullYear(), maintenant.getMonth() + 1, 0)
    }

    return { dateDebut, dateFin }
  }

  // Fonction pour générer des données de chart basées sur la période sélectionnée
  const generateChartData = (agents: Agent[], filter: TimeFilter, year?: number) => {
    const { dateDebut, dateFin } = getDateRange(filter, year)
    const pasTemps = filter === 'semaine' ? 'day' : filter === 'mois' ? 'day' : filter === '3_ans' ? 'month' : 'month'

    // Générer les intervalles de temps
    const intervals: Date[] = []
    const current = new Date(dateDebut)

    while (current <= dateFin) {
      intervals.push(new Date(current))
      if (pasTemps === 'day') {
        current.setDate(current.getDate() + 1)
      } else {
        current.setMonth(current.getMonth() + 1)
      }
    }

    // Initialiser les données
    const chartData = intervals.map((date) => {
      const key =
        pasTemps === 'month'
          ? date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
          : date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })

      return {
        date: key,
        periode: date.toISOString().slice(0, 10),
        embauches: 0,
        departs: 0,
        effectif: 0,
        engagement: 0,
        salaireMoyenUSD: 0,
        salaireMoyenCDF: 0,
      }
    })

    // Calculer l'effectif initial (avant la période)
    let effectifInitial = agents.filter((agent) => {
      if (!agent.dateDebutContrat) return false
      const dateEmbauche = new Date(agent.dateDebutContrat)
      return dateEmbauche < dateDebut && (!agent.dateFinContrat || new Date(agent.dateFinContrat) >= dateDebut)
    }).length

    // Remplir les données
    chartData.forEach((point, index) => {
      const dateCourante = new Date(intervals[index])

      // Agents actifs à cette date
      const agentsActifs = agents.filter((agent) => {
        if (!agent.dateDebutContrat) return false
        const debut = new Date(agent.dateDebutContrat)
        const fin = agent.dateFinContrat ? new Date(agent.dateFinContrat) : null

        return debut <= dateCourante && (!fin || fin >= dateCourante)
      })

      // Embauches ce jour/mois
      const embauches = agents.filter((agent) => {
        if (!agent.dateDebutContrat) return false
        const debut = new Date(agent.dateDebutContrat)
        if (pasTemps === 'day') {
          return debut.toDateString() === dateCourante.toDateString()
        } else {
          return debut.getMonth() === dateCourante.getMonth() && debut.getFullYear() === dateCourante.getFullYear()
        }
      }).length

      // Départs ce jour/mois
      const departs = agents.filter((agent) => {
        if (!agent.dateFinContrat) return false
        const fin = new Date(agent.dateFinContrat)
        if (pasTemps === 'day') {
          return fin.toDateString() === dateCourante.toDateString()
        } else {
          return fin.getMonth() === dateCourante.getMonth() && fin.getFullYear() === dateCourante.getFullYear()
        }
      }).length

      // Calculer l'effectif
      const effectif =
        index === 0 ? effectifInitial + embauches - departs : chartData[index - 1].effectif + embauches - departs

      // Calculer le score d'engagement
      const agentsStables = agentsActifs.filter((a) => a.anne_experience > 1).length
      const engagement = agentsActifs.length > 0 ? (agentsStables / agentsActifs.length) * 100 : 0

      // Salaire moyen
      const salaires = agentsActifs.map((agent) => convertirSalaire(agent.saleaire))
      const salaireMoyenUSD = salaires.length > 0 ? salaires.reduce((sum, s) => sum + s.usd, 0) / salaires.length : 0
      const salaireMoyenCDF = salaires.length > 0 ? salaires.reduce((sum, s) => sum + s.cdf, 0) / salaires.length : 0

      Object.assign(point, {
        embauches,
        departs,
        effectif,
        engagement: Math.round(engagement),
        salaireMoyenUSD: Math.round(salaireMoyenUSD),
        salaireMoyenCDF: Math.round(salaireMoyenCDF),
      })
    })

    return chartData
  }

  const calculateStatistics = (agents: Agent[], departements: Departement[], domaines: Domaine[]) => {
    const totalAgents = agents.length
    const totalHommes = agents.filter((agent) => agent.genre === 'M').length
    const totalFemmes = agents.filter((agent) => agent.genre === 'F').length

    const totalDepartements = departements.length
    const totalDomaines = domaines.length

    // Calcul des salaires moyens
    const salaires = agents.map((agent) => convertirSalaire(agent.saleaire))
    const salaireMoyenUSD = salaires.length > 0 ? salaires.reduce((sum, s) => sum + s.usd, 0) / salaires.length : 0
    const salaireMoyenCDF = salaires.length > 0 ? salaires.reduce((sum, s) => sum + s.cdf, 0) / salaires.length : 0

    // Calcul des types de contrat
    const contratsCDI = agents.filter((agent) => agent.typeContrat === 'cdi').length
    const contratsCDD = agents.filter((agent) => agent.typeContrat === 'cdd').length

    // Expérience moyenne
    const experienceMoyenne =
      agents.length > 0 ? agents.reduce((sum, agent) => sum + (agent.anne_experience || 0), 0) / agents.length : 0

    // Taux d'occupation basé sur les départements
    const tauxOccupation = totalDepartements > 0 ? (totalAgents / (totalDepartements * 8)) * 100 : 0

    // Embauches et départs du mois en cours
    const maintenant = new Date()
    const moisEnCours = maintenant.toISOString().slice(0, 7)
    const embauchesMois = agents.filter(
      (agent) => agent.dateDebutContrat && agent.dateDebutContrat.startsWith(moisEnCours)
    ).length

    const departsMois = agents.filter(
      (agent) => agent.dateFinContrat && agent.dateFinContrat.startsWith(moisEnCours)
    ).length

    // Taux de rotation (basé sur les 12 derniers mois)
    const dateDebutAnnee = new Date(maintenant.getFullYear() - 1, maintenant.getMonth(), 1)
    const embauchesAnnee = agents.filter(
      (agent) => agent.dateDebutContrat && new Date(agent.dateDebutContrat) >= dateDebutAnnee
    ).length
    const departsAnnee = agents.filter(
      (agent) => agent.dateFinContrat && new Date(agent.dateFinContrat) >= dateDebutAnnee
    ).length

    const effectifMoyen = totalAgents
    const tauxRotation = effectifMoyen > 0 ? ((embauchesAnnee + departsAnnee) / 2 / effectifMoyen) * 100 : 0

    // Ratio hommes/femmes
    const ratioHommesFemmes = totalFemmes > 0 ? totalHommes / totalFemmes : totalHommes

    return {
      totalAgents,
      totalHommes,
      totalFemmes,
      totalDepartements,
      totalDomaines,
      tauxOccupation: Math.min(tauxOccupation, 100),
      salaireMoyenUSD: Math.round(salaireMoyenUSD),
      salaireMoyenCDF: Math.round(salaireMoyenCDF),
      contratsCDI,
      contratsCDD,
      experienceMoyenne: parseFloat(experienceMoyenne.toFixed(1)),
      embauchesMois,
      departsMois,
      tauxRotation: parseFloat(tauxRotation.toFixed(1)),
      ratioHommesFemmes: parseFloat(ratioHommesFemmes.toFixed(1)),
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [agentsData, departementsData, domainesData] = await Promise.all([
        getAgents(),
        getDepartements(),
        getDomaines(),
      ])

      setAgents(agentsData || [])
      setDepartements(departementsData || [])
      setDomaines(domainesData || [])

      // Calculer les statistiques
      const calculatedStats = calculateStatistics(agentsData || [], departementsData || [], domainesData || [])
      setStats(calculatedStats)
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Fonction pour détecter et appliquer le thème correct
    const detectAndApplyTheme = () => {
      const savedTheme = localStorage.getItem('theme') as Theme | null
      const root = document.documentElement

      if (savedTheme) {
        // Utiliser le thème sauvegardé
        if (savedTheme === 'dark') {
          root.classList.add('dark')
          root.classList.remove('light')
          setIsDark(true)
        } else if (savedTheme === 'light') {
          root.classList.add('light')
          root.classList.remove('dark')
          setIsDark(false)
        } else {
          // Mode système
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
          if (systemPrefersDark) {
            root.classList.add('dark')
            root.classList.remove('light')
            setIsDark(true)
          } else {
            root.classList.add('light')
            root.classList.remove('dark')
            setIsDark(false)
          }
        }
      } else {
        // Aucun thème sauvegardé, utiliser les préférences système
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemPrefersDark) {
          root.classList.add('dark')
          root.classList.remove('light')
          setIsDark(true)
        } else {
          root.classList.add('light')
          root.classList.remove('dark')
          setIsDark(false)
        }
      }
    }

    // Fonction pour détecter uniquement l'état dark/light actuel
    const detectCurrentTheme = () => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDark(isDark)
    }

    // Application initiale du thème
    detectAndApplyTheme()

    // Observer les changements de classe sur l'élément racine
    const observer = new MutationObserver(() => {
      detectCurrentTheme()
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleSystemThemeChange = () => {
      const currentTheme = localStorage.getItem('theme') as Theme | null

      // Si mode système ou aucun thème défini, appliquer les changements système
      if (currentTheme === 'system' || !currentTheme) {
        detectAndApplyTheme()
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])

  const chartData = generateChartData(agents, timeFilter, selectedYear)

  // Données pour le graphique de répartition par genre
  const dataGenre = [
    { name: 'Hommes', value: stats.totalHommes, color: '#3b82f6' },
    { name: 'Femmes', value: stats.totalFemmes, color: '#ec4899' },
  ]

  // Métriques RH basées sur les données réelles
  const metrics = [
    {
      title: 'Effectif Total',
      value: stats.totalAgents.toString(),
      change: `${stats.embauchesMois} emb. ce mois`,
      trend: stats.embauchesMois > stats.departsMois ? 'up' : 'down',
      description: {
        main: `${stats.totalHommes}H / ${stats.totalFemmes}F`,
        sub: `Répartis dans ${stats.totalDepartements} départements`,
      },
      color: 'text-blue-500',
      icon: Users,
    },

    {
      title: 'Taux Occupation',
      value: `${Math.round(stats.tauxOccupation)}%`,
      change: stats.tauxOccupation > 80 ? '+2.3%' : '-1.2%',
      trend: stats.tauxOccupation > 80 ? 'up' : 'down',
      description: { main: 'Occupation des postes', sub: 'Optimisation des ressources' },
      color: 'text-purple-500',
      icon: Percent,
    },
    {
      title: 'Expérience Moyenne',
      value: `${stats.experienceMoyenne} ans`,
      change: '+0.8 ans',
      trend: 'up',
      description: { main: 'Ancienneté moyenne', sub: 'Compétence globale' },
      color: 'text-indigo-500',
      icon: Activity,
    },
    {
      title: 'Stabilité RH',
      value: `${stats.tauxRotation}%`,
      change: `${stats.departsMois} départs`,
      trend: stats.tauxRotation < 10 ? 'up' : 'down',
      description: { main: 'Taux de rotation', sub: 'Mobilité du personnel' },
      color: stats.tauxRotation < 10 ? 'text-green-500' : 'text-red-500',
      icon: Target,
    },
  ]

  const chartConfig = {
    effectif: {
      label: 'Effectif total',
      color: 'hsl(221, 83%, 53%, 0.3)', // Bleu
    },
    embauches: {
      label: 'Nouvelles embauches',
      color: 'hsl(142, 76%, 36%)', // Vert
    },
    departs: {
      label: 'Départs',
      color: 'hsl(0, 84%, 60%)', // Rouge
    },
  } satisfies ChartConfig

  // Générer les années disponibles pour le filtre
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 6 }, (_, i) => currentYear - i)

  if (loading) {
    return (
      <div className="welcome-content bg-neutral-100 dark:bg-transparent flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <div className="text-lg text-gray-600 dark:text-gray-400">Chargement des données RH...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="welcome-content bg-neutral-50 dark:bg-transparent flex flex-col gap-6 mt-6 dark:text-gray-100 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
            <Users className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">Bienvenue sur {appConfig.appName}</span>
        </Button>
        <Button onClick={loadData} variant="outline" size="sm" className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser les données</span>
        </Button>
      </div>

      {/* Grid Métriques */}
      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-2">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </AnimatePresence>

      {/* Contrôles de période */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
            <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semaine">Cette semaine</SelectItem>
              <SelectItem value="mois">Ce mois</SelectItem>
              <SelectItem value="annee">Cette année</SelectItem>
              <SelectItem value="3_ans">3 dernières années</SelectItem>
              <SelectItem value="personnalise">Année spécifique</SelectItem>
            </SelectContent>
          </Select>

          {timeFilter === 'personnalise' && (
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-[180px] bg-white dark:bg-gray-800">
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
            <span>Effectif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"></div>
            <span>Embauches</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
            <span>Départs</span>
          </div>
        </div>
      </div>

      <ChartSelector
        data={chartData}
        title={`Évolution des Effectifs -${
          timeFilter === 'semaine'
            ? '7 derniers jours'
            : timeFilter === 'mois'
              ? 'Mois en cours'
              : timeFilter === 'annee'
                ? 'Année en cours'
                : timeFilter === '3_ans'
                  ? '3 dernières années'
                  : `Année ${selectedYear}`
        }`}
        description={'Analyse détaillée des mouvements de personnel sur la période sélectionnée'}
      />

      {/* Section Analyse Démographique */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par genre */}
        <div className="overflow-hidden bg-white dark:bg-neutral-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">Répartition par Genre</CardTitle>
            <CardDescription>Analyse démographique des effectifs</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="flex flex-col lg:flex-row items-center justify-between">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataGenre}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {dataGenre.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          stroke={isDark ? '#1f2937' : '#ffffff'}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${value} agents`, 'Effectif']}
                      contentStyle={{
                        backgroundColor: isDark ? '#1f2937' : '#ffffff',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4 flex-1 lg:ml-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center space-x-3">
                    <Mars className="h-6 w-6 text-blue-500" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">Hommes</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-blue-900 dark:text-blue-100">{stats.totalHommes}</div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {Math.round((stats.totalHommes / stats.totalAgents) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg border border-pink-200 dark:border-pink-800">
                  <div className="flex items-center space-x-3">
                    <Venus className="h-6 w-6 text-pink-500" />
                    <span className="font-medium text-pink-900 dark:text-pink-100">Femmes</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xl text-pink-900 dark:text-pink-100">{stats.totalFemmes}</div>
                    <div className="text-sm text-pink-700 dark:text-pink-300">
                      {Math.round((stats.totalFemmes / stats.totalAgents) * 100)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                  <div className="font-medium text-gray-900 dark:text-gray-100">Ratio H/F</div>
                  <div className="font-bold text-xl text-gray-900 dark:text-gray-100">
                    {stats.ratioHommesFemmes.toFixed(1)}:1
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </div>

        {/* Répartition par département */}
        <div className="overflow-hidden bg-white dark:bg-neutral-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">Répartition par Département</CardTitle>
            <CardDescription>Effectifs par structure organisationnelle</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
              {departements.map((dept) => {
                const agentsInDept = agents.filter((agent) => agent.departement?.id === dept.id).length
                const pourcentage = stats.totalAgents > 0 ? (agentsInDept / stats.totalAgents) * 100 : 0
                const hommes = agents.filter((a) => a.departement?.id === dept.id && a.genre === 'M').length
                const femmes = agents.filter((a) => a.departement?.id === dept.id && a.genre === 'F').length

                return (
                  <div
                    key={dept.id}
                    className="space-y-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{dept.nom}</span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {agentsInDept} agents ({Math.round(pourcentage)}%)
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pourcentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center space-x-1">
                        <Mars className="h-3 w-3 text-blue-500" />
                        <span>{hommes} hommes</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Venus className="h-3 w-3 text-pink-500" />
                        <span>{femmes} femmes</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </div>
      </div>

      {/* Analyse des Contrats et Expérience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="overflow-hidden bg-white dark:bg-neutral-950 p-6 rounded-xl border border-gray-200 dark:border-gray-800">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-lg font-semibold">Analyse des Contrats</CardTitle>
            <CardDescription>Répartition et stabilité de l'emploi</CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Contrats CDI</span>
                  <span className="text-sm font-bold text-green-600">
                    {stats.contratsCDI} ({Math.round((stats.contratsCDI / stats.totalAgents) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stats.contratsCDI / stats.totalAgents) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Contrats CDD</span>
                  <span className="text-sm font-bold text-yellow-600">
                    {stats.contratsCDD} ({Math.round((stats.contratsCDD / stats.totalAgents) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(stats.contratsCDD / stats.totalAgents) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-700 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg">
                  <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">Expérience moyenne</span>
                  <Badge
                    variant="outline"
                    className="text-lg font-bold text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-700"
                  >
                    {stats.experienceMoyenne} ans
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                  <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Mouvements ce mois</span>
                  <Badge
                    variant={stats.embauchesMois > stats.departsMois ? 'default' : 'destructive'}
                    className="text-sm"
                  >
                    ↗ {stats.embauchesMois} embauches / ↘ {stats.departsMois} départs
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">Taux de rotation</span>
                  <Badge variant={stats.tauxRotation < 10 ? 'default' : 'destructive'} className="text-sm">
                    {stats.tauxRotation}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  )
}
