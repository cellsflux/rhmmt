'use client'

import type React from 'react'
import { useState, useRef, useEffect } from 'react'
import { Card } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Plus, Trash2, X, Save, ChevronLeft, Loader2, Upload, Camera, AlertCircle } from 'lucide-react'
import { InputField, SelectField } from './Form'
import { AlertModal } from '@/app/components/ui/alert-modal'
import { useConveyor } from '../hooks/use-conveyor'
import { Departement } from '@/lib/database/models/recutement/departemen'
import { Domaine } from '@/lib/database/models/recutement/domaine'
import { Agent } from '@/lib/database/models/recutement/agent'

// Composant FileUpload amélioré avec prévisualisation (inchangé)
interface FileUploadProps {
  label: string
  file: string
  onChange: (file: string) => void
  aspectRatio?: string
  className?: string
  required?: boolean
  error?: string
}

function FileUploadWithPreview({
  label,
  file,
  onChange,
  aspectRatio = 'aspect-square',
  className = '',
  required = false,
  error = '',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          onChange(e.target?.result as string)
        }
        reader.readAsDataURL(selectedFile)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        onChange(e.target?.result as string)
      }
      reader.readAsDataURL(droppedFile)
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-xl transition-all duration-200
          ${
            error
              ? 'border-red-500 bg-red-50'
              : isDragging
                ? 'border-blue-500 bg-blue-50 scale-105'
                : file
                  ? 'border-green-500'
                  : 'border-slate-300 hover:border-slate-400'
          }
          ${aspectRatio} flex items-center justify-center cursor-pointer
          group overflow-hidden
        `}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

        {file ? (
          <>
            <img
              src={file || '/placeholder.svg'}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={removeImage}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
              <Upload className="h-6 w-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-600">Cliquer ou glisser-déposer</p>
              <p className="text-xs text-slate-500">PNG, JPG, JPEG (max. 5MB)</p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}

// Interface pour les props
interface AddAgentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddAgent: (agentData: any) => void
  onUpdateAgent?: (agentData: any) => void
  editingAgent?: Agent | null
  isEditing?: boolean
}

export function AddAgentForm({
  open,
  onOpenChange,
  onAddAgent,
  onUpdateAgent,
  editingAgent,
  isEditing = false,
}: AddAgentFormProps) {
  const { getDepartements, getDomaines } = useConveyor('app')

  const [departements, setDepartements] = useState<Departement[]>([])
  const [domaines, setDomaines] = useState<Domaine[]>([])
  const [filteredDomaines, setFilteredDomaines] = useState<Domaine[]>([])

  const loadDepartementsAndDomaines = async () => {
    const departementsData = await getDepartements()
    const domainesData = await getDomaines()
    setDepartements(departementsData)
    setDomaines(domainesData)

    // Filtrer les domaines basé sur le département sélectionné (si en mode édition)
    if (isEditing && editingAgent?.departement?.name) {
      const filtered = domainesData.filter((domaine) => domaine.departementId === editingAgent.departement.name)
      setFilteredDomaines(filtered)
    }
  }

  useEffect(() => {
    loadDepartementsAndDomaines()
  }, [])

  const [formData, setFormData] = useState<Agent>({
    // Informations de base
    matricule: '',
    nom: '',
    postnom: '',
    prenom: '',
    genre: 'M',
    email: '',
    telephone: '',
    devise: 'CDF' as const,

    // Informations personnelles
    brithday: '',
    brithplace: '',
    adresse: { ville: '', commune: '', quartier: '', avenue: '', numero: '' },
    pere: '',
    mere: '',
    etatcivil: 'celibataire' as const,
    nationalite: 'Congolaise',
    nomduconjoint: '',
    nombre_enfants: 0,
    enfants: [],

    // Personne d'urgence
    personneUrgence: { nom: '', prenom: '', telephone: '', relationShip: '' },

    // Pièces d'identité
    carteIdentite: [{ carteType: 'cartedelecteur' as const, numero: '', nomdedelacarte: '' }],

    // Habillement
    habillement: { booteTaille: '', tshartTaille: '' },

    // Banque
    banque: { nom: '', numeroCompte: '' },

    // Contrat et emploi
    typeContrat: 'cdi' as const,
    dateDebutContrat: '',
    dateFinContrat: '',
    poste_ocuper: { id: 0, name: '' },
    periode_essai: '3 mois',
    saleaire: { montant: 0, type: 'mensuelle' as const },
    departement: { id: 0, name: '' },

    // Éducation et expérience
    nuvieau_etudes: 'licence' as const,
    anne_experience: 0,

    // CNCSS et NIF
    cncss: '',
    nif: '',

    // Fichiers
    image: '',
    signature: '',
    cardIdentiteImage: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const totalSteps = 5

  const [alertModal, setAlertModal] = useState({
    open: false,
    title: '',
    description: '',
    type: 'warning' as const,
    onConfirm: () => {},
  })

  const [allowSubmit, setAllowSubmit] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Règles de validation pour chaque étape
  const validationRules = {
    step1: {
      nom: { required: true, message: 'Le nom est obligatoire' },
      postnom: { required: true, message: 'Le postnom est obligatoire' },
      prenom: { required: true, message: 'Le prénom est obligatoire' },
      genre: { required: true, message: 'Le genre est obligatoire' },
      nationalite: { required: true, message: 'La nationalité est obligatoire' },
    },
    step2: {
      telephone: { required: true, message: 'Le téléphone est obligatoire' },
    },
    step3: {
      etatcivil: { required: true, message: "L'état civil est obligatoire" },
      'personneUrgence.nom': { required: true, message: "Le nom de la personne d'urgence est obligatoire" },
      'personneUrgence.telephone': { required: true, message: "Le téléphone de la personne d'urgence est obligatoire" },
      'personneUrgence.relationShip': { required: true, message: 'La relation est obligatoire' },
    },
    step4: {
      periode_essai: { required: true, message: "La période d'essai est obligatoire" },
      nuvieau_etudes: { required: true, message: "Le niveau d'études est obligatoire" },
    },
    step5: {
      'habillement.booteTaille': { required: true, message: 'La taille des bottes est obligatoire' },
      'habillement.tshartTaille': { required: true, message: 'La taille du T-shirt est obligatoire' },
    },
  }

  // Fonction de validation pour une étape spécifique
  const validateStep = (step: number): boolean => {
    const stepKey = `step${step}` as keyof typeof validationRules
    const rules = validationRules[stepKey]
    const newErrors: Record<string, string> = {}

    if (rules) {
      Object.entries(rules).forEach(([field, rule]) => {
        if (rule.required) {
          // Gestion des champs imbriqués
          if (field.includes('.')) {
            const [parent, child] = field.split('.')
            const value = formData[parent]?.[child]
            if (!value || value.toString().trim() === '') {
              newErrors[field] = rule.message
            }
          } else {
            const value = formData[field]
            if (!value || (typeof value === 'string' && value.trim() === '') || value === 0) {
              newErrors[field] = rule.message
            }
          }
        }
      })
    }

    // Validation spéciale pour les pièces d'identité à l'étape 5
    if (step === 5) {
      if (formData.carteIdentite.length === 0) {
        newErrors['carteIdentite'] = "Au moins une pièce d'identité est requise"
      } else {
        formData.carteIdentite.forEach((ci, index) => {
          if (!ci.numero || ci.numero.trim() === '') {
            newErrors[`carteIdentite.${index}.numero`] = 'Le numéro de la pièce est obligatoire'
          }
          if (ci.carteType === 'autre' && (!ci.nomdedelacarte || ci.nomdedelacarte.trim() === '')) {
            newErrors[`carteIdentite.${index}.nomdedelacarte`] =
              'Le nom de la carte est obligatoire pour le type "Autre"'
          }
        })
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Effet pour charger les données de l'agent en mode édition
  useEffect(() => {
    if (isEditing && editingAgent) {
      setFormData({
        matricule: editingAgent.matricule || '',
        nom: editingAgent.nom || '',
        postnom: editingAgent.postnom || '',
        prenom: editingAgent.prenom || '',
        genre: editingAgent.genre || 'M',
        email: editingAgent.email || '',
        telephone: editingAgent.telephone || '',
        devise: editingAgent.devise || 'CDF',
        brithday: editingAgent.brithday || '',
        brithplace: editingAgent.brithplace || '',
        adresse: editingAgent.adresse || { ville: '', commune: '', quartier: '', avenue: '', numero: '' },
        pere: editingAgent.pere || '',
        mere: editingAgent.mere || '',
        etatcivil: editingAgent.etatcivil || 'celibataire',
        nationalite: editingAgent.nationalite || 'Congolaise',
        nomduconjoint: editingAgent.nomduconjoint || '',
        nombre_enfants: editingAgent.nombre_enfants || 0,
        personneUrgence: editingAgent.personneUrgence || { nom: '', prenom: '', telephone: '', relationShip: '' },
        carteIdentite: editingAgent.carteIdentite || [{ carteType: 'cartedelecteur', numero: '', nomdedelacarte: '' }],
        habillement: editingAgent.habillement || { booteTaille: '', tshartTaille: '' },
        banque: editingAgent.banque || { nom: '', numeroCompte: '' },
        typeContrat: editingAgent.typeContrat || 'cdi',
        dateDebutContrat: editingAgent.dateDebutContrat || '',
        dateFinContrat: editingAgent.dateFinContrat || '',
        poste_ocuper: editingAgent.poste_ocuper || { id: 0, name: '' },
        periode_essai: editingAgent.periode_essai || '3 mois',
        saleaire: editingAgent.saleaire || { montant: 0, type: 'mensuelle' },
        departement: editingAgent.departement || { id: 0, name: '' },
        enfants: editingAgent.enfants || [],
        nuvieau_etudes: editingAgent.nuvieau_etudes || 'licence',
        anne_experience: editingAgent.anne_experience || 0,
        cncss: editingAgent.cncss || '',
        nif: editingAgent.nif || '',
        image: editingAgent.image || '',
        signature: editingAgent.signature || '',
        cardIdentiteImage: editingAgent.cardIdentiteImage || '',
      })
    }
  }, [isEditing, editingAgent])

  // Gestionnaires de changement avec gestion des erreurs et détection de modifications
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
    // Marquer qu'il y a des modifications en mode édition
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }))
    // Effacer l'erreur quand l'utilisateur commence à taper
    const errorKey = `${parent}.${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
    // Marquer qu'il y a des modifications en mode édition
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const handleArrayChange = (arrayName: string, index: number, field: string, value: any) => {
    const newArray = [...formData[arrayName]]
    newArray[index] = { ...newArray[index], [field]: value }
    setFormData((prev) => ({ ...prev, [arrayName]: newArray }))
    // Effacer l'erreur quand l'utilisateur commence à taper
    const errorKey = `${arrayName}.${index}.${field}`
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: '' }))
    }
    // Marquer qu'il y a des modifications en mode édition
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const addArrayItem = (arrayName: string, defaultValue: any) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...prev[arrayName], defaultValue],
    }))
    // Effacer l'erreur générale sur le tableau
    if (errors[arrayName]) {
      setErrors((prev) => ({ ...prev, [arrayName]: '' }))
    }
    // Marquer qu'il y a des modifications en mode édition
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const removeArrayItem = (arrayName: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }))
    // Revalider si le tableau est vide
    if (formData[arrayName].length === 1) {
      setTimeout(() => validateStep(currentStep), 100)
    }
    // Marquer qu'il y a des modifications en mode édition
    if (isEditing) {
      setHasChanges(true)
    }
  }

  // Gestion du changement de département - filtre les domaines
  const handleDepartementChange = (value: string) => {
    const selectedDepartement = departements.find((dep) => dep.nom === value)
    if (selectedDepartement) {
      handleNestedChange('departement', 'name', value)
      handleNestedChange('departement', 'id', selectedDepartement.id || 0)

      // Filtrer les domaines par département sélectionné
      const filtered = domaines.filter((domaine) => domaine.departementId === value)
      setFilteredDomaines(filtered)

      // Réinitialiser le poste sélectionné
      handleNestedChange('poste_ocuper', 'id', 0)
      handleNestedChange('poste_ocuper', 'name', '')
    }
  }

  // Gestion du changement de poste
  const handlePosteChange = (value: string) => {
    const selectedDomaine = filteredDomaines.find((domaine) => domaine.name === value)
    if (selectedDomaine) {
      handleNestedChange('poste_ocuper', 'name', value)
      handleNestedChange('poste_ocuper', 'id', selectedDomaine.id)
    }
  }

  // Navigation entre les étapes avec validation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
      setAllowSubmit(false)
    } else {
      // Scroll vers le haut pour voir les erreurs
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
    // Effacer les erreurs quand on revient en arrière
    setErrors({})
    setAllowSubmit(false)
  }

  // Réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      matricule: '',
      nom: '',
      postnom: '',
      prenom: '',
      genre: 'M',
      email: '',
      telephone: '',
      devise: 'CDF',
      brithday: '',
      brithplace: '',
      adresse: { ville: '', commune: '', quartier: '', avenue: '', numero: '' },
      pere: '',
      mere: '',
      etatcivil: 'celibataire',
      nationalite: 'Congolaise',
      nomduconjoint: '',
      nombre_enfants: 0,
      personneUrgence: { nom: '', prenom: '', telephone: '', relationShip: '' },
      carteIdentite: [{ carteType: 'cartedelecteur', numero: '', nomdedelacarte: '' }],
      habillement: { booteTaille: '', tshartTaille: '' },
      banque: { nom: '', numeroCompte: '' },
      typeContrat: 'cdi',
      dateDebutContrat: '',
      dateFinContrat: '',
      poste_ocuper: { id: 0, name: '' },
      periode_essai: '3 mois',
      saleaire: { montant: 0, type: 'mensuelle' },
      departement: { id: 0, name: '' },
      enfants: [],
      nuvieau_etudes: 'licence',
      anne_experience: 0,
      cncss: '',
      nif: '',
      image: '',
      signature: '',
      cardIdentiteImage: '',
    })
    setCurrentStep(1)
    setErrors({})
    setAllowSubmit(false)
    setHasChanges(false)
    setFilteredDomaines([])
  }

  // Fermeture du formulaire
  const handleClose = () => {
    resetForm()
    onOpenChange(false)
  }

  // Soumission du formulaire avec validation finale
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!allowSubmit) {
      return
    }

    // Validation finale de toutes les étapes
    let allStepsValid = true
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allStepsValid = false
        if (step < currentStep) {
          setCurrentStep(step) // Revenir à l'étape avec erreur
        }
        break
      }
    }

    if (!allStepsValid) {
      // Show error message using alert modal
      setAlertModal({
        open: true,
        title: 'Formulaire incomplet',
        description: 'Veuillez corriger toutes les erreurs avant de soumettre le formulaire.',
        type: 'error',
        onConfirm: () => {},
      })
      setAllowSubmit(false)
      return
    }

    setIsSubmitting(true)

    try {
      // Simulation d'une requête API
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Transformation des données pour correspondre à l'interface Agent
      const agentData = {
        ...formData,
        // Inclure l'ID si en mode édition
        ...(isEditing && editingAgent?.id && { id: editingAgent.id }),
      }

      // Appel de la fonction appropriée selon le mode
      if (isEditing && onUpdateAgent) {
        onUpdateAgent(agentData)
      } else {
        onAddAgent(agentData)
      }

      // Réinitialisation et fermeture
      resetForm()
      onOpenChange(false)

      setAlertModal({
        open: true,
        title: 'Opération réussie',
        description: `L'agent a été ${isEditing ? 'modifié' : 'ajouté'} avec succès.`,
        type: 'success',
        onConfirm: () => {},
      })
    } catch (error) {
      console.error("Erreur lors de l'ajout/modification de l'agent:", error)
      // Show error message using alert modal
      setAlertModal({
        open: true,
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'opération.",
        type: 'error',
        onConfirm: () => {},
      })
    } finally {
      setIsSubmitting(false)
      setAllowSubmit(false)
      setHasChanges(false)
    }
  }

  const handleSubmitClick = () => {
    setAllowSubmit(true)
    // Le formulaire sera soumis via l'événement onSubmit
  }

  // Fonction utilitaire pour obtenir l'erreur d'un champ
  const getFieldError = (fieldName: string): string => {
    return errors[fieldName] || ''
  }

  // Gestion des enfants
  const handleEnfantChange = (index: number, field: string, value: string) => {
    const newEnfants = [...formData.enfants]
    newEnfants[index] = { ...newEnfants[index], [field]: value }
    setFormData((prev) => ({ ...prev, enfants: newEnfants }))
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const addEnfant = () => {
    const newEnfant = {
      nom: '',
      postnom: '',
      prenom: '',
      brithday: '',
      brithplace: '',
    }
    setFormData((prev) => ({
      ...prev,
      enfants: [...prev.enfants, newEnfant],
    }))
    if (isEditing) {
      setHasChanges(true)
    }
  }

  const removeEnfant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      enfants: prev.enfants.filter((_, i) => i !== index),
    }))
    if (isEditing) {
      setHasChanges(true)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[95vh] overflow-y-auto border-0 shadow-2xl bg-white/95 dark:bg-neutral-800/95 backdrop-blur-lg">
        {/* Header */}

        {/* Steps Indicator */}
        <div className="p-0 px-5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50/80 dark:bg-neutral-700/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Étape {currentStep} sur {totalSteps}
            </span>
            <div className="flex gap-1">
              {[...Array(totalSteps)].map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-12 rounded-full transition-all duration-300 ${
                    i + 1 <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-neutral-900 dark:text-neutral-100 hover:bg-white/20 dark:hover:bg-neutral-600/20 rounded-lg cursor-pointer h-10 w-10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            {currentStep === 1 && '📋 Informations Personnelles'}
            {currentStep === 2 && '📍 Coordonnées et Contact'}
            {currentStep === 3 && '👨‍👩‍👧‍👦 Situation Familiale'}
            {currentStep === 4 && '💼 Contrat & Salaire'}
            {currentStep === 5 && '🏦 Banque, Habillement & Signature'}
          </div>
        </div>

        {/* Affichage des erreurs générales */}
        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg relative">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 font-medium mb-2">
              <AlertCircle className="h-5 w-5" />
              Veuillez corriger les erreurs suivantes avant de continuer :
            </div>
            <ul className="text-red-700 dark:text-red-300 text-sm list-disc list-inside space-y-1">
              {Object.values(errors)
                .filter((error) => error)
                .map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
            </ul>
            <X
              onClick={() => setErrors({})}
              className="absolute top-2 right-2 cursor-pointer text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-8 max-h-[calc(95vh-12rem)] overflow-auto">
          {/* Étape 1 : Informations personnelles */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Matricule"
                    value={formData.matricule}
                    onChange={(val) => handleChange('matricule', val)}
                    placeholder="AG-2024-001"
                  />
                  <InputField
                    label="Nom *"
                    value={formData.nom}
                    onChange={(val) => handleChange('nom', val)}
                    required
                    placeholder="Doe"
                    error={getFieldError('nom')}
                  />
                  <InputField
                    label="Postnom *"
                    value={formData.postnom}
                    onChange={(val) => handleChange('postnom', val)}
                    required
                    placeholder="Smith"
                    error={getFieldError('postnom')}
                  />
                  <InputField
                    label="Prénom *"
                    value={formData.prenom}
                    onChange={(val) => handleChange('prenom', val)}
                    required
                    placeholder="John"
                    error={getFieldError('prenom')}
                  />
                  <SelectField
                    label="Genre *"
                    value={formData.genre}
                    options={[
                      { value: 'M', label: 'Masculin' },
                      { value: 'F', label: 'Féminin' },
                    ]}
                    onChange={(val) => handleChange('genre', val)}
                    error={getFieldError('genre')}
                  />
                  <InputField
                    label="Date de Naissance"
                    type="date"
                    value={formData.brithday}
                    onChange={(val) => handleChange('brithday', val)}
                  />
                  <InputField
                    label="Lieu de Naissance"
                    value={formData.brithplace}
                    onChange={(val) => handleChange('brithplace', val)}
                    placeholder="Kinshasa"
                  />
                  <InputField
                    label="Nationalité *"
                    value={formData.nationalite}
                    onChange={(val) => handleChange('nationalite', val)}
                    required
                    placeholder="Congolaise"
                    error={getFieldError('nationalite')}
                  />
                  <SelectField
                    label="Devise"
                    value={formData.devise}
                    options={[
                      { value: 'CDF', label: 'CDF' },
                      { value: 'USD', label: 'USD' },
                    ]}
                    onChange={(val) => handleChange('devise', val)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <FileUploadWithPreview
                  label="Photo de profil"
                  file={formData.image}
                  onChange={(val) => handleChange('image', val)}
                  aspectRatio="aspect-[1/1]"
                />
                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Format recommandé : JPEG, PNG</p>
                  <p>• Taille max : 5 MB</p>
                  <p>• Ratio conseillé : (1:1)</p>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Coordonnées et contact */}
          {currentStep === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <InputField
                  label="Téléphone *"
                  value={formData.telephone}
                  onChange={(val) => handleChange('telephone', val)}
                  required
                  placeholder="+243 XX XXX XXXX"
                  error={getFieldError('telephone')}
                />
                <InputField
                  label="Email"
                  value={formData.email}
                  type="email"
                  onChange={(val) => handleChange('email', val)}
                  placeholder="john.doe@entreprise.cd"
                />
              </div>

              <div className="space-y-6">
                <h4 className="font-semibold text-slate-800 border-b pb-2">Adresse</h4>
                <div className="grid grid-cols-1 gap-4">
                  <InputField
                    label="Ville"
                    value={formData.adresse.ville}
                    onChange={(val) => handleNestedChange('adresse', 'ville', val)}
                    placeholder="Kinshasa"
                  />
                  <InputField
                    label="Commune"
                    value={formData.adresse.commune}
                    onChange={(val) => handleNestedChange('adresse', 'commune', val)}
                    placeholder="Gombe"
                  />
                  <InputField
                    label="Quartier"
                    value={formData.adresse.quartier}
                    onChange={(val) => handleNestedChange('adresse', 'quartier', val)}
                    placeholder="Centre-ville"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField
                      label="Avenue"
                      value={formData.adresse.avenue}
                      onChange={(val) => handleNestedChange('adresse', 'avenue', val)}
                      placeholder="Boulevard du 30 Juin"
                    />
                    <InputField
                      label="Numéro"
                      value={formData.adresse.numero}
                      onChange={(val) => handleNestedChange('adresse', 'numero', val)}
                      placeholder="N° 123"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3 : Situation familiale */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <SelectField
                    label="État civil *"
                    value={formData.etatcivil}
                    options={[
                      { value: 'celibataire', label: 'Célibataire' },
                      { value: 'marie', label: 'Marié(e)' },
                      { value: 'divorcee', label: 'Divorcé(e)' },
                      { value: 'veuf', label: 'Veuf/Veuve' },
                    ]}
                    onChange={(val) => handleChange('etatcivil', val)}
                    required
                    error={getFieldError('etatcivil')}
                  />

                  {formData.etatcivil === 'marie' && (
                    <InputField
                      label="Nom du conjoint"
                      value={formData.nomduconjoint}
                      onChange={(val) => handleChange('nomduconjoint', val)}
                      placeholder="Nom complet du conjoint"
                    />
                  )}

                  <InputField
                    label="Nombre d'enfants"
                    type="number"
                    value={formData.nombre_enfants}
                    onChange={(val) => handleChange('nombre_enfants', Number.parseInt(val) || 0)}
                    min="0"
                  />

                  <InputField
                    label="Nom du père"
                    value={formData.pere}
                    onChange={(val) => handleChange('pere', val)}
                    placeholder="Nom complet du père"
                  />

                  <InputField
                    label="Nom de la mère"
                    value={formData.mere}
                    onChange={(val) => handleChange('mere', val)}
                    placeholder="Nom complet de la mère"
                  />
                </div>

                <div className="space-y-6">
                  <h4 className="font-semibold text-slate-800 border-b pb-2">Personne d'urgence</h4>
                  <div className="space-y-4">
                    <InputField
                      label="Nom *"
                      value={formData.personneUrgence.nom}
                      onChange={(val) => handleNestedChange('personneUrgence', 'nom', val)}
                      required
                      placeholder="Nom de la personne"
                      error={getFieldError('personneUrgence.nom')}
                    />
                    <InputField
                      label="Prénom"
                      value={formData.personneUrgence.prenom}
                      onChange={(val) => handleNestedChange('personneUrgence', 'prenom', val)}
                      placeholder="Prénom de la personne"
                    />
                    <InputField
                      label="Téléphone *"
                      value={formData.personneUrgence.telephone}
                      onChange={(val) => handleNestedChange('personneUrgence', 'telephone', val)}
                      required
                      placeholder="+243 XX XXX XXXX"
                      error={getFieldError('personneUrgence.telephone')}
                    />
                    <InputField
                      label="Relation *"
                      value={formData.personneUrgence.relationShip}
                      onChange={(val) => handleNestedChange('personneUrgence', 'relationShip', val)}
                      required
                      placeholder="Parent, Conjoint, Ami..."
                      error={getFieldError('personneUrgence.relationShip')}
                    />
                  </div>
                </div>
              </div>

              {/* Section Enfants */}
              {formData.nombre_enfants > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-800 border-b pb-2">Informations des enfants</h4>
                  {formData.enfants.map((enfant, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Enfant {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEnfant(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField
                          label="Nom"
                          value={enfant.nom}
                          onChange={(val) => handleEnfantChange(index, 'nom', val)}
                          placeholder="Nom"
                        />
                        <InputField
                          label="Postnom"
                          value={enfant.postnom}
                          onChange={(val) => handleEnfantChange(index, 'postnom', val)}
                          placeholder="Postnom"
                        />
                        <InputField
                          label="Prénom"
                          value={enfant.prenom}
                          onChange={(val) => handleEnfantChange(index, 'prenom', val)}
                          placeholder="Prénom"
                        />

                        <SelectField
                          label="Genre"
                          value={enfant.gendre}
                          onChange={(val) => handleEnfantChange(index, 'gendre', val)}
                          options={[
                            { value: 'M', label: 'Masculin' },
                            { value: 'F', label: 'Féminin' },
                          ]}
                        />

                        <InputField
                          label="Date de naissance"
                          type="date"
                          value={enfant.brithday}
                          onChange={(val) => handleEnfantChange(index, 'brithday', val)}
                        />
                        <InputField
                          label="Lieu de naissance"
                          value={enfant.brithplace}
                          onChange={(val) => handleEnfantChange(index, 'brithplace', val)}
                          placeholder="Lieu de naissance"
                        />
                      </div>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEnfant}
                    disabled={formData.enfants.length >= formData.nombre_enfants}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un enfant
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Étape 4 : Contrat & Salaire */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <SelectField
                  label="Type de contrat"
                  value={formData.typeContrat}
                  options={[
                    { value: 'cdi', label: 'CDI' },
                    { value: 'cdd', label: 'CDD' },
                    { value: 'durrere', label: 'Durée déterminée' },
                  ]}
                  onChange={(val) => handleChange('typeContrat', val)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Date Début Contrat"
                    type="date"
                    value={formData.dateDebutContrat}
                    onChange={(val) => handleChange('dateDebutContrat', val)}
                  />
                  <InputField
                    label="Date Fin Contrat"
                    type="date"
                    value={formData.dateFinContrat}
                    onChange={(val) => handleChange('dateFinContrat', val)}
                  />
                </div>

                <InputField
                  label="Période d'essai *"
                  value={formData.periode_essai}
                  onChange={(val) => handleChange('periode_essai', val)}
                  required
                  placeholder="3 mois"
                  error={getFieldError('periode_essai')}
                />

                <SelectField
                  label="Département"
                  value={formData.departement.name}
                  options={departements.map((dep) => ({ value: dep.nom, label: dep.nom }))}
                  onChange={handleDepartementChange}
                  placeholder="Sélectionner un département"
                />

                <SelectField
                  label="Poste"
                  value={formData.poste_ocuper.name}
                  options={filteredDomaines.map((domaine) => ({ value: domaine.name, label: domaine.name }))}
                  onChange={handlePosteChange}
                  placeholder={
                    filteredDomaines.length === 0 ? "Sélectionnez d'abord un département" : 'Sélectionner un poste'
                  }
                  disabled={filteredDomaines.length === 0}
                />
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Salaire"
                    type="number"
                    value={formData.saleaire.montant}
                    onChange={(val) => handleNestedChange('saleaire', 'montant', Number.parseFloat(val) || 0)}
                    placeholder="0"
                  />
                  <SelectField
                    label="Type Salaire"
                    value={formData.saleaire.type}
                    options={[
                      { value: 'mensuelle', label: 'Mensuelle' },
                      { value: 'jouranlier', label: 'Journalier' },
                      { value: 'trimestrielle', label: 'Trimestrielle' },
                      { value: 'annuelle', label: 'Annuelle' },
                    ]}
                    onChange={(val) => handleNestedChange('saleaire', 'type', val)}
                  />
                </div>

                <InputField
                  label="Années d'expérience"
                  type="number"
                  value={formData.anne_experience}
                  onChange={(val) => handleChange('anne_experience', Number.parseInt(val) || 0)}
                />

                <SelectField
                  label="Niveau d'études *"
                  value={formData.nuvieau_etudes}
                  options={[
                    { value: 'diplome', label: 'Diplomé' },
                    { value: 'gradue', label: 'Gradué' },
                    { value: 'licence', label: 'Licence' },
                    { value: 'master', label: 'Master' },
                    { value: 'brevet', label: 'Brevet' },
                    { value: 'autre', label: 'Autres' },
                  ]}
                  onChange={(val) => handleChange('nuvieau_etudes', val)}
                  required
                  error={getFieldError('nuvieau_etudes')}
                />
              </div>
            </div>
          )}

          {/* Étape 5 : Banque, Habillement & Signature */}
          {currentStep === 5 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h4 className="font-semibold text-slate-800 border-b pb-2">Informations bancaires</h4>
                <div className="space-y-4">
                  <InputField
                    label="Nom de la banque"
                    value={formData.banque.nom}
                    onChange={(val) => handleNestedChange('banque', 'nom', val)}
                    placeholder="Rawbank, BCDC, etc."
                  />
                  <InputField
                    label="Numéro de compte"
                    value={formData.banque.numeroCompte}
                    onChange={(val) => handleNestedChange('banque', 'numeroCompte', val)}
                    placeholder="1234567890"
                  />
                </div>

                <h4 className="font-semibold text-slate-800 border-b pb-2">Informations fiscales</h4>
                <div className="space-y-4">
                  <InputField
                    label="Numéro CNCSS"
                    value={formData.cncss}
                    onChange={(val) => handleChange('cncss', val)}
                    placeholder="Numéro de sécurité sociale"
                  />
                  <InputField
                    label="Numéro NIF"
                    value={formData.nif}
                    onChange={(val) => handleChange('nif', val)}
                    placeholder="Numéro d'identification fiscale"
                  />
                </div>

                <h4 className="font-semibold text-slate-800 border-b pb-2 mt-6">Equipements et Sécurité *</h4>
                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Taille des bottes *"
                    value={formData.habillement.booteTaille}
                    onChange={(val) => handleNestedChange('habillement', 'booteTaille', val)}
                    required
                    placeholder="42"
                    error={getFieldError('habillement.booteTaille')}
                  />
                  <InputField
                    label="Taille du T-shirt *"
                    value={formData.habillement.tshartTaille}
                    onChange={(val) => handleNestedChange('habillement', 'tshartTaille', val)}
                    required
                    placeholder="L"
                    error={getFieldError('habillement.tshartTaille')}
                  />
                </div>

                <h4 className="font-semibold text-slate-800 border-b pb-2 mt-6">Pièces d'identité</h4>
                <div className="space-y-4">
                  {formData.carteIdentite.map((carte, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700">Pièce {index + 1}</span>
                        {formData.carteIdentite.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeArrayItem('carteIdentite', index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <SelectField
                        label="Type de pièce"
                        value={carte.carteType}
                        options={[
                          { value: 'cartedelecteur', label: "Carte d'électeur" },
                          { value: 'pasport', label: 'Passeport' },
                          { value: 'permisconduire', label: 'Permis de conduire' },
                          { value: 'autre', label: 'Autre' },
                        ]}
                        onChange={(val) => handleArrayChange('carteIdentite', index, 'carteType', val)}
                      />

                      <InputField
                        label="Numéro *"
                        value={carte.numero}
                        onChange={(val) => handleArrayChange('carteIdentite', index, 'numero', val)}
                        required
                        placeholder="CD1234567"
                        error={getFieldError(`carteIdentite.${index}.numero`)}
                      />

                      {carte.carteType === 'autre' && (
                        <InputField
                          label="Nom de la carte *"
                          value={carte.nomdedelacarte}
                          onChange={(val) => handleArrayChange('carteIdentite', index, 'nomdedelacarte', val)}
                          required
                          placeholder="Nom de la pièce d'identité"
                          error={getFieldError(`carteIdentite.${index}.nomdedelacarte`)}
                        />
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      addArrayItem('carteIdentite', { carteType: 'cartedelecteur', numero: '', nomdedelacarte: '' })
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une pièce d'identité
                  </Button>

                  {errors.carteIdentite && (
                    <div className="text-red-600 text-sm flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.carteIdentite}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <FileUploadWithPreview
                  label="Signature"
                  file={formData.signature}
                  onChange={(val) => handleChange('signature', val)}
                  aspectRatio="aspect-[3/1]"
                />

                <FileUploadWithPreview
                  label="Photo de la carte d'identité"
                  file={formData.cardIdentiteImage}
                  onChange={(val) => handleChange('cardIdentiteImage', val)}
                  aspectRatio="aspect-[4/3]"
                />

                <div className="text-xs text-slate-500 space-y-1">
                  <p>• Formats acceptés : JPEG, PNG</p>
                  <p>• Taille maximale : 5 MB par fichier</p>
                  <p>• Assurez-vous que les documents sont lisibles</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 bg-transparent"
              >
                Annuler
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Suivant
                </Button>
              ) : (
                <Button
                  type="submit"
                  onClick={handleSubmitClick}
                  disabled={isSubmitting || (isEditing && !hasChanges)}
                  className="bg-gradient-to-r cursor-pointer from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {isEditing ? 'Modification...' : 'Ajout...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing
                        ? hasChanges
                          ? 'Enregistrer les modifications'
                          : 'Aucune modification'
                        : "Enregistrer l'agent"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>

        <AlertModal
          open={alertModal.open}
          onOpenChange={(open) => setAlertModal((prev) => ({ ...prev, open }))}
          title={alertModal.title}
          description={alertModal.description}
          type={alertModal.type}
          onConfirm={alertModal.onConfirm}
        />
      </Card>
    </div>
  )
}
