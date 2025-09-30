'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/app/components/ui/button'
import { Card } from '@/app/components/ui/card'
import { Badge } from '@/app/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/table'
import { Input } from '@/app/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import {
  Edit,
  X,
  Check,
  AlertCircle,
  Save,
  Loader2,
  Upload,
  Search,
  Filter,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Settings,
  RefreshCw,
  Info,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Briefcase,
  Calendar,
  BookOpen,
  Award,
  Shield,
  FileText,
  Users,
  Heart,
  Home,
  Banknote,
  Shirt,
  Scan,
  Cpu,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/app/components/ui/dropdown-menu'

interface Adresse {
  ville?: string
  commune?: string
  quartier?: string
  avenue?: string
  numero?: string
  codePostal?: string
  pays?: string
}

interface PersonneUrgence {
  nom: string
  prenom?: string
  telephone: string
  relationShip: string
  adresse?: Adresse
}

interface PieceIdentite {
  carteType: 'cartedelecteur' | 'pasport' | 'carteSejour' | 'permisConduire' | 'autre'
  numero: string
  nomdedelacarte?: string
  dateDelivrance?: string
  dateExpiration?: string
  lieuDelivrance?: string
}

interface Habillement {
  booteTaille?: string
  tshartTaille?: string
  vesteTaille?: string
  pantalonTaille?: string
  casquetteTaille?: string
}

interface Banque {
  nom?: string
  numeroCompte?: string
  codeBanque?: string
  codeGuichet?: string
  cleRib?: string
  iban?: string
  bic?: string
  titulaireCompte?: string
}

interface Salaire {
  montant: number
  type: 'jouranlier' | 'mensuelle' | 'trimestrielle' | 'annuelle'
  devise: 'CDF' | 'USD'
  modePaiement?: 'virement' | 'cheque' | 'especes'
}

interface Poste {
  id?: number
  name?: string
  description?: string
  categorie?: string
  niveau?: string
}

interface Departement {
  id?: number
  name?: string
  code?: string
  chefDepartement?: string
}

interface Contact {
  telephonePersonnel?: string
  telephoneProfessionnel?: string
  emailPersonnel?: string
  emailProfessionnel?: string
}

interface SituationFamiliale {
  conjoint?: {
    nom: string
    prenom: string
    dateNaissance?: string
    profession?: string
    employeur?: string
    telephone?: string
  }
  enfants?: {
    nom: string
    postnom: string
    prenom: string
    brithday: string
    brithplace: string
    sexe?: string
    niveauEtude?: string
  }[]
}

interface Formation {
  diplome: string
  etablissement: string
  anneeObtention: number
  specialite?: string
  niveau?: string
}

interface ExperienceProfessionnelle {
  employeur: string
  poste: string
  dateDebut: string
  dateFin?: string
  description?: string
  competences?: string[]
}

interface Langue {
  langue: string
  niveau: 'debutant' | 'intermediaire' | 'avance' | 'bilingue'
}

export interface Agent {
  // Identité de base
  id?: number
  matricule?: string
  nom: string
  postnom: string
  prenom: string
  genre: string
  dateNaissance?: string
  lieuNaissance?: string
  nationalite: string
  etatcivil: 'marie' | 'celibataire' | 'divorcee' | 'veuf'

  // Contacts
  email?: string
  telephone: string
  contact?: Contact
  adresse?: Adresse

  // Famille
  situationFamiliale?: SituationFamiliale
  pere?: string
  mere?: string
  personneUrgence?: PersonneUrgence[]

  // Documents d'identité
  pieceIdentite?: PieceIdentite[]
  image?: string
  signature?: string
  cardIdentiteImage?: string

  // Professionnel
  poste_ocuper?: Poste
  departement: Departement
  typeContrat?: 'cdd' | 'cdi' | 'durrere' | 'stage' | 'interim'
  dateDebutContrat?: string
  dateFinContrat?: string
  periode_essai: string
  statutEmploye?: 'actif' | 'inactif' | 'suspendu' | 'congé'

  // Rémunération
  saleaire?: Salaire
  devise?: 'CDF' | 'USD'
  banque?: Banque

