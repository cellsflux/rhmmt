'use client'

import type React from 'react'
import { type JSX, useEffect, useMemo, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/app/components/ui/dropdown-menu'
import { Button } from '@/app/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/table'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import {
  Loader2,
  Trash2,
  Download,
  Upload,
  Plus,
  FileSpreadsheet,
  FileCode,
  Users,
  AlertCircle,
  Clock,
  TrendingUp,
  Search,
  Filter,
  Edit,
  File,
} from 'lucide-react'
import { AddAgentForm } from '@/app/components/AddAgentForm'
import { ImportModal } from '@/app/components/agents/ImportModale'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useConveyor } from '../hooks/use-conveyor'
import { Input } from '@/app/components/ui/input'
import { Badge } from '@/app/components/ui/badge'
import { AlertModal } from '@/app/components/ui/alert-modal'
import appConfig from '../constants/App'
import { DemissionModal } from '../components/agents/DemissionModal'

// ===== Interfaces =====
interface Adresse {
  ville?: string
  commune?: string
  quartier?: string
  avenue?: string
  numero?: string
}

interface PersonneUrgence {
  nom: string
  prenom?: string
  telephone: string
  relationShip: string
}

interface PieceIdentite {
  carteType: 'cartedelecteur' | 'pasport' | 'autre'
  numero: string
  nomdedelacarte?: string
}

interface Habillement {
  booteTaille?: string
  tshartTaille?: string
}

interface Banque {
  nom?: string
  numeroCompte?: string
}

interface Salaire {
  montant: number
  type: 'jouranlier' | 'mensuelle' | 'trimestrielle' | 'annuelle'
}

interface Poste {
  id?: number
  name?: string
}

interface Departement {
  id?: number
  name?: string
}

export interface Agent {
  id?: number
  matricule?: string
  nom: string
  postnom: string
  prenom: string
  genre: string
  email?: string
  telephone: string
  devise?: 'CDF' | 'USD'
  habillement?: Habillement
  banque?: Banque
  brithday?: string
  brithplace?: string
  adresse?: Adresse
  pere?: string
  mere?: string
  personneUrgence?: PersonneUrgence
  etatcivil: 'marie' | 'celibataire' | 'divorcee' | 'veuf'
  nationalite: string
  carteIdentite?: PieceIdentite[]
  nomduconjoint?: string
  nombre_enfants?: number
  enfants?: { nom: string; postnom: string; prenom: string; brithday: string; brithplace: string; gendre: 'M' | 'F' }[]
  typeContrat?: 'cdd' | 'cdi' | 'durrere'
  dateDebutContrat?: string
  dateFinContrat?: string
  poste_ocuper?: Poste
  periode_essai: string
  saleaire?: Salaire
  departement: Departement
  nuvieau_etudes: 'diplome' | 'gradue' | 'brevet' | 'licence' | 'autre'
  anne_experience: number
  cncss?: string
  nif?: string
  image?: string
  signature?: string
  cardIdentiteImage?: string
}

// ===== Système de détection de doublons intelligent =====
class IntelligentDuplicateDetector {
  private static readonly SIMILARITY_THRESHOLD = 0.8
  private static readonly HIGH_CONFIDENCE_THRESHOLD = 0.9
  private static readonly MEDIUM_CONFIDENCE_THRESHOLD = 0.7

