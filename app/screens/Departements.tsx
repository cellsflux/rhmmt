import React, { JSX, useEffect, useMemo, useRef, useState } from 'react'
import { useReactTable, getCoreRowModel, flexRender, SortingState, ColumnSort } from '@tanstack/react-table'
import { Button } from '@/app/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/ui/table'
import { Plus, X, Loader2, Edit, Trash2, AlertTriangle, Download, Upload, Search, ArrowUpDown } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog'
import * as XLSX from 'xlsx'

import { useConveyor } from '../hooks/use-conveyor'
import { Departement } from '../components/agents/ImportModale'
import { AlertModal } from '@/app/components/ui/AlertMoadale'

// ===== Types =====
interface DepartementFormData {
  nom: string
  descriptions: string
  prefixMatricule: string
}

interface ERAFileData {
  createat: string
  autheur: string
  data_type: string
  datas: DepartementFormData[]
}

// ===== Composant Modal =====
interface DepartementModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DepartementFormData) => Promise<void>
  isLoading: boolean
  initialData?: Departement | null
}

function DepartementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  initialData,
}: DepartementModalProps): JSX.Element | null {
  const [formData, setFormData] = useState<DepartementFormData>({
    nom: '',
    descriptions: '',
    prefixMatricule: '',
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || '',
        descriptions: initialData.descriptions || '',
        prefixMatricule: initialData.prefixMatricule || '',
      })
    } else {
      setFormData({
        nom: '',
        descriptions: '',
        prefixMatricule: '',
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    if (!isLoading) {
      onClose()
    }
  }

  const handleChange = (field: keyof DepartementFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Modifier le département' : 'Ajouter un département'}
          </h2>
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 dark:text-gray-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nom" className="text-gray-700 dark:text-gray-300">
              Nom *
            </Label>
            <Input
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
              disabled={isLoading}
              placeholder="Nom du département"
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="prefixMatricule" className="text-gray-700 dark:text-gray-300">
              Préfixe matricule *
            </Label>
            <Input
              id="prefixMatricule"
              value={formData.prefixMatricule}
              onChange={(e) => handleChange('prefixMatricule', e.target.value.toUpperCase())}
              required
              disabled={isLoading}
              maxLength={6}
              placeholder="MMT-90"
              className="uppercase bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum 5 caractères</p>
          </div>

          <div>
            <Label htmlFor="descriptions" className="text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="descriptions"
              value={formData.descriptions}
              onChange={(e) => handleChange('descriptions', e.target.value)}
              disabled={isLoading}
              placeholder="Description du département"
              rows={3}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {initialData ? 'Modification...' : 'Ajout...'}
                </>
              ) : initialData ? (
                'Modifier'
              ) : (
                'Ajouter'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ===== Modal de prévisualisation pour l'import =====
interface PreviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: DepartementFormData[]) => Promise<void>
  data: DepartementFormData[]
  isLoading: boolean
  fileInfo?: {
    author: string
    createdAt: string
    dataType: string
  }
}

function PreviewModal({
  isOpen,
  onClose,
  onConfirm,
  data,
  isLoading,
  fileInfo,
}: PreviewModalProps): JSX.Element | null {
  const [editedData, setEditedData] = useState<{ data: DepartementFormData; isSelected: boolean }[]>([])

  useEffect(() => {
    setEditedData(data.map((item) => ({ data: item, isSelected: true })))
  }, [data])

  const handleFieldChange = (index: number, field: keyof DepartementFormData, value: string) => {
    setEditedData((prev) =>
      prev.map((item, i) => (i === index ? { ...item, data: { ...item.data, [field]: value } } : item))
    )
  }

  const handleToggleSelection = (index: number) => {
    setEditedData((prev) => prev.map((item, i) => (i === index ? { ...item, isSelected: !item.isSelected } : item)))
  }

  const handleRemoveItem = (index: number) => {
    setEditedData((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const selectedData = editedData.filter((item) => item.isSelected).map((item) => item.data)
    await onConfirm(selectedData)
  }

  const selectedCount = editedData.filter((item) => item.isSelected).length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Prévisualisation des données à importer
          </h2>
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-500 dark:text-gray-400">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Informations sur le fichier .era */}
        {fileInfo && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Informations du fichier .era</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Auteur :</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{fileInfo.author}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Date de création :</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">
                  {new Date(fileInfo.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-blue-800 dark:text-blue-200">Type de données :</span>
                <span className="ml-2 text-blue-700 dark:text-blue-300">{fileInfo.dataType}</span>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.length} département(s) trouvé(s). {selectedCount} sélectionné(s) pour l'import.
          </p>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800">
                  <TableHead className="text-gray-700 dark:text-gray-300 w-12">Sélection</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Nom</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300">Préfixe matricule</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 w-12">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editedData.map((item, index) => (
                  <TableRow
                    key={index}
                    className={`border-gray-200 dark:border-gray-700 ${
                      !item.isSelected ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : ''
                    }`}
                  >
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={() => handleToggleSelection(index)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.data.nom}
                        onChange={(e) => handleFieldChange(index, 'nom', e.target.value)}
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.data.descriptions}
                        onChange={(e) => handleFieldChange(index, 'descriptions', e.target.value)}
                        disabled={isLoading}
                        className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.data.prefixMatricule}
                        onChange={(e) => handleFieldChange(index, 'prefixMatricule', e.target.value.toUpperCase())}
                        disabled={isLoading}
                        className="uppercase bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedCount} département(s) sélectionné(s) sur {editedData.length}
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || selectedCount === 0}
                className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Import...
                  </>
                ) : (
                  `Importer ${selectedCount} département(s)`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Composant principal =====
export default function DepartementScreen(): JSX.Element {
  const [data, setData] = useState<Departement[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingDepartement, setEditingDepartement] = useState<Departement | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [departementToDelete, setDepartementToDelete] = useState<Departement | null>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [importData, setImportData] = useState<DepartementFormData[]>([])
  const [fileInfo, setFileInfo] = useState<{ author: string; createdAt: string; dataType: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const importRef = useRef<HTMLInputElement>(null)
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'error' | 'warning' | 'info'
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { addDepartement, deleteDepartement, updateDepartement, getDepartements } = useConveyor('app')

  const loadDepartements = async () => {
    try {
      setLoading(true)
      const departements = await getDepartements()
      setData(departements)
    } catch (error) {
      console.error('Erreur lors du chargement des départements:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartements()
  }, [])

  // ===== Filtrage et tri =====
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(
      (dept) =>
        dept.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.descriptions.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.prefixMatricule.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sorting.length > 0) {
      const sort = sorting[0]
      filtered = filtered.sort((a, b) => {
        const aValue = a[sort.id as keyof Departement]
        const bValue = b[sort.id as keyof Departement]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.desc ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue)
        }
        return 0
      })
    }

    return filtered
  }, [data, searchTerm, sorting])

  // ===== Fonctions d'export =====
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredAndSortedData.map((dept) => ({
        Nom: dept.nom,
        Description: dept.descriptions,
        'Préfixe matricule': dept.prefixMatricule,
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Départements')
    XLSX.writeFile(workbook, 'departements.xlsx')
  }

  const exportToERA = () => {
    const eraData: ERAFileData = {
      createat: new Date().toISOString(),
      autheur: 'Administrateur',
      data_type: 'departement',
      datas: filteredAndSortedData.map((dept) => ({
        nom: dept.nom,
        descriptions: dept.descriptions,
        prefixMatricule: dept.prefixMatricule,
      })),
    }

    const blob = new Blob([JSON.stringify(eraData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `departements_${new Date().toISOString().split('T')[0]}.era`
    link.click()
    URL.revokeObjectURL(url)
  }

  // ===== Fonctions d'import =====
  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Vérifier que le fichier est un .era
    if (!file.name.endsWith('.era')) {
      setAlertModal({
        isOpen: true,
        title: 'Format de fichier non supporté',
        message: "Seuls les fichiers .era sont autorisés. Veuillez sélectionner un fichier avec l'extension .era.",
        type: 'error',
      })
      event.target.value = ''
      return
    }

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const eraData: ERAFileData = JSON.parse(content)

        // Validation de la structure du fichier .era
        if (!eraData.data_type) {
          setAlertModal({
            isOpen: true,
            title: 'Fichier .era invalide',
            message: 'Votre fichier ne contient pas de données valides.',
            type: 'error',
          })
          return
        }

        if (eraData.data_type !== 'departement') {
          setAlertModal({
            isOpen: true,
            title: 'Type de données incorrect',
            message: `Le fichier .era contient des données de type "${eraData.data_type}" au lieu de "departement".`,
            type: 'error',
          })
          return
        }

        if (!Array.isArray(eraData.datas)) {
          setAlertModal({
            isOpen: true,
            title: 'Structure de données invalide',
            message: 'Les données du fichier .era ne sont pas dans un format valide.',
            type: 'error',
          })
          return
        }

        if (eraData.datas.length === 0) {
          setAlertModal({
            isOpen: true,
            title: 'Fichier vide',
            message: 'Le fichier .era ne contient aucune donnée de département.',
            type: 'warning',
          })
          return
        }

        // Validation de la structure de chaque département
        const isValidStructure = eraData.datas.every((item) => {
          const hasRequiredFields = item.nom && item.prefixMatricule
          const isValidNom = typeof item.nom === 'string' && item.nom.trim().length > 0
          const isValidPrefix = typeof item.prefixMatricule === 'string' && item.prefixMatricule.trim().length > 0
          return hasRequiredFields && isValidNom && isValidPrefix
        })

        if (!isValidStructure) {
          setAlertModal({
            isOpen: true,
            title: 'Structure de données invalide',
            message:
              'Certains départements dans le fichier .era ne contiennent pas les champs requis (nom et préfixe matricule).',
            type: 'error',
          })
          return
        }

        // Stocker les informations du fichier
        setFileInfo({
          author: eraData.autheur || 'Inconnu',
          createdAt: eraData.createat || new Date().toISOString(),
          dataType: eraData.data_type,
        })

        setImportData(eraData.datas)
        setPreviewModalOpen(true)
      } catch (error) {
        console.error('Erreur lors de la lecture du fichier:', error)
        setAlertModal({
          isOpen: true,
          title: 'Erreur de lecture',
          message: "Impossible de lire le fichier .era. Vérifiez que le fichier n'est pas corrompu.",
          type: 'error',
        })
      }
    }

    reader.onerror = () => {
      setAlertModal({
        isOpen: true,
        title: 'Erreur de lecture',
        message: 'Une erreur est survenue lors de la lecture du fichier.',
        type: 'error',
      })
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  const handleImportConfirm = async (importedData: DepartementFormData[]) => {
    try {
      setActionLoading('import')

      // Validation finale avant import
      const uniqueData: DepartementFormData[] = []
      const seen = new Set()
      const duplicates: DepartementFormData[] = []

      const existingData = data.map((dept) => ({
        nom: dept.nom.toLowerCase().trim(),
        prefixMatricule: dept.prefixMatricule.toLowerCase().trim(),
      }))

      // Séparer les données uniques des doublons
      for (const item of importedData) {
        const itemNom = item.nom.toLowerCase().trim()
        const itemPrefix = item.prefixMatricule.toLowerCase().trim()
        const key = `${itemNom}-${itemPrefix}`

        // Vérifier les doublons dans les données existantes (sans vérifier l'ID)
        const isDuplicateInExisting = existingData.some(
          (existing) => existing.nom === itemNom || existing.prefixMatricule === itemPrefix
        )

        // Vérifier les doublons dans les données importées
        const isDuplicateInImport = seen.has(key)

        if (isDuplicateInExisting || isDuplicateInImport) {
          duplicates.push(item)
        } else {
          seen.add(key)
          uniqueData.push(item)
        }
      }

      // Si des doublons sont détectés, afficher un message d'avertissement mais continuer l'import
      if (duplicates.length > 0) {
        setAlertModal({
          isOpen: true,
          title: 'Doublons détectés',
          message: `${duplicates.length} département(s) n'ont pas été importés car ils existent déjà dans la base de données ou sont en doublon dans le fichier. ${uniqueData.length} département(s) unique(s) seront importés.`,
          type: 'warning',
        })

        // Ne pas arrêter l'import, continuer avec les données uniques
        if (uniqueData.length === 0) {
          setAlertModal({
            isOpen: true,
            title: 'Aucune donnée à importer',
            message: 'Tous les départements existent déjà dans la base de données ou sont en doublon.',
            type: 'warning',
          })
          setPreviewModalOpen(false)
          setImportData([])
          setFileInfo(null)
          return
        }
      }

      // Importer seulement les données uniques
      for (const deptData of uniqueData) {
        try {
          await addDepartement(deptData)
        } catch (error) {
          console.error(`Erreur lors de l'ajout du département ${deptData.nom}:`, error)
          // Continuer avec les autres départements même en cas d'erreur sur un
        }
      }

      await loadDepartements()
      setPreviewModalOpen(false)
      setImportData([])
      setFileInfo(null)

      // Message de succès final
      if (duplicates.length > 0) {
        setAlertModal({
          isOpen: true,
          title: 'Import partiellement réussi',
          message: `${uniqueData.length} département(s) importé(s) avec succès. ${duplicates.length} département(s) non importé(s) car ils existaient déjà.`,
          type: 'info',
        })
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Import réussi',
          message: `${uniqueData.length} département(s) ont été importés avec succès.`,
          type: 'info',
        })
      }
    } catch (error) {
      console.error("Erreur lors de l'import:", error)
      setAlertModal({
        isOpen: true,
        title: "Erreur lors de l'import",
        message: "Une erreur est survenue lors de l'import des données.",
        type: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddDepartement = async (formData: DepartementFormData) => {
    try {
      setActionLoading('add')

      // Vérification des doublons avant ajout (sans vérifier l'ID)
      const normalizedNom = formData.nom.toLowerCase().trim()
      const normalizedPrefix = formData.prefixMatricule.toLowerCase().trim()

      const isDuplicate = data.some(
        (dept) =>
          dept.nom.toLowerCase().trim() === normalizedNom ||
          dept.prefixMatricule.toLowerCase().trim() === normalizedPrefix
      )

      if (isDuplicate) {
        setAlertModal({
          isOpen: true,
          title: 'Doublon détecté',
          message: 'Un département avec le même nom ou préfixe matricule existe déjà.',
          type: 'warning',
        })
        throw new Error('Doublon détecté')
      }

      const nouveau = await addDepartement(formData)
      setData((prev) => [...prev, nouveau])
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      throw error
    } finally {
      setActionLoading(null)
    }
  }

  const handleEditDepartement = async (formData: DepartementFormData) => {
    if (!editingDepartement) return

    try {
      setActionLoading(`edit-${editingDepartement.id}`)

      // Vérification des doublons avant modification (en excluant l'élément actuel, sans vérifier l'ID)
      const normalizedNom = formData.nom.toLowerCase().trim()
      const normalizedPrefix = formData.prefixMatricule.toLowerCase().trim()

      const isDuplicate = data.some(
        (dept) =>
          dept.id !== editingDepartement.id &&
          (dept.nom.toLowerCase().trim() === normalizedNom ||
            dept.prefixMatricule.toLowerCase().trim() === normalizedPrefix)
      )

      if (isDuplicate) {
        setAlertModal({
          isOpen: true,
          title: 'Doublon détecté',
          message: 'Un autre département avec le même nom ou préfixe matricule existe déjà.',
          type: 'warning',
        })
        throw new Error('Doublon détecté')
      }

      const updated = await updateDepartement(editingDepartement.id, formData)
      setData((prev) => prev.map((dept) => (dept.id === editingDepartement.id ? updated : dept)))
    } catch (error) {
      console.error('Erreur lors de la modification:', error)
      throw error
    } finally {
      setActionLoading(null)
    }
  }

  const openDeleteDialog = (departement: Departement) => {
    setDepartementToDelete(departement)
    setDeleteDialogOpen(true)
  }

  const handleDeleteDepartement = async () => {
    if (!departementToDelete) return

    try {
      setActionLoading(`delete-${departementToDelete.id}`)
      await deleteDepartement(departementToDelete.id)
      setData((prev) => prev.filter((dept) => dept.id !== departementToDelete.id))
      setDeleteDialogOpen(false)
      setDepartementToDelete(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const openEditModal = (departement: Departement) => {
    setEditingDepartement(departement)
    setModalOpen(true)
  }

  useEffect(() => {
    const openerForm = searchParams.get('add_mdala_open')
    if (openerForm) {
      setEditingDepartement(null)
      setModalOpen(true)
    }
  }, [searchParams])

  const closeModal = () => {
    if (searchParams.get('add_mdala_open')) {
      navigate('/departements', { replace: true })
    }
    setEditingDepartement(null)
    setModalOpen(false)
  }

  // ===== Configuration des colonnes avec tri =====
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: ({ row }: { row: { index: number } }) => row.index + 1,
      },
      {
        accessorKey: 'nom',
        header: ({ column }: { column: any }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Nom
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: 'descriptions',
        header: 'Description',
      },
      {
        accessorKey: 'prefixMatricule',
        header: ({ column }: { column: any }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Préfixe matricule
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: { row: { original: Departement } }) => (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditModal(row.original)}
              disabled={actionLoading !== null}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              {actionLoading === `edit-${row.original.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDeleteDialog(row.original)}
              disabled={actionLoading !== null}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
            >
              {actionLoading === `delete-${row.original.id}` ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        ),
      },
    ],
    [actionLoading]
  )

  const table = useReactTable({
    data: filteredAndSortedData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-10">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Départements</h1>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={exportToExcel}
              disabled={loading || data.length === 0}
              className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </Button>

            <Button
              variant="outline"
              onClick={exportToERA}
              disabled={loading || data.length === 0}
              className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              <Download className="h-4 w-4" />
              <span>Human Studio</span>
            </Button>

            <label htmlFor="file-import" className="cursor-pointer">
              <Button
                variant="outline"
                disabled={loading}
                onClick={() => importRef.current?.click()}
                className="flex items-center space-x-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                <Upload className="h-4 w-4" />
                <span>Importer (Human Studio)</span>
              </Button>
              <Input
                ref={importRef}
                id="file-import"
                type="file"
                accept=".era"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>

            <Button
              onClick={() => setModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Ajouter
            </Button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un département..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-neutral-700/50 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400" />
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-neutral-700/50 border border-gray-200 dark:border-gray-700 rounded-lg">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id} className="bg-gray-50 dark:bg-neutral-700/50">
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-gray-700 dark:text-gray-300">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {searchTerm ? 'Aucun département trouvé pour votre recherche' : 'Aucun département trouvé'}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-gray-900 dark:text-white">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Modal d'ajout/édition */}
        <DepartementModal
          isOpen={modalOpen}
          onClose={closeModal}
          onSubmit={editingDepartement ? handleEditDepartement : handleAddDepartement}
          isLoading={actionLoading !== null}
          initialData={editingDepartement}
        />

        {/* Modal de prévisualisation pour l'import */}
        <PreviewModal
          isOpen={previewModalOpen}
          onClose={() => {
            setPreviewModalOpen(false)
            setImportData([])
            setFileInfo(null)
          }}
          onConfirm={handleImportConfirm}
          data={importData}
          isLoading={actionLoading === 'import'}
          fileInfo={fileInfo || undefined}
        />

        {/* Modal d'alerte HTML */}
        <AlertModal
          isOpen={alertModal.isOpen}
          onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
        />

        {/* AlertDialog pour la suppression */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <AlertDialogHeader>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <AlertDialogTitle className="text-gray-900 dark:text-white">Supprimer le département</AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                Êtes-vous sûr de vouloir supprimer le département{' '}
                <strong className="text-gray-900 dark:text-white">{departementToDelete?.nom}</strong> ?
                <br />
                <span className="text-red-600 dark:text-red-400 font-medium">Cette action est irréversible.</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                disabled={actionLoading !== null}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
              >
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteDepartement}
                disabled={actionLoading !== null}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
              >
                {actionLoading === `delete-${departementToDelete?.id}` ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