  // Formation et compétences
  nuvieau_etudes: 'diplome' | 'gradue' | 'brevet' | 'licence' | 'master' | 'doctorat' | 'autre'
  anne_experience: number
  formations?: Formation[]
  experiences?: ExperienceProfessionnelle[]
  competences?: string[]
  langues?: Langue[]

  // Habillement
  habillement?: Habillement

  // Administratif
  cncss?: string
  nif?: string
  numImmatriculation?: string
  dateEmbauche?: string
  dateDepart?: string
  motifDepart?: string

  // Métadonnées import
  isFromFile?: boolean
  isDuplicate?: boolean
  duplicateScore?: number
  duplicateReason?: string
  existingAgentId?: number
}

// Configuration des colonnes étendue
const columnConfig = [
  { key: 'status', label: 'Statut', defaultVisible: true },
  { key: 'matricule', label: 'Matricule', defaultVisible: true },
  { key: 'nom', label: 'Nom', defaultVisible: true },
  { key: 'postnom', label: 'Post-nom', defaultVisible: true },
  { key: 'prenom', label: 'Prénom', defaultVisible: true },
  { key: 'genre', label: 'Genre', defaultVisible: true },
  { key: 'email', label: 'Email', defaultVisible: true },
  { key: 'telephone', label: 'Téléphone', defaultVisible: true },
  { key: 'departement', label: 'Département', defaultVisible: true },
  { key: 'poste', label: 'Poste', defaultVisible: true },
  { key: 'etatcivil', label: 'État civil', defaultVisible: false },
  { key: 'nationalite', label: 'Nationalité', defaultVisible: false },
  { key: 'birthday', label: 'Date naissance', defaultVisible: false },
  { key: 'contrat', label: 'Type contrat', defaultVisible: false },
  { key: 'salaire', label: 'Salaire', defaultVisible: false },
  { key: 'etudes', label: 'Niveau études', defaultVisible: false },
  { key: 'experience', label: 'Expérience', defaultVisible: false },
  { key: 'adresse', label: 'Adresse', defaultVisible: false },
  { key: 'banque', label: 'Banque', defaultVisible: false },
  { key: 'cncss', label: 'CNCSS', defaultVisible: false },
  { key: 'nif', label: 'NIF', defaultVisible: false },
  { key: 'contactUrgence', label: 'Contact Urgence', defaultVisible: false },
]

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewData: Agent[]
  existingAgents: Agent[] // Changé pour avoir tous les agents existants
  onConfirmImport: (agents: Agent[]) => void
  onCancel: () => void
}

