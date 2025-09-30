import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/app/components/ui/label'
import { CardContent } from '@/app/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table'
import { Badge } from '@/app/components/ui/badge'
import { Textarea } from '@/app/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select'
import { Trash2, Edit, Plus, Download, Upload, Search, X } from 'lucide-react'
import { useConveyor } from '@/app/hooks/use-conveyor'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { Departement } from '@/lib/database/models/recutement/departemen'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AlertModal, AlertModalProps } from '@/app/components/ui/AlertMoadale'

export interface Domaine {
  id?: number
  departementId: string
  name: string
  description?: string
}

interface EraFileData {
  createdAt: string
  auteur: string
  data_type: string
  datas: Domaine[]
}

interface AlertModalState {
  isOpen: boolean
  title: string
  message: string
  type: 'error' | 'warning' | 'info' | 'success'
  actions?: {
    label: string
    onClick: () => void
    buttonType?: 'default' | 'destructive' | 'succed'
  }[]
}

export default function Domaines() {
  const { addDomaine, getDomaines, deleteDomaine, updateDomaine, getDepartements } = useConveyor('app')

  const [domaines, setDomaines] = useState<Domaine[]>([])
  const [filteredDomaines, setFilteredDomaines] = useState<Domaine[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingDomaine, setEditingDomaine] = useState<Domaine | null>(null)
  const [loading, setLoading] = useState(false)
  const [departements, setDepartements] = useState<Departement[]>([])
  const [importedData, setImportedData] = useState<Domaine[]>([])
  const [duplicates, setDuplicates] = useState<number[]>([])
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string }>({ name: '', type: '' })
  const [alertModal, setAlertModal] = useState<AlertModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  })

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const openerForm = searchParams.get('add_mdala_open')
    if (openerForm) {
      setIsAddDialogOpen(true)
    }
  }, [searchParams])

  const [formData, setFormData] = useState({
    departementId: '',
    name: '',
    description: '',
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Fonction pour afficher les alertes
  const showAlert = (
    title: string,
    message: string,
    type: 'error' | 'warning' | 'info' | 'success',
    actions?: { label: string; onClick: () => void; buttonType?: 'default' | 'destructive' | 'succed' }[]
  ) => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type,
      actions: actions || [{ label: 'Fermer', onClick: closeAlert, buttonType: 'succed' }],
    })
  }

  const closeAlert = () => {
    setAlertModal((prev) => ({ ...prev, isOpen: false }))
  }

  useEffect(() => {
    loadDomaines()
    loadDepartements()
  }, [])

  const loadDepartements = async () => {
    try {
      const data = await getDepartements()
      setDepartements(data.filter((dep) => dep.nom))
    } catch {
      showAlert('Erreur de chargement', 'Une erreur est survenue lors du chargement des départements.', 'error', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
    }
  }

  const loadDomaines = async () => {
    try {
      setLoading(true)
      const data = await getDomaines()
      setDomaines(data)
      setFilteredDomaines(data)
    } catch {
      showAlert('Erreur de chargement', 'Une erreur est survenue lors du chargement des domaines.', 'error', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
    } finally {
      setLoading(false)
    }
  }

  // Recherche
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!term.trim()) {
      setFilteredDomaines(domaines)
      return
    }

    const filtered = domaines.filter(
      (d) =>
        d.name.toLowerCase().includes(term.toLowerCase()) ||
        d.description?.toLowerCase().includes(term.toLowerCase()) ||
        d.departementId.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredDomaines(filtered)
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}
    if (!formData.departementId) newErrors.departementId = 'Le département est requis'
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const resetForm = () => {
    setFormData({ departementId: '', name: '', description: '' })
    setErrors({})
  }

  const handleAdd = async () => {
    if (!validateForm()) return

    const departementId = formData.departementId
    if (!departementId) {
      showAlert('Champ manquant', 'Veuillez sélectionner un département avant de continuer.', 'warning', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
      return
    }

    try {
      setLoading(true)
      const newDomaine: Domaine = {
        name: formData.name.trim(),
        description: formData.description.trim() || '',
        departementId: departementId || 'Non fourni',
      }

      await addDomaine(newDomaine)
      await loadDomaines()
      setIsAddDialogOpen(false)
      if (searchParams.get('add_mdala_open')) {
        navigate('/specialite', { replace: true })
      }
      resetForm()
      toast.success('Domaine ajouté avec succès')
    } catch {
      showAlert("Erreur d'ajout", "Impossible d'ajouter le domaine. Veuillez réessayer.", 'error', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!validateForm() || !editingDomaine) return

    const departementId = formData.departementId
    if (!departementId) {
      showAlert('Champ manquant', 'Veuillez sélectionner un département avant de continuer.', 'warning', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
      return
    }

    try {
      setLoading(true)
      const updateDomaineData: Domaine = {
        ...editingDomaine,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        departementId,
      }
      await updateDomaine(updateDomaineData)
      await loadDomaines()
      setIsEditDialogOpen(false)
      setEditingDomaine(null)
      resetForm()
      toast.success('Domaine modifié avec succès')
    } catch {
      showAlert('Erreur de modification', 'Impossible de modifier le domaine. Veuillez réessayer.', 'error', [
        { label: 'Fermer', onClick: closeAlert, buttonType: 'succed' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: number) => {
    showAlert(
      'Confirmation de suppression',
      'Êtes-vous sûr de vouloir supprimer ce domaine ? Cette action est irréversible.',
      'warning',
      [
        {
          label: 'Annuler',
          onClick: closeAlert,
        },
        {
          label: 'Supprimer',
          buttonType: 'destructive',
          onClick: async () => {
            try {
              setLoading(true)
              await deleteDomaine(id)
              await loadDomaines()
              closeAlert()
              toast.success('Domaine supprimé avec succès')
            } catch {
              showAlert('Erreur de suppression', 'Impossible de supprimer le domaine. Veuillez réessayer.', 'error')
            } finally {
              setLoading(false)
            }
          },
        },
      ]
    )
  }

  const openEditDialog = (domaine: Domaine) => {
    setEditingDomaine(domaine)
    setFormData({
      departementId: domaine.departementId,
      name: domaine.name,
      description: domaine.description || '',
    })
    setIsEditDialogOpen(true)
  }

  // Export Excel
  const handleExportExcel = () => {
    try {
      const exportData = filteredDomaines.map((d) => ({
        Département: d.departementId,
        Nom: d.name,
        Description: d.description || '',
      }))
      const ws = XLSX.utils.json_to_sheet(exportData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Domaines')
      XLSX.writeFile(wb, `domaines_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast.success(`${exportData.length} domaines exportés en Excel`)
    } catch {
      showAlert("Erreur d'export", "Impossible d'exporter les données au format Excel.", 'error')
    }
  }

  // Export .era
  const handleExportEra = () => {
    try {
      const eraData: EraFileData = {
        createdAt: new Date().toISOString(),
        auteur: 'admin',
        data_type: 'specialite',
        datas: filteredDomaines,
      }

      const dataStr = JSON.stringify(eraData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `domaines_${new Date().toISOString().split('T')[0]}.era`
      link.click()
      URL.revokeObjectURL(url)

      toast.success(`${filteredDomaines.length} domaines exportés en format .era`)
    } catch {
      showAlert("Erreur d'export", "Impossible d'exporter les données au format .era.", 'error')
    }
  }

  // Vérification de la structure .era
  const isValidEraStructure = (data: any): data is EraFileData => {
    return (
      data &&
      typeof data === 'object' &&
      'createdAt' in data &&
      'auteur' in data &&
      'data_type' in data &&
      'datas' in data &&
      Array.isArray(data.datas) &&
      data.data_type === 'specialite'
    )
  }

  // Vérification de la structure d'un domaine
  const isValidDomaineStructure = (data: any): data is Domaine => {
    return (
      data &&
      typeof data === 'object' &&
      'departementId' in data &&
      'name' in data &&
      typeof data.departementId === 'string' &&
      typeof data.name === 'string'
    )
  }

  // Détection des doublons
  const detectDuplicates = (data: Domaine[], existingData: Domaine[] = domaines) => {
    const duplicates: number[] = []
    const uniqueKeys = new Set()

    data.forEach((item, index) => {
      const key = `${item.name.toLowerCase()}_${item.departementId.toLowerCase()}`
      const existsInExisting = existingData.some(
        (d) =>
          d.name.toLowerCase() === item.name.toLowerCase() &&
          d.departementId.toLowerCase() === item.departementId.toLowerCase()
      )

      if (uniqueKeys.has(key) || existsInExisting) {
        duplicates.push(index)
      } else {
        uniqueKeys.add(key)
      }
    })

    return duplicates
  }

  // Import de fichiers
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    setFileInfo({ name: file.name, type: fileExtension || '' })

    if (fileExtension !== 'era') {
      showAlert(
        'Format de fichier non supporté',
        "Seuls les fichiers <strong>.era</strong> sont acceptés pour l'importation.",
        'error'
      )
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const jsonData = JSON.parse(content)

        if (!isValidEraStructure(jsonData)) {
          showAlert(
            'Structure de fichier invalide',
            'Le fichier .era ne respecte pas la structure attendue. Veuillez vérifier le format du fichier.',
            'error'
          )
          return
        }

        if (jsonData.data_type !== 'specialite') {
          showAlert(
            'Type de données incorrect',
            `Type de données incorrect. Attendu: <strong>specialite</strong>, Reçu: <strong>${jsonData.data_type}</strong>`,
            'error'
          )
          return
        }

        const validData: Domaine[] = []
        const invalidIndexes: number[] = []

        jsonData.datas.forEach((item: any, index: number) => {
          if (!isValidDomaineStructure(item)) {
            invalidIndexes.push(index)
          } else {
            validData.push(item)
          }
        })

        if (validData.length === 0) {
          showAlert(
            'Aucune donnée valide',
            "Aucune donnée valide n'a été trouvée dans le fichier. Vérifiez la structure des données.",
            'error'
          )
          return
        }

        if (invalidIndexes.length > 0) {
          showAlert(
            'Données invalides détectées',
            `${invalidIndexes.length} élément(s) invalide(s) ont été ignorés. Seules les données valides seront importées.`,
            'warning'
          )
        }

        const duplicateIndexes = detectDuplicates(validData)
        setDuplicates(duplicateIndexes)
        setImportedData(validData)
        setIsPreviewDialogOpen(true)

        if (duplicateIndexes.length > 0) {
          showAlert(
            'Doublons détectés',
            `${duplicateIndexes.length} doublon(s) détecté(s). Vous pouvez les vérifier dans la prévisualisation avant l'importation.`,
            'warning'
          )
        } else {
          showAlert(
            "Prêt pour l'importation",
            `${validData.length} domaine(s) valide(s) prêt(s) à l'importation.`,
            'info'
          )
        }
      } catch (error) {
        showAlert(
          'Erreur de lecture',
          "Une erreur est survenue lors de la lecture du fichier .era. Vérifiez que le fichier n'est pas corrompu.",
          'error'
        )
      }
    }

    reader.onerror = () => {
      showAlert(
        'Erreur de lecture',
        'Impossible de lire le fichier. Vérifiez que le fichier est accessible et non corrompu.',
        'error'
      )
    }

    reader.readAsText(file)
    event.target.value = ''
  }

  // Supprimer un élément de la prévisualisation
  const removeFromPreview = (index: number) => {
    setImportedData((prev) => prev.filter((_, i) => i !== index))
    setDuplicates((prev) => prev.filter((i) => i !== index).map((i) => (i > index ? i - 1 : i)))
  }

  // Finaliser l'importation
  const finalizeImport = async () => {
    if (importedData.length === 0) {
      showAlert('Aucune donnée à importer', "Il n'y a aucune donnée valide à importer.", 'warning')
      return
    }

    try {
      setLoading(true)
      let successCount = 0
      let errorCount = 0

      for (const domaine of importedData) {
        try {
          const exists = domaines.some(
            (d) =>
              d.name.toLowerCase() === domaine.name.toLowerCase() &&
              d.departementId.toLowerCase() === domaine.departementId.toLowerCase()
          )

          if (!exists) {
            await addDomaine(domaine)
            successCount++
          } else {
            errorCount++
          }
        } catch {
          errorCount++
        }
      }

      await loadDomaines()
      setIsPreviewDialogOpen(false)
      setImportedData([])
      setDuplicates([])

      if (successCount > 0) {
        toast.success(`${successCount} domaine(s) importé(s) avec succès`)
      }
      if (errorCount > 0) {
        showAlert(
          'Importation partielle',
          `${successCount} domaine(s) importé(s) avec succès, ${errorCount} erreur(s) (doublons ou autres problèmes).`,
          successCount > 0 ? 'warning' : 'error'
        )
      }
    } catch {
      showAlert("Erreur d'importation", "Une erreur est survenue lors de l'importation des données.", 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 pt-12 bg-accent h-screen dark:bg-neutral-900">
      {/* Composant AlertModal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        actions={alertModal.actions}
      />

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Spécialités</h1>
          <p className="text-muted-foreground">Gérez les domaines de spécialité par département</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={filteredDomaines.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" onClick={handleExportEra} disabled={filteredDomaines.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export .era
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-file')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <input id="import-file" type="file" accept=".era" onChange={handleImport} className="hidden" />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={
                  'bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white cursor-pointer'
                }
                disabled={departements.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3  top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par nom, département ou description..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 pr-4 py-2 w-3xl bg-white/80 dark:bg-neutral-700/50"
        />
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-neutral-700/50 rounded-lg shadow">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center">Chargement...</div>
          ) : filteredDomaines.length === 0 ? (
            <div className="p-8 text-center">
              {domaines.length === 0 ? 'Aucun domaine créé' : 'Aucun domaine trouvé'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomaines.map((d, index) => (
                  <TableRow key={d.id}>
                    <TableCell className="pl-10">{index + 1}</TableCell>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>
                      <div>{d.departementId}</div>
                    </TableCell>
                    <TableCell>{d.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(d)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => d.id && handleDelete(d.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </div>

      {/* Dialog Ajout */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un domaine</DialogTitle>
            <DialogDescription>Créez un nouveau domaine pour un département</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Département *</Label>
              <Select
                value={formData.departementId}
                onValueChange={(value) => handleInputChange('departementId', value)}
              >
                <SelectTrigger className="w-full my-2">
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                <SelectContent>
                  {departements.map((dep) => (
                    <SelectItem key={dep.id} value={dep.nom!}>
                      {dep.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departementId && <p className="text-sm text-destructive">{errors.departementId}</p>}
            </div>
            <div>
              <Label>Nom *</Label>
              <Input
                className="my-2"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                className="my-2"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (searchParams.get('add_mdala_open')) {
                  navigate('/specialite', { replace: true })
                }
                setIsAddDialogOpen(false)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAdd}
              disabled={loading}
              className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-800 text-white cursor-pointer"
            >
              {loading ? 'Ajout...' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Modification */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le domaine</DialogTitle>
            <DialogDescription>Modifiez les informations du domaine</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Département *</Label>
              <Select
                value={formData.departementId}
                onValueChange={(value) => handleInputChange('departementId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                <SelectContent>
                  {departements.map((dep) => (
                    <SelectItem key={dep.id} value={dep.nom!}>
                      {dep.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.departementId && <p className="text-sm text-destructive">{errors.departementId}</p>}
            </div>
            <div>
              <Label>Nom *</Label>
              <Input value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEdit} disabled={loading}>
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Prévisualisation Import */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Prévisualisation de l'importation</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <div>
                  Fichier: <strong>{fileInfo.name}</strong>
                </div>
                <div>
                  Domaines à importer: <strong>{importedData.length}</strong>
                </div>
                {duplicates.length > 0 && (
                  <div className="text-destructive">
                    Doublons détectés: <strong>{duplicates.length}</strong>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Département</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedData.map((domaine, index) => (
                  <TableRow key={index} className={duplicates.includes(index) ? 'bg-destructive/10' : ''}>
                    <TableCell>
                      {duplicates.includes(index) ? (
                        <Badge variant="destructive">Doublon</Badge>
                      ) : (
                        <Badge variant="secondary">Nouveau</Badge>
                      )}
                    </TableCell>
                    <TableCell>{domaine.name}</TableCell>
                    <TableCell>{domaine.departementId}</TableCell>
                    <TableCell>{domaine.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => removeFromPreview(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {importedData.length - duplicates.length} domaine(s) unique(s) prêt(s) à l'importation
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreviewDialogOpen(false)
                  setImportedData([])
                  setDuplicates([])
                }}
              >
                Annuler
              </Button>
              <Button onClick={finalizeImport} disabled={loading || importedData.length === 0}>
                {loading ? 'Importation...' : `Importer (${importedData.length - duplicates.length})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