  // Nettoyage et normalisation des textes
  private static normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]/g, '') // Garde seulement lettres et chiffres
      .trim()
  }

  // Calcul de similarité entre deux chaînes
  private static calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0

    const s1 = this.normalizeText(str1)
    const s2 = this.normalizeText(str2)

    if (s1 === s2) return 1.0

    const minLength = Math.min(s1.length, s2.length)
    const maxLength = Math.max(s1.length, s2.length)

    let matches = 0
    const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1

    const s1Matches: boolean[] = new Array(s1.length).fill(false)
    const s2Matches: boolean[] = new Array(s2.length).fill(false)

    // Compter les matches
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - matchDistance)
      const end = Math.min(i + matchDistance + 1, s2.length)

      for (let j = start; j < end; j++) {
        if (!s2Matches[j] && s1[i] === s2[j]) {
          s1Matches[i] = true
          s2Matches[j] = true
          matches++
          break
        }
      }
    }

    if (matches === 0) return 0

    // Calcul de la similarité Jaro
    const jaroSimilarity = (matches / s1.length + matches / s2.length + matches / matches) / 3

    // Facteur de préfixe commun
    let prefix = 0
    const prefixLimit = Math.min(4, s1.length, s2.length)
    for (let i = 0; i < prefixLimit; i++) {
      if (s1[i] === s2[i]) prefix++
      else break
    }

    // Similarité Jaro-Winkler
    return jaroSimilarity + prefix * 0.1 * (1 - jaroSimilarity)
  }

  // Comparaison des noms avec intelligence
  private static compareNames(nom1: string, nom2: string, prenom1: string, prenom2: string): number {
    const nomSimilarity = this.calculateSimilarity(nom1, nom2)
    const prenomSimilarity = this.calculateSimilarity(prenom1, prenom2)

    // Les noms sont plus importants que les prénoms
    return nomSimilarity * 0.7 + prenomSimilarity * 0.3
  }

  // Comparaison des coordonnées
  private static compareContact(agent1: Agent, agent2: Agent): number {
    let score = 0
    let factors = 0

    // Email
    if (agent1.email && agent2.email) {
      score += this.calculateSimilarity(agent1.email, agent2.email)
      factors++
    }

    // Téléphone (normalisation)
    const phone1 = agent1.telephone?.replace(/\D/g, '')
    const phone2 = agent2.telephone?.replace(/\D/g, '')
    if (phone1 && phone2) {
      // Comparaison des derniers chiffres (plus significatifs)
      const shorter = phone1.length <= phone2.length ? phone1 : phone2
      const longer = phone1.length <= phone2.length ? phone2 : phone1

      if (longer.endsWith(shorter) && shorter.length >= 6) {
        score += 0.9
      } else {
        score += this.calculateSimilarity(phone1, phone2)
      }
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  // Comparaison des informations professionnelles
  private static compareProfessional(agent1: Agent, agent2: Agent): number {
    let score = 0
    let factors = 0

    // Matricule
    if (agent1.matricule && agent2.matricule) {
      score += this.calculateSimilarity(agent1.matricule, agent2.matricule)
      factors++
    }

    // Poste
    if (agent1.poste_ocuper?.name && agent2.poste_ocuper?.name) {
      score += this.calculateSimilarity(agent1.poste_ocuper.name, agent2.poste_ocuper.name)
      factors++
    }

    // Département
    if (agent1.departement?.name && agent2.departement?.name) {
      score += this.calculateSimilarity(agent1.departement.name, agent2.departement.name)
      factors++
    }

    return factors > 0 ? score / factors : 0
  }

  // Détection principale de doublons
  public static detectDuplicate(
    newAgent: Agent,
    existingAgents: Agent[]
  ): {
    isDuplicate: boolean
    score: number
    reason: string
    existingAgent?: Agent
  } {
    let bestMatch: { score: number; reason: string; agent?: Agent } = {
      score: 0,
      reason: '',
      agent: undefined,
    }

    for (const existingAgent of existingAgents) {
      let totalScore = 0
      let weightSum = 0
      const reasons: string[] = []

      // 1. Identité (Poids fort - 40%)
      const identityScore = this.compareNames(newAgent.nom, existingAgent.nom, newAgent.prenom, existingAgent.prenom)
      if (identityScore > this.MEDIUM_CONFIDENCE_THRESHOLD) {
        totalScore += identityScore * 0.4
        weightSum += 0.4
        reasons.push(`Identité similaire (${Math.round(identityScore * 100)}%)`)
      }

      // 2. Contact (Poids moyen - 25%)
      const contactScore = this.compareContact(newAgent, existingAgent)
      if (contactScore > this.MEDIUM_CONFIDENCE_THRESHOLD) {
        totalScore += contactScore * 0.25
        weightSum += 0.25
        reasons.push(`Contact similaire (${Math.round(contactScore * 100)}%)`)
      }

      // 3. Professionnel (Poids moyen - 20%)
      const professionalScore = this.compareProfessional(newAgent, existingAgent)
      if (professionalScore > this.MEDIUM_CONFIDENCE_THRESHOLD) {
        totalScore += professionalScore * 0.2
        weightSum += 0.2
        reasons.push(`Info pro similaire (${Math.round(professionalScore * 100)}%)`)
      }

      // Score final pondéré
      const finalScore = weightSum > 0 ? totalScore / weightSum : 0

      if (finalScore > bestMatch.score) {
        bestMatch = {
          score: finalScore,
          reason: reasons.join(', '),
          agent: existingAgent,
        }
      }
    }

    return {
      isDuplicate: bestMatch.score >= this.SIMILARITY_THRESHOLD,
      score: bestMatch.score,
      reason: bestMatch.reason,
      existingAgent: bestMatch.agent,
    }
  }
}

// ===== Helpers =====
const formatCurrency = (amount?: number, devise?: string) => {
  if (typeof amount !== 'number') return '-'
  return `${amount.toLocaleString()} ${devise ?? ''}`
}

// Fonction pour convertir tous les salaires en montant journalier pour une comparaison équitable
const convertToDaily = (salary: Salaire): number => {
  const { montant, type } = salary

  switch (type) {
    case 'jouranlier':
      return montant
    case 'mensuelle':
      return montant / 26 // 26 jours ouvrables par mois
    case 'trimestrielle':
      return montant / (26 * 3) // 3 mois * 26 jours
    case 'annuelle':
      return montant / (26 * 12) // 12 mois * 26 jours
    default:
      return montant / 26 // Par défaut, considérer comme mensuel
  }
}

// Fonction pour calculer la moyenne journalière puis la convertir selon le type souhaité
const calculateAverageSalary = (agents: Agent[], targetType: 'jouranlier' | 'mensuelle' = 'mensuelle'): number => {
  const validSalaries = agents
    .filter((agent) => agent.saleaire?.montant && agent.saleaire.montant > 0)
    .map((agent) => convertToDaily(agent.saleaire!))

  if (validSalaries.length === 0) return 0

  const avgDaily = validSalaries.reduce((sum, daily) => sum + daily, 0) / validSalaries.length

  // Convertir vers le type souhaité
  switch (targetType) {
    case 'jouranlier':
      return Math.round(avgDaily)
    case 'mensuelle':
      return Math.round(avgDaily * 26)
    default:
      return Math.round(avgDaily * 26)
  }
}

const getContractStatus = (agent: Agent) => {
  const now = new Date()

  // Si c'est un CDI sans date de fin, le contrat est toujours actif
  if (agent.typeContrat === 'cdi' && !agent.dateFinContrat) {
    return { status: 'En cours', isActive: true, type: 'CDI', daysUntil: null }
  }

  // Si pas de date de fin, considérer comme actif
  if (!agent.dateFinContrat) {
    return { status: 'En cours', isActive: true, type: agent.typeContrat || 'Non spécifié', daysUntil: null }
  }

  const endDate = new Date(agent.dateFinContrat)
  const isActive = endDate > now
  const daysUntilEnd = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (isActive) {
    return {
      status: daysUntilEnd <= 30 ? `Expire dans ${daysUntilEnd}j` : 'En cours',
      isActive: true,
      type: agent.typeContrat || 'Non spécifié',
      daysUntil: daysUntilEnd,
    }
  } else {
    return {
      status: 'Expiré',
      isActive: false,
      type: agent.typeContrat || 'Non spécifié',
      daysUntil: -Math.abs(daysUntilEnd),
    }
  }
}

// Fonction pour filtrer et ne garder que les propriétés de l'interface Agent (sans les propriétés d'import)
const filterAgentData = (data: any): Partial<Agent> => {
  const filtered: Partial<Agent> = {}

  // Propriétés de base
  if (data.id !== undefined) filtered.id = data.id
  if (data.matricule !== undefined) filtered.matricule = data.matricule
  if (data.nom !== undefined) filtered.nom = data.nom
  if (data.postnom !== undefined) filtered.postnom = data.postnom
  if (data.prenom !== undefined) filtered.prenom = data.prenom
  if (data.genre !== undefined) filtered.genre = data.genre
  if (data.email !== undefined) filtered.email = data.email
  if (data.telephone !== undefined) filtered.telephone = data.telephone
  if (data.devise !== undefined) filtered.devise = data.devise
  if (data.brithday !== undefined) filtered.brithday = data.brithday
  if (data.brithplace !== undefined) filtered.brithplace = data.brithplace
  if (data.pere !== undefined) filtered.pere = data.pere
  if (data.mere !== undefined) filtered.mere = data.mere
  if (data.etatcivil !== undefined) filtered.etatcivil = data.etatcivil
  if (data.nationalite !== undefined) filtered.nationalite = data.nationalite
  if (data.nomduconjoint !== undefined) filtered.nomduconjoint = data.nomduconjoint
  if (data.nombre_enfants !== undefined) filtered.nombre_enfants = data.nombre_enfants
  if (data.typeContrat !== undefined) filtered.typeContrat = data.typeContrat
  if (data.dateDebutContrat !== undefined) filtered.dateDebutContrat = data.dateDebutContrat
  if (data.dateFinContrat !== undefined) filtered.dateFinContrat = data.dateFinContrat
  if (data.periode_essai !== undefined) filtered.periode_essai = data.periode_essai
  if (data.nuvieau_etudes !== undefined) filtered.nuvieau_etudes = data.nuvieau_etudes
  if (data.anne_experience !== undefined) filtered.anne_experience = data.anne_experience
  if (data.cncss !== undefined) filtered.cncss = data.cncss
  if (data.nif !== undefined) filtered.nif = data.nif
  if (data.image !== undefined) filtered.image = data.image
  if (data.signature !== undefined) filtered.signature = data.signature
  if (data.cardIdentiteImage !== undefined) filtered.cardIdentiteImage = data.cardIdentiteImage

  // Objets imbriqués
  if (data.habillement && typeof data.habillement === 'object') {
    filtered.habillement = {
      booteTaille: data.habillement.booteTaille,
      tshartTaille: data.habillement.tshartTaille,
    }
  }

  if (data.banque && typeof data.banque === 'object') {
    filtered.banque = {
      nom: data.banque.nom,
      numeroCompte: data.banque.numeroCompte,
    }
  }

  if (data.adresse && typeof data.adresse === 'object') {
    filtered.adresse = {
      ville: data.adresse.ville,
      commune: data.adresse.commune,
      quartier: data.adresse.quartier,
      avenue: data.adresse.avenue,
      numero: data.adresse.numero,
    }
  }

  if (data.personneUrgence && typeof data.personneUrgence === 'object') {
    filtered.personneUrgence = {
      nom: data.personneUrgence.nom,
      prenom: data.personneUrgence.prenom,
      telephone: data.personneUrgence.telephone,
      relationShip: data.personneUrgence.relationShip,
    }
  }

  if (data.carteIdentite && Array.isArray(data.carteIdentite)) {
    filtered.carteIdentite = data.carteIdentite
      .filter((item: any) => item && item.carteType && item.numero)
      .map((item: any) => ({
        carteType: item.carteType,
        numero: item.numero,
        nomdedelacarte: item.nomdedelacarte,
      }))
  }

  if (data.enfants && Array.isArray(data.enfants)) {
    filtered.enfants = data.enfants
      .filter((enfant: any) => enfant && enfant.nom && enfant.prenom)
      .map((enfant: any) => ({
        nom: enfant.nom,
        postnom: enfant.postnom,
        prenom: enfant.prenom,
        brithday: enfant.brithday,
        brithplace: enfant.brithplace,
        gendre: enfant.gendre,
      }))
  }

  if (data.poste_ocuper && typeof data.poste_ocuper === 'object') {
    filtered.poste_ocuper = {
      id: data.poste_ocuper.id,
      name: data.poste_ocuper.name,
    }
  }

  if (data.departement && typeof data.departement === 'object') {
    filtered.departement = {
      id: data.departement.id,
      name: data.departement.name,
    }
  }

  if (data.saleaire && typeof data.saleaire === 'object') {
    filtered.saleaire = {
      montant: data.saleaire.montant,
      type: data.saleaire.type,
    }
  }

  return filtered
}

// Fonction pour compléter les données d'agent avec des valeurs par défaut
const completeAgentData = (agentData: any): Agent => {
  // Filtrer d'abord les données
  const filteredData = filterAgentData(agentData)

  const defaults: Partial<Agent> = {
    matricule: filteredData.matricule || ``,
    nom: filteredData.nom || '',
    postnom: filteredData.postnom || '',
    prenom: filteredData.prenom || '',
    genre: filteredData.genre || 'Masculin',
    email: filteredData.email || '',
    telephone: filteredData.telephone || '',
    devise: filteredData.devise || 'CDF',
    etatcivil: filteredData.etatcivil || 'celibataire',
    nationalite: filteredData.nationalite || 'Congolaise',
    enfants: filteredData.enfants || [],
    nombre_enfants: filteredData.nombre_enfants || 0,
    typeContrat: filteredData.typeContrat || 'cdd',
    periode_essai: filteredData.periode_essai || '3 mois',
    nuvieau_etudes: filteredData.nuvieau_etudes || 'autre',
    anne_experience: filteredData.anne_experience || 0,
    departement: filteredData.departement || { name: 'Non spécifié' },
    // Propriétés optionnelles avec valeurs par défaut
    habillement: filteredData.habillement || {},
    banque: filteredData.banque || {},
    adresse: filteredData.adresse || {},
    personneUrgence: filteredData.personneUrgence,
    carteIdentite: filteredData.carteIdentite || [],
    poste_ocuper: filteredData.poste_ocuper || {},
    saleaire: filteredData.saleaire,
  }

  return {
    ...defaults,
    ...filteredData,
  } as Agent
}

// Fonction pour migrer les données existantes de 'enefants' vers 'enfants'
const migrateAgentData = (agent: any): Agent => {
  if (agent.enefants && !agent.enfants) {
    agent.enfants = agent.enefants
    delete agent.enefants
  }
  return filterAgentData(agent) as Agent
}

// ===== Stats Panel Amélioré =====
function StatsPanel({ data }: { data: Agent[] }) {
  const total = data.length
  const activeContracts = data.filter((agent) => getContractStatus(agent).isActive).length
  const expiredContracts = data.filter((agent) => !getContractStatus(agent).isActive).length
  const cdiContracts = data.filter((agent) => agent.typeContrat === 'cdi').length
  const cddContracts = data.filter((agent) => agent.typeContrat === 'cdd').length

  // Calcul des salaires moyens par devise avec la nouvelle méthode
  const agentsCDF = data.filter((agent) => agent.devise === 'CDF' && agent.saleaire?.montant)
  const agentsUSD = data.filter((agent) => agent.devise === 'USD' && agent.saleaire?.montant)

  const avgSalaryCDF = calculateAverageSalary(agentsCDF, 'mensuelle')
  const avgSalaryUSD = calculateAverageSalary(agentsUSD, 'mensuelle')

  // Calcul du salaire journalier moyen pour information
  const avgDailyCDF = calculateAverageSalary(agentsCDF, 'jouranlier')
  const avgDailyUSD = calculateAverageSalary(agentsUSD, 'jouranlier')

  const statCards = [
    {
      title: 'Contrats en cours',
      value: `${activeContracts} / ${total}`,
      icon: Users,
      description: `${Math.round((activeContracts / total) * 100) || 0}% actifs`,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Contrats expirés',
      value: `${expiredContracts}`,
      icon: AlertCircle,
      description: 'À renouveler',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'CDI / CDD',
      value: `${cdiContracts} / ${cddContracts}`,
      icon: TrendingUp,
      description: 'Types de contrat',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Moyenne CDF',
      value: formatCurrency(avgSalaryCDF, 'CDF'),
      icon: Clock,
      description: `${agentsCDF.length} agents - ${formatCurrency(avgDailyCDF, 'CDF')}/jour`,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: 'Moyenne USD',
      value: formatCurrency(avgSalaryUSD, 'USD'),
      icon: Clock,
      description: `${agentsUSD.length} agents - ${formatCurrency(avgDailyUSD, 'USD')}/jour`,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className={`${stat.bgColor} border border-neutral-200 dark:border-neutral-700 rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">{stat.title}</span>
              </div>
            </div>
            <div className="mb-1">
              <span className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</span>
            </div>
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{stat.description}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ===== Colonnes Table =====
const createColumns = (data: Agent[], navigate: any, onEdit: (agent: Agent) => void) => [
  {
    id: 'select',
    header: ({ table }: any) => (
      <input
        type="checkbox"
        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
        checked={table.getIsAllPageRowsSelected?.()}
        onChange={(e) => table.toggleAllPageRowsSelected?.(e.target.checked)}
      />
    ),
    cell: ({ row }: any) => (
      <input
        type="checkbox"
        className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-neutral-600 dark:bg-neutral-800"
        checked={row.getIsSelected?.()}
        onChange={(e) => row.toggleSelected?.(e.target.checked)}
      />
    ),
  },
  {
    accessorFn: (row: Agent) => `${row.nom} ${row.postnom} ${row.prenom}`,
    id: 'fullname',
    header: 'Nom complet',
    cell: ({ getValue, row }: any) => (
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate('/agentDetails?id=' + row.original.id)}
      >
        <div className="w-8 h-8 bg-neutral-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
          <Avatar>
            <AvatarImage src={row.original.image || '/placeholder.svg'} />
            <AvatarFallback className="text-neutral-900 dark:text-neutral-100">
              {(row.original.nom?.charAt(0) ?? '-') + (row.original.prenom?.charAt(0) ?? '-')}
            </AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">{getValue()}</div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">{row.original.matricule}</div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'nuvieau_etudes',
    header: 'Niveau',
    cell: ({ getValue, row }: any) => (
      <span
        onClick={() => navigate('/agentDetails?id=' + row.original.id)}
        className="text-neutral-900 dark:text-neutral-100 cursor-pointer"
      >
        {getValue()}
      </span>
    ),
  },
  {
    accessorKey: 'departement.name',
    header: 'Departement',
    cell: ({ getValue, row }: any) => (
      <span
        onClick={() => navigate('/agentDetails?id=' + row.original.id)}
        className="text-neutral-900 dark:text-neutral-100 cursor-pointer"
      >
        {getValue() || '-'}
      </span>
    ),
  },
  {
    accessorFn: (row: Agent) => row.typeContrat,
    id: 'typeContrat',
    header: 'Type Contrat',
    cell: ({ getValue, row }: any) => {
      const type = getValue()
      return (
        <span
          onClick={() => navigate('/agentDetails?id=' + row.original.id)}
          className="uppercase text-neutral-900 dark:text-neutral-100 cursor-pointer"
        >
          {type || '-'}
        </span>
      )
    },
  },
  {
    id: 'status',
    header: 'Statut contrat',
    cell: ({ row }: any) => {
      const statusInfo = getContractStatus(row.original)

      let statusColor = ''
      let bgColor = ''

      if (statusInfo.status === 'Expiré') {
        statusColor = 'text-red-600 dark:text-red-400'
        bgColor = 'bg-red-500'
      } else if (statusInfo.status.includes('Expire dans')) {
        statusColor = 'text-orange-600 dark:text-orange-400'
        bgColor = 'bg-orange-500'
      } else {
        statusColor = 'text-green-600 dark:text-green-400'
        bgColor = 'bg-green-500'
      }

      return (
        <div
          onClick={() => navigate('/agentDetails?id=' + row.original.id)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className={`w-2 h-2 rounded-full ${bgColor}`}></div>
          <span className={`${statusColor} text-sm font-medium`}>{statusInfo.status}</span>
        </div>
      )
    },
  },
  {
    accessorFn: (row: Agent) => row.dateDebutContrat,
    id: 'dateDebut',
    header: 'Date début contrat',
    cell: ({ getValue, row }: any) => {
      const date = getValue()
      if (!date)
        return (
          <span
            onClick={() => navigate('/agentDetails?id=' + row.original.id)}
            className="text-neutral-400 dark:text-neutral-500 cursor-pointer"
          >
            - -
          </span>
        )
      return (
        <span
          onClick={() => navigate('/agentDetails?id=' + row.original.id)}
          className="text-neutral-900 dark:text-neutral-100 cursor-pointer"
        >
          {new Date(date).toLocaleDateString('fr-FR')}
        </span>
      )
    },
  },
  {
    accessorFn: (row: Agent) => row.dateFinContrat,
    id: 'dateFin',
    header: 'Date fin contrat',
    cell: ({ getValue, row }: any) => {
      const date = getValue()
      if (!date)
        return (
          <span
            onClick={() => navigate('/agentDetails?id=' + row.original.id)}
            className="text-neutral-400 dark:text-neutral-500 cursor-pointer"
          >
            - -
          </span>
        )
      return (
        <span
          onClick={() => navigate('/agentDetails?id=' + row.original.id)}
          className="text-neutral-900 dark:text-neutral-100 cursor-pointer"
        >
          {new Date(date).toLocaleDateString('fr-FR')}
        </span>
      )
    },
  },
  {
    accessorKey: 'telephone',
    header: 'Téléphone',
    cell: ({ getValue, row }: any) => (
      <span
        onClick={() => navigate('/agentDetails?id=' + row.original.id)}
        className="text-neutral-900 dark:text-neutral-100 cursor-pointer"
      >
        {getValue()}
      </span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }: any) => (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(row.original)
          }}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
]

// ===== Composant principal =====
export default function AgenScreen(): JSX.Element {
  const [data, setData] = useState<Agent[]>([])
  const [sorting, setSorting] = useState<any[]>([])
  const [columnFilters, setColumnFilters] = useState<any[]>([])
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [openAddAgentForm, setOpenAddAgentForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showDeleteButton, setShowDeleteButton] = useState(false)

  const [demissionModalOpen, setDemissionModalOpen] = useState(false)

  // États pour l'édition
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    description: '',
    type: 'warning' as const,
    onConfirm: () => {},
  })

  const { getAgents, addAgent, addAgents, deleteAgent, updateAgent } = useConveyor('app')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const loadAgents = async () => {
    try {
      setLoading(true)
      const agents = await getAgents()

      // Migrer les données si nécessaire
      const migratedAgents = (agents || []).map(migrateAgentData)
      setData(migratedAgents)
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error)
      setData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAgents()
  }, [])

  // Gestion de l'affichage du bouton supprimer
  useEffect(() => {
    setShowDeleteButton(Object.keys(rowSelection).length > 0)
  }, [rowSelection])

  // Fonction pour éditer un agent
  const handleEditAgent = (agent: Agent) => {
    setEditingAgent(agent)
    setIsEditing(true)
    setOpenAddAgentForm(true)
  }

  const columns = useMemo(() => createColumns(data, navigate, handleEditAgent), [data, navigate])

  useEffect(() => {
    const openerForm = searchParams.get('OpnerForm')
    if (openerForm) {
      setOpenAddAgentForm(true)
    }
    const openDemission = searchParams.get('demission')
    if (openDemission) {
      setDemissionModalOpen(true)
    }
  }, [searchParams])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
  })

  // ===== Gestion des agents =====
  const handleAddAgent = async (agentData: Omit<Agent, 'id'>) => {
    try {
      // Filtrer les données pour ne garder que celles de l'interface Agent
      const filteredData = filterAgentData(agentData)
      const completedAgentData = completeAgentData(filteredData)
      const newAgent = await addAgent(completedAgentData)
      setData((prev) => [...prev, newAgent])
      return newAgent
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'agent:", error)
      throw error
    }
  }

  const handleUpdateAgent = async (agentData: Agent) => {
    try {
      if (!agentData.id) {
        throw new Error("ID de l'agent manquant pour la mise à jour")
      }

      // Filtrer les données pour ne garder que celles de l'interface Agent
      const filteredData = filterAgentData(agentData)
      const completedAgentData = completeAgentData({
        ...filteredData,
        id: agentData.id,
      })

      const updatedAgent = await updateAgent(completedAgentData)

      // Mettre à jour la liste locale
      setData((prev) => prev.map((agent) => (agent.id === agentData.id ? updatedAgent : agent)))

      return updatedAgent
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'agent:", error)
      throw error
    }
  }

  const handleDeleteAgents = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((id) => data[Number.parseInt(id)]?.id)
      .filter((id) => id !== undefined) as number[]

    if (selectedIds.length === 0) return

    setAlertModal({
      open: true,
      title: 'Confirmer la suppression',
      description: `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} agent(s) ? Cette action est irréversible.`,
      type: 'error',
      onConfirm: async () => {
        try {
          // Supprimer chaque agent sélectionné
          for (const id of selectedIds) {
            await deleteAgent(id)
          }

          // Recharger la liste des agents
          await loadAgents()

          // Réinitialiser la sélection
          setRowSelection({})
        } catch (error) {
          console.error('Erreur lors de la suppression des agents:', error)
          setAlertModal({
            open: true,
            title: 'Erreur',
            description: 'Erreur lors de la suppression des agents',
            type: 'error',
            onConfirm: () => {},
          })
        }
      },
    })
  }

  // Fonction pour fermer le formulaire
  const handleCloseForm = () => {
    setIsEditing(false)
    setEditingAgent(null)
    setOpenAddAgentForm(false)

    if (searchParams.get('OpnerForm')) {
      navigate('/agents', { replace: true })
    }
  }

  const selectedAgents = table.getSelectedRowModel().rows.map((row) => row.original)
  const filteredAgents = table.getFilteredRowModel().rows.map((row) => row.original)
  const selectedCount = selectedAgents.length
  const totalCount = filteredAgents.length
  const isAllSelected = selectedCount === totalCount && totalCount > 0

  // ===== Exports =====
  const handleExport = (type: 'era' | 'xlsx') => {
    const dataToExport = isAllSelected ? data : selectedAgents
    if (type == 'xlsx') {
      const rows = dataToExport.map((a) => {
        const statusInfo = getContractStatus(a)
        return {
          Matricule: a.matricule,
          Nom: a.nom,
          Postnom: a.postnom,
          Prenom: a.prenom,
          Genre: a.genre,
          Email: a.email,
          Telephone: a.telephone,
          EtatCivil: a.etatcivil,
          Niveau: a.nuvieau_etudes,
          Salaire: `${a.saleaire?.montant ?? '-'} ${a.devise ?? ''}`,
          Departement: a.departement?.name,
          Poste: a.poste_ocuper?.name,
          TypeContrat: a.typeContrat,
          StatutContrat: statusInfo.status,
          DateDebut: a.dateDebutContrat,
          DateFin: a.dateFinContrat,
        }
      })
      const ws = XLSX.utils.json_to_sheet(rows)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Agents')
      XLSX.writeFile(wb, 'agents_export.xlsx')
      return
    }
    const era = {
      createdAt: new Date().toISOString(),
      auteur: 'system_user',
      data_type: 'agents_datas',
      datas: dataToExport.map((agent) => filterAgentData(agent)), // Filtrer les données pour l'export
    }
    saveAs(
      new Blob([JSON.stringify(era, null, 2)], { type: 'application/json' }),
      `agents_export_${new Date().toISOString()}.era`
    )
  }

  // ===== Import avec détection intelligente des doublons =====
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.era')) {
      setAlertModal({
        open: true,
        title: 'Format de fichier non supporté',
        description: "Seuls les fichiers .era sont acceptés pour l'importation.",
        type: 'error',
        onConfirm: () => {},
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result
        const parsed = JSON.parse(String(content))

        if (!parsed.data_type || parsed.data_type !== 'agents_datas' || !Array.isArray(parsed.datas)) {
          setAlertModal({
            open: true,
            title: 'Structure de fichier invalide',
            description: "Le fichier ERA ne contient pas la structure attendue pour les données d'agents.",
            type: 'error',
            onConfirm: () => {},
          })
          return
        }

        const imported = parsed.datas || []

        // Filtrer et compléter les données importées
        const validAgents = imported
          .filter((agent) => {
            return agent.nom && agent.postnom && agent.prenom
          })
          .map(completeAgentData) // Appliquer le filtrage et la complétion des données

        if (validAgents.length === 0) {
          setAlertModal({
            open: true,
            title: 'Aucune donnée valide',
            description:
              'Le fichier ne contient aucun agent avec les informations minimales requises (nom, postnom, prénom).',
            type: 'error',
            onConfirm: () => {},
          })
          return
        }

        // Détecter les doublons avec le système intelligent
        const agentsWithDuplicates = validAgents.map((agent) => {
          const duplicateInfo = IntelligentDuplicateDetector.detectDuplicate(agent, data)
          return {
            ...agent,
            isDuplicate: duplicateInfo.isDuplicate,
            duplicateScore: duplicateInfo.score,
            duplicateReason: duplicateInfo.reason,
            existingAgentId: duplicateInfo.existingAgent?.id,
          }
        })

        setPreviewData(agentsWithDuplicates)
        setImportModalOpen(true)
      } catch (err) {
        console.error(err)
        setAlertModal({
          open: true,
          title: 'Erreur de lecture',
          description: 'Le fichier est corrompu ou ne respecte pas le format ERA attendu.',
          type: 'error',
          onConfirm: () => {},
        })
      }
    }
    reader.readAsText(file)
    if (event.target) event.target.value = ''
  }

  // ===== Import avec gestion automatique des doublons =====
  const handleConfirmImport = async (agentsToImport: any[]) => {
    try {
      const newAgents: any[] = []
      const agentsToUpdate: any[] = []

      // Séparer les nouveaux agents des doublons avec filtrage des données
      agentsToImport.forEach((agent) => {
        // Filtrer les données pour ne garder que celles de l'interface Agent
        const filteredAgent = filterAgentData(agent)
        const completedAgent = completeAgentData(filteredAgent)

        if (agent.isDuplicate && agent.existingAgentId) {
          // C'est un doublon, on prépare la mise à jour
          agentsToUpdate.push({
            ...completedAgent,
            id: agent.existingAgentId, // Garder l'ID existant
          })
        } else {
          // Nouvel agent - RETIRER L'ID pour éviter l'erreur
          const { id, ...newAgentWithoutId } = completedAgent
          newAgents.push(newAgentWithoutId)
        }
      })

      // Traitement des nouveaux agents
      if (newAgents.length > 0) {
        const addedAgents = await addAgents(newAgents)
        console.log(`${addedAgents.length} nouveaux agents ajoutés`)
      }

      // Traitement des mises à jour
      if (agentsToUpdate.length > 0) {
        for (const agentToUpdate of agentsToUpdate) {
          await updateAgent(agentToUpdate)
        }
        console.log(`${agentsToUpdate.length} agents mis à jour`)
      }

      // Recharger la liste des agents
      await loadAgents()

      setImportModalOpen(false)
      setPreviewData([])

      const totalProcessed = newAgents.length + agentsToUpdate.length
      const message = `Importation réussie!\n${newAgents.length} nouveaux agents créés\n${agentsToUpdate.length} agents mis à jour\nTotal: ${totalProcessed} agents traités`

      setAlertModal({
        open: true,
        title: 'Importation réussie',
        description: message,
        type: 'success',
        onConfirm: () => {},
      })
    } catch (error: any) {
      console.error("Erreur lors de l'import des agents:", error)
      setAlertModal({
        open: true,
        title: "Erreur d'importation",
        description: `Une erreur est survenue lors de l'importation des agents: ${error.message || error}`,
        type: 'error',
        onConfirm: () => {},
      })
    }
  }

  // ===== Render =====
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-10 flex items-center justify-center">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement des agents...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 pt-10">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Gestion des Agents ({data.length})
          </h1>
          <Button onClick={() => setOpenAddAgentForm(true)} className="bg-teal-600  hover:bg-teal-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Enregiter un nouvel agent
          </Button>
        </div>

        <StatsPanel data={data} />
        <div className="bg-white dark:bg-neutral-800 rounded-md p-2">
          {/* Barre de recherche et filtres */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un agent..."
                value={globalFilter ?? ''}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-10 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-none"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-neutral-300 dark:border-neutral-600 bg-transparent"
                >
                  <Filter className="h-4 w-4" />
                  Filtrer
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              >
                <DropdownMenuItem
                  onClick={() => setColumnFilters([])}
                  className="text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Tous les agents
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setColumnFilters([{ id: 'status', value: 'En cours' }])}
                  className="text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Contrats en cours
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setColumnFilters([{ id: 'status', value: 'Expiré' }])}
                  className="text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  Contrats expirés
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setColumnFilters([{ id: 'typeContrat', value: 'cdi' }])}
                  className="text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  CDI seulement
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setColumnFilters([{ id: 'typeContrat', value: 'cdd' }])}
                  className="text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  CDD seulement
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {/* Bouton supprimer qui apparaît seulement quand des éléments sont sélectionnés */}
                {showDeleteButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 dark:text-red-400"
                    onClick={handleDeleteAgents}
                  >
                    <Trash2 className="h-4 w-4" />
                    Supprimer ({Object.keys(rowSelection).length})
                  </Button>
                )}
              </div>

              {selectedCount > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white  dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600">
                      <Download className="h-4 w-4 mr-2" /> Export ({selectedCount})
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                  >
                    <DropdownMenuItem
                      onClick={() => handleExport('xlsx')}
                      className="cursor-pointer text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExport('era')}
                      className="cursor-pointer text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <File className="h-4 w-4 mr-2" /> {appConfig.appName}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <label htmlFor="import-file" className="cursor-pointer">
                <Button
                  className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600 border border-neutral-300 dark:border-neutral-600"
                  asChild
                >
                  <div>
                    <Upload className="h-4 w-4 mr-2" /> Importer
                  </div>
                </Button>
                <input id="import-file" type="file" accept=".era" onChange={handleFileImport} className="hidden" />
              </label>
            </div>
          </div>

          {/* Quick Stats sur les statuts */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <Badge
              variant="outline"
              className="cursor-pointer px-3 py-1 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
              onClick={() => setColumnFilters([])}
            >
              Tous: {data.length}
            </Badge>

            <Badge
              variant="outline"
              className="cursor-pointer px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              onClick={() => setColumnFilters([{ id: 'typeContrat', value: 'cdi' }])}
            >
              CDI: {data.filter((agent) => agent.typeContrat === 'cdi').length}
            </Badge>
            <Badge
              variant="outline"
              className="cursor-pointer px-3 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800"
              onClick={() => setColumnFilters([{ id: 'typeContrat', value: 'cdd' }])}
            >
              CDD: {data.filter((agent) => agent.typeContrat === 'cdd').length}
            </Badge>
          </div>

          <div className="overflow-x-auto rounded-lg">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-neutral-50 dark:bg-neutral-700/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-neutral-900 dark:text-neutral-100 font-semibold">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-b cursor-pointer border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/30"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-neutral-900 dark:text-neutral-100">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center py-8 text-neutral-500 dark:text-neutral-400"
                    >
                      Aucun agent trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {table.getFilteredSelectedRowModel().rows.length} sur {table.getFilteredRowModel().rows.length} ligne(s)
            sélectionnée(s)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
            >
              Précédent
            </Button>
            <span className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/édition d'agent */}
      {openAddAgentForm && (
        <AddAgentForm
          open={openAddAgentForm}
          onOpenChange={handleCloseForm}
          onAddAgent={handleAddAgent}
          onUpdateAgent={handleUpdateAgent}
          editingAgent={editingAgent}
          isEditing={isEditing}
        />
      )}

      {/* Modal d'import */}
      {importModalOpen && (
        <ImportModal
          open={importModalOpen}
          onOpenChange={(open) => setImportModalOpen(open)}
          previewData={previewData}
          onConfirmImport={handleConfirmImport}
          onCancel={() => setImportModalOpen(false)}
          existingAgents={data}
        />
      )}

      <DemissionModal
        open={demissionModalOpen}
        onOpenChange={(stat: boolean) => {
          if (searchParams.get('demission')) {
            navigate('/agents', { replace: true })
          }
          setDemissionModalOpen(stat)
        }}
        agents={data}
        onDemissionRecorded={loadAgents} // Recharge la liste après une démission
      />

      <AlertModal
        open={alertModal.open}
        onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}
        title={alertModal.title}
        description={alertModal.description}
        type={alertModal.type}
        onConfirm={alertModal.onConfirm}
      />
    </div>
  )
}