// Système de détection de doublons intelligent
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

  // Calcul de similarité entre deux chaînes (algorithme de Jaro-Winkler amélioré)
  private static calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0

    const s1 = this.normalizeText(str1)
    const s2 = this.normalizeText(str2)

    if (s1 === s2) return 1.0

    // Distance de Jaro-Winkler simplifiée
    const minLength = Math.min(s1.length, s2.length)
    const maxLength = Math.max(s1.length, s2.length)

    let matches = 0
    let transpositions = 0
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

    // Compter les transpositions
    let k = 0
    for (let i = 0; i < s1.length; i++) {
      if (s1Matches[i]) {
        let j
        for (j = k; j < s2.length; j++) {
          if (s2Matches[j]) {
            k = j + 1
            break
          }
        }
        if (s1[i] !== s2[j]) {
          transpositions++
        }
      }
    }

    transpositions = transpositions / 2

    // Calcul de la similarité Jaro
    const jaroSimilarity = (matches / s1.length + matches / s2.length + (matches - transpositions) / matches) / 3

    // Facteur de préfixe commun (Winkler)
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
      const minLength = Math.min(phone1.length, phone2.length)
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

  // Comparaison des documents d'identité
  private static compareDocuments(agent1: Agent, agent2: Agent): number {
    if (!agent1.pieceIdentite || !agent2.pieceIdentite) return 0

    let maxScore = 0
    for (const doc1 of agent1.pieceIdentite) {
      for (const doc2 of agent2.pieceIdentite) {
        if (doc1.carteType === doc2.carteType && doc1.numero && doc2.numero) {
          const docScore = this.calculateSimilarity(doc1.numero, doc2.numero)
          maxScore = Math.max(maxScore, docScore)
        }
      }
    }
    return maxScore
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

      // 4. Documents (Poids fort - 15%)
      const documentsScore = this.compareDocuments(newAgent, existingAgent)
      if (documentsScore > this.HIGH_CONFIDENCE_THRESHOLD) {
        totalScore += documentsScore * 0.15
        weightSum += 0.15
        reasons.push(`Document identique (${Math.round(documentsScore * 100)}%)`)
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

export function ImportModal({
  open,
  onOpenChange,
  previewData,
  existingAgents,
  onConfirmImport,
  onCancel,
}: ImportModalProps) {
  const [editableData, setEditableData] = useState<Agent[]>([])
  const [isEditing, setIsEditing] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<Agent>>({})
  const [isImporting, setIsImporting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState('all')
  const [duplicationThreshold, setDuplicationThreshold] = useState(80)

  // État pour les colonnes visibles
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(
    columnConfig.reduce(
      (acc, column) => {
        acc[column.key] = column.defaultVisible
        return acc
      },
      {} as Record<string, boolean>
    )
  )

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)

  // Détection des doublons avec l'algorithme intelligent
  useEffect(() => {
    if (previewData) {
      const processedData = previewData.map((agent) => {
        const duplicateInfo = IntelligentDuplicateDetector.detectDuplicate(agent, existingAgents)
        return {
          ...agent,
          isDuplicate: duplicateInfo.isDuplicate,
          duplicateScore: duplicateInfo.score,
          duplicateReason: duplicateInfo.reason,
          existingAgentId: duplicateInfo.existingAgent?.id,
          isFromFile: true,
        }
      })
      setEditableData(processedData)
    }
  }, [previewData, existingAgents])

  // Réinitialiser la page quand les données ou les filtres changent
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filterBy, itemsPerPage])

  const filteredData = useMemo(() => {
    let filtered = editableData

    if (searchTerm) {
      filtered = filtered.filter(
        (agent) =>
          agent.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          `${agent.nom} ${agent.postnom} ${agent.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.telephone?.includes(searchTerm) ||
          agent.departement?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.poste_ocuper?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterBy !== 'all') {
      filtered = filtered.filter((agent) => {
        if (filterBy === 'new') return !agent.isDuplicate
        if (filterBy === 'duplicate') return agent.isDuplicate
        if (filterBy === 'high-confidence') return agent.duplicateScore && agent.duplicateScore >= 0.9
        if (filterBy === 'medium-confidence')
          return agent.duplicateScore && agent.duplicateScore >= 0.7 && agent.duplicateScore < 0.9
        return true
      })
    }

    return filtered
  }, [editableData, searchTerm, filterBy])

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentData = filteredData.slice(startIndex, endIndex)

  const stats = {
    total: editableData.length,
    nouveaux: editableData.filter((a) => !a.isDuplicate).length,
    doublons: editableData.filter((a) => a.isDuplicate).length,
    hauteConfiance: editableData.filter((a) => a.duplicateScore && a.duplicateScore >= 0.9).length,
    moyenneConfiance: editableData.filter((a) => a.duplicateScore && a.duplicateScore >= 0.7 && a.duplicateScore < 0.9)
      .length,
  }

  const getProcessingMessage = () => {
    if (stats.doublons === 0) {
      return `${stats.nouveaux} nouveaux agents seront créés.`
    }

    if (stats.nouveaux === 0) {
      return `${stats.doublons} agents existants seront mis à jour automatiquement.`
    }

    return `${stats.nouveaux} nouveaux agents seront créés et ${stats.doublons} agents existants seront mis à jour automatiquement.`
  }

  const handleEdit = (index: number) => {
    setIsEditing(index)
    setEditValues(editableData[index])
  }

  const handleSave = (index: number) => {
    const newData = [...editableData]
    const updatedAgent = {
      ...(editValues as Agent),
      isFromFile: true,
    }

    // Recalculer le statut de doublon après modification
    const duplicateInfo = IntelligentDuplicateDetector.detectDuplicate(updatedAgent, existingAgents)

    newData[index] = {
      ...updatedAgent,
      isDuplicate: duplicateInfo.isDuplicate,
      duplicateScore: duplicateInfo.score,
      duplicateReason: duplicateInfo.reason,
      existingAgentId: duplicateInfo.existingAgent?.id,
    }

    setEditableData(newData)
    setIsEditing(null)
    setEditValues({})
  }

  const handleChange = (field: keyof Agent, value: any) => {
    setEditValues((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (parentField: keyof Agent, childField: string, value: any) => {
    setEditValues((prev) => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField] as any),
        [childField]: value,
      },
    }))
  }

  const handleCancelEdit = () => {
    setIsEditing(null)
    setEditValues({})
  }

  const handleConfirmImport = async () => {
    setIsImporting(true)
    const agentsToImport = [...editableData]

    await new Promise((resolve) => setTimeout(resolve, 1000))
    onConfirmImport(agentsToImport)
    setIsImporting(false)
  }

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({ ...prev, [column]: !prev[column] }))
  }

  const toggleAllColumns = (visible: boolean) => {
    const newVisibleColumns = { ...visibleColumns }
    Object.keys(newVisibleColumns).forEach((key) => {
      newVisibleColumns[key] = visible
    })
    setVisibleColumns(newVisibleColumns)
  }

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === '') return '- -'
    if (typeof value === 'object') {
      if (Array.isArray(value))
        return value.length > 0 ? value.map((v) => v.numero || v.nom || JSON.stringify(v)).join(', ') : '- -'
      return value.name || value.nom || value.ville || JSON.stringify(value)
    }
    return String(value)
  }

  // Navigation de pagination
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  // Rendu des cellules éditables
  const renderEditableCell = (field: keyof Agent, value: any, agent: Agent) => {
    const globalIndex = editableData.findIndex((a) => a === agent)

    if (isEditing !== globalIndex) {
      return formatValue(value)
    }

    // Champs simples avec input text
    const simpleFields = [
      'matricule',
      'nom',
      'postnom',
      'prenom',
      'email',
      'telephone',
      'nationalite',
      'dateNaissance',
      'lieuNaissance',
      'nomduconjoint',
      'cncss',
      'nif',
      'numImmatriculation',
    ]
    if (simpleFields.includes(field)) {
      return (
        <Input
          value={editValues[field] || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="h-8 text-xs"
        />
      )
    }

    // Champs avec sélection
    if (field === 'genre') {
      return (
        <Select value={editValues.genre || ''} onValueChange={(value) => handleChange('genre', value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Masculin">Masculin</SelectItem>
            <SelectItem value="Féminin">Féminin</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (field === 'etatcivil') {
      return (
        <Select value={editValues.etatcivil || ''} onValueChange={(value) => handleChange('etatcivil', value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="marie">Marié(e)</SelectItem>
            <SelectItem value="celibataire">Célibataire</SelectItem>
            <SelectItem value="divorcee">Divorcé(e)</SelectItem>
            <SelectItem value="veuf">Veuf/Veuve</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (field === 'typeContrat') {
      return (
        <Select value={editValues.typeContrat || ''} onValueChange={(value) => handleChange('typeContrat', value)}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cdd">CDD</SelectItem>
            <SelectItem value="cdi">CDI</SelectItem>
            <SelectItem value="durrere">Durée déterminée</SelectItem>
            <SelectItem value="stage">Stage</SelectItem>
            <SelectItem value="interim">Intérim</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    if (field === 'nuvieau_etudes') {
      return (
        <Select
          value={editValues.nuvieau_etudes || ''}
          onValueChange={(value) => handleChange('nuvieau_etudes', value)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diplome">Diplôme</SelectItem>
            <SelectItem value="gradue">Gradué</SelectItem>
            <SelectItem value="brevet">Brevet</SelectItem>
            <SelectItem value="licence">Licence</SelectItem>
            <SelectItem value="master">Master</SelectItem>
            <SelectItem value="doctorat">Doctorat</SelectItem>
            <SelectItem value="autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      )
    }

    // Champs numériques
    if (field === 'nombre_enfants' || field === 'anne_experience') {
      return (
        <Input
          type="number"
          value={editValues[field] || ''}
          onChange={(e) => handleChange(field, parseInt(e.target.value) || 0)}
          className="h-8 text-xs"
        />
      )
    }

    // Champs imbriqués
    if (field === 'departement') {
      return (
        <Input
          value={(editValues.departement as Departement)?.name || ''}
          onChange={(e) => handleNestedChange('departement', 'name', e.target.value)}
          className="h-8 text-xs"
          placeholder="Nom du département"
        />
      )
    }

    if (field === 'poste_ocuper') {
      return (
        <Input
          value={(editValues.poste_ocuper as Poste)?.name || ''}
          onChange={(e) => handleNestedChange('poste_ocuper', 'name', e.target.value)}
          className="h-8 text-xs"
          placeholder="Nom du poste"
        />
      )
    }

    if (field === 'saleaire') {
      const salaire = (editValues.saleaire as Salaire) || { montant: 0, type: 'mensuelle', devise: 'CDF' }
      return (
        <div className="flex gap-1">
          <Input
            type="number"
            value={salaire.montant || ''}
            onChange={(e) => handleNestedChange('saleaire', 'montant', parseFloat(e.target.value) || 0)}
            className="h-8 text-xs w-20"
            placeholder="Montant"
          />
          <Select
            value={salaire.type || 'mensuelle'}
            onValueChange={(value) => handleNestedChange('saleaire', 'type', value)}
          >
            <SelectTrigger className="h-8 text-xs w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jouranlier">Journalier</SelectItem>
              <SelectItem value="mensuelle">Mensuel</SelectItem>
              <SelectItem value="trimestrielle">Trimestriel</SelectItem>
              <SelectItem value="annuelle">Annuel</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={salaire.devise || 'CDF'}
            onValueChange={(value) => handleNestedChange('saleaire', 'devise', value)}
          >
            <SelectTrigger className="h-8 text-xs w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CDF">CDF</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )
    }

    // Par défaut, input text
    return (
      <Input
        value={editValues[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
        className="h-8 text-xs"
      />
    )
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-[95vw] w-full h-[96vh] overflow-hidden bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 shadow-2xl p-0">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="min-h-16 bg-gradient-to-r from-neutral-900 via-purple-900 to-neutral-900 dark:from-neutral-800 dark:via-purple-800 dark:to-neutral-800 text-white relative overflow-hidden shrink-0">
            <div className="absolute inset-0 gap-5 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20"></div>
            <div className="relative z-10 flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                  <Cpu className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Previsualisation de l'importation</h2>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Statistiques et contrôles */}
          <div className="px-4 pt-3 space-y-3">
            {/* Cartes de statistiques */}
            <div className="flex gap-10  justify-center align-center">
              <Card className="p-3  flex-1 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total</span>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.total}</div>
              </Card>
              <Card className="p-3 flex-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Nouveaux</span>
                </div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.nouveaux}</div>
              </Card>
              <Card className="p-3 flex-1 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Doublons</span>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.doublons}</div>
              </Card>
            </div>

            {/* Message d'information sur le traitement automatique */}
            {stats.doublons > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-3">
                <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Détection intelligente activée</h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {getProcessingMessage()} Le système a détecté des similitudes avancées entre les agents.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Filtres et colonnes */}
          <div className="mb-4 space-y-4 px-4 pt-3">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Rechercher par matricule, nom, email, téléphone, département..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les agents</SelectItem>
                  <SelectItem value="new">Nouveaux seulement</SelectItem>
                  <SelectItem value="duplicate">Doublons seulement</SelectItem>
                  <SelectItem value="high-confidence">Haute confiance</SelectItem>
                  <SelectItem value="medium-confidence">Confiance moyenne</SelectItem>
                </SelectContent>
              </Select>

              {/* Dropdown pour les colonnes visibles */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Colonnes
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64">
                  <div className="px-2 py-1.5 text-sm font-semibold">Colonnes visibles</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleAllColumns(true)} className="text-xs">
                    Tout sélectionner
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAllColumns(false)} className="text-xs">
                    Tout désélectionner
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {columnConfig.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumns[column.key]}
                      onCheckedChange={() => toggleColumn(column.key)}
                      className="text-xs"
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Tableau */}
          <div className="flex-1 overflow-hidden px-3">
            <div className="h-full overflow-auto border border-neutral-200 dark:border-neutral-700 rounded-lg">
              <Table>
                <TableHeader className="sticky top-0 bg-neutral-50 dark:bg-neutral-700/50">
                  <TableRow>
                    {visibleColumns.status && <TableHead className="min-w-[140px]">Statut</TableHead>}
                    {visibleColumns.matricule && <TableHead>Matricule</TableHead>}
                    {visibleColumns.nom && <TableHead>Nom</TableHead>}
                    {visibleColumns.postnom && <TableHead>Post-nom</TableHead>}
                    {visibleColumns.prenom && <TableHead>Prénom</TableHead>}
                    {visibleColumns.genre && <TableHead>Genre</TableHead>}
                    {visibleColumns.email && <TableHead>Email</TableHead>}
                    {visibleColumns.telephone && <TableHead>Téléphone</TableHead>}
                    {visibleColumns.departement && <TableHead>Département</TableHead>}
                    {visibleColumns.poste && <TableHead>Poste</TableHead>}
                    {visibleColumns.etatcivil && <TableHead>État civil</TableHead>}
                    {visibleColumns.nationalite && <TableHead>Nationalité</TableHead>}
                    {visibleColumns.birthday && <TableHead>Date naissance</TableHead>}
                    {visibleColumns.contrat && <TableHead>Type contrat</TableHead>}
                    {visibleColumns.salaire && <TableHead>Salaire</TableHead>}
                    {visibleColumns.etudes && <TableHead>Niveau études</TableHead>}
                    {visibleColumns.experience && <TableHead>Expérience (ans)</TableHead>}
                    {visibleColumns.adresse && <TableHead>Adresse</TableHead>}
                    {visibleColumns.banque && <TableHead>Banque</TableHead>}
                    {visibleColumns.cncss && <TableHead>CNCSS</TableHead>}
                    {visibleColumns.nif && <TableHead>NIF</TableHead>}
                    {visibleColumns.contactUrgence && <TableHead>Contact Urgence</TableHead>}
                    <TableHead className="min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.map((agent, index) => {
                    const globalIndex = startIndex + index
                    const confidenceLevel = agent.duplicateScore
                      ? agent.duplicateScore >= 0.9
                        ? 'high'
                        : agent.duplicateScore >= 0.7
                          ? 'medium'
                          : 'low'
                      : 'none'

                    return (
                      <TableRow
                        key={globalIndex}
                        className={
                          agent.isDuplicate
                            ? confidenceLevel === 'high'
                              ? 'bg-red-50/50 dark:bg-red-900/20'
                              : 'bg-amber-50/50 dark:bg-amber-900/20'
                            : 'bg-emerald-50/50 dark:bg-emerald-900/20'
                        }
                      >
                        {visibleColumns.status && (
                          <TableCell>
                            {agent.isDuplicate ? (
                              <div className="flex flex-col gap-1">
                                <Badge
                                  variant="outline"
                                  className={
                                    confidenceLevel === 'high'
                                      ? 'text-red-700 border-red-300 bg-red-100 text-xs flex items-center gap-1'
                                      : 'text-amber-700 border-amber-300 bg-amber-100 text-xs flex items-center gap-1'
                                  }
                                >
                                  <Cpu className="h-3 w-3" />
                                  {confidenceLevel === 'high' ? 'Doublon certain' : 'Doublon probable'}
                                </Badge>
                              </div>
                            ) : (
                              <Badge className="bg-emerald-500 text-white text-xs">Nouveau</Badge>
                            )}
                          </TableCell>
                        )}

                        {visibleColumns.matricule && (
                          <TableCell className="font-mono">
                            {renderEditableCell('matricule', agent.matricule, agent)}
                          </TableCell>
                        )}

                        {visibleColumns.nom && (
                          <TableCell className="font-medium">{renderEditableCell('nom', agent.nom, agent)}</TableCell>
                        )}

                        {visibleColumns.postnom && (
                          <TableCell>{renderEditableCell('postnom', agent.postnom, agent)}</TableCell>
                        )}

                        {visibleColumns.prenom && (
                          <TableCell>{renderEditableCell('prenom', agent.prenom, agent)}</TableCell>
                        )}

                        {visibleColumns.genre && (
                          <TableCell>{renderEditableCell('genre', agent.genre, agent)}</TableCell>
                        )}

                        {visibleColumns.email && (
                          <TableCell>{renderEditableCell('email', agent.email, agent)}</TableCell>
                        )}

                        {visibleColumns.telephone && (
                          <TableCell>{renderEditableCell('telephone', agent.telephone, agent)}</TableCell>
                        )}

                        {visibleColumns.departement && (
                          <TableCell>{renderEditableCell('departement', agent.departement, agent)}</TableCell>
                        )}

                        {visibleColumns.poste && (
                          <TableCell>{renderEditableCell('poste_ocuper', agent.poste_ocuper, agent)}</TableCell>
                        )}

                        {visibleColumns.etatcivil && (
                          <TableCell>{renderEditableCell('etatcivil', agent.etatcivil, agent)}</TableCell>
                        )}

                        {visibleColumns.nationalite && (
                          <TableCell>{renderEditableCell('nationalite', agent.nationalite, agent)}</TableCell>
                        )}

                        {visibleColumns.birthday && (
                          <TableCell>{renderEditableCell('dateNaissance', agent.dateNaissance, agent)}</TableCell>
                        )}

                        {visibleColumns.contrat && (
                          <TableCell>{renderEditableCell('typeContrat', agent.typeContrat, agent)}</TableCell>
                        )}

                        {visibleColumns.salaire && (
                          <TableCell>
                            {isEditing === globalIndex
                              ? renderEditableCell('saleaire', agent.saleaire, agent)
                              : agent.saleaire
                                ? `${agent.saleaire.montant} ${agent.saleaire.devise} (${agent.saleaire.type})`
                                : '- -'}
                          </TableCell>
                        )}

                        {visibleColumns.etudes && (
                          <TableCell>{renderEditableCell('nuvieau_etudes', agent.nuvieau_etudes, agent)}</TableCell>
                        )}

                        {visibleColumns.experience && (
                          <TableCell>{renderEditableCell('anne_experience', agent.anne_experience, agent)}</TableCell>
                        )}

                        {visibleColumns.adresse && (
                          <TableCell>
                            {agent.adresse
                              ? `${agent.adresse.ville || ''} ${agent.adresse.commune || ''}`.trim() || '- -'
                              : '- -'}
                          </TableCell>
                        )}

                        {visibleColumns.banque && (
                          <TableCell>
                            {agent.banque
                              ? `${agent.banque.nom || ''} ${agent.banque.numeroCompte || ''}`.trim() || '- -'
                              : '- -'}
                          </TableCell>
                        )}

                        {visibleColumns.cncss && <TableCell>{agent.cncss || '- -'}</TableCell>}

                        {visibleColumns.nif && <TableCell>{agent.nif || '- -'}</TableCell>}

                        {visibleColumns.contactUrgence && (
                          <TableCell>
                            {agent.personneUrgence && agent.personneUrgence.length > 0
                              ? `${agent.personneUrgence[0].nom} (${agent.personneUrgence[0].relationShip})`
                              : '- -'}
                          </TableCell>
                        )}

                        <TableCell>
                          {isEditing === globalIndex ? (
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSave(globalIndex)}
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="h-3 w-3 mr-1" /> Sauver
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-7 text-xs">
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(globalIndex)}
                              className="h-7 text-xs"
                            >
                              <Edit className="h-3 w-3 mr-1" /> Modifier
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredData.length)} sur {filteredData.length}{' '}
              agent(s)
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Afficher</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-neutral-600 dark:text-neutral-400">éléments</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      className="h-8 w-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between items-center mt-4 p-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>{getProcessingMessage()}</span>
              </div>
              <div className="text-xs text-neutral-500">
                Détection intelligente basée sur l'identité, les contacts, les documents et les informations
                professionnelles.
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300"
              >
                Annuler
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={isImporting || stats.total === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Importation...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" /> Importer {stats.total} agent(s)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
