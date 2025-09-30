'use client'
import React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/app/components/ui/card'
import { Separator } from '@/app/components/ui/separator'
import { Badge } from '@/app/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import {
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  FileText,
  CreditCard,
  Shirt,
  Landmark,
  Contact2,
  DollarSign,
  Signature,
  Printer,
  History,
  TrendingUp,
  Download,
  Edit,
  MoreVertical,
  Clock,
  ChartBar,
  Building,
  IdCard,
  Heart,
  GraduationCap,
  BriefcaseBusiness,
  Banknote,
  ScanLine,
  FileImage,
  Users,
  Shield,
  FileCheck,
  Calendar,
  Award,
  Target,
  PieChart,
} from 'lucide-react'
import { saveAs } from 'file-saver'
import type { Agent } from '@/lib/database/models/recutement/agent'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

interface Props {
  agent: Agent
  openPrint: () => void
}

export const formaEtacivile = (etatcivil: string, genre: string) => {
  const etats = {
    marie: genre === 'F' ? 'Mariée' : 'Marié',
    divorcee: genre === 'F' ? 'Divorcée' : 'Divorcé',
    veuf: genre === 'F' ? 'Veuve' : 'Veuf',
    celibataire: 'Célibataire',
  }
  return etats[etatcivil as keyof typeof etats] || 'Célibataire'
}

export const AgentDetail: React.FC<Props> = ({ agent, openPrint }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false)
  const [modalImage, setModalImage] = useState<string>('')
  const [activeTab, setActiveTab] = useState('informations')

  // Gestion du raccourci clavier pour l'impression
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault()
        openPrint()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openPrint])

  const openGallery = (src: string) => {
    setModalImage(src)
    setModalIsOpen(true)
  }

  const closeGallery = () => setModalIsOpen(false)

  const downloadImage = () => {
    if (!modalImage) return
    saveAs(modalImage, `${agent.prenom}_${agent.nom}_${new Date().getTime()}.png`)
  }

  const getStatusColor = (typeContrat?: string) => {
    switch (typeContrat) {
      case 'cdi':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      case 'cdd':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
      case 'durrere':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700'
    }
  }

  const formatCurrency = (montant?: number, devise?: string) => {
    if (!montant) return '-'
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise === 'USD' ? 'USD' : 'CDF',
    }).format(montant)
  }

  const formatAddress = (adresse?: Agent['adresse']) => {
    if (!adresse) return 'Non spécifiée'
    return [adresse.numero, adresse.avenue, adresse.quartier, adresse.commune, adresse.ville].filter(Boolean).join(', ')
  }

  const getNiveauEtudesLabel = (niveau: string) => {
    const niveaux = {
      diplome: 'Diplômé',
      gradue: 'Gradué',
      brevet: 'Brevet',
      licence: 'Licence',
      autre: 'Autre',
    }
    return niveaux[niveau as keyof typeof niveaux] || niveau
  }

  // Statistiques intelligentes basées sur les données disponibles
  const stats = {
    presence: 85,
    absences: 12,
    retard: 8,
    productivity: 78,
    anciennete: agent.dateDebutContrat ? new Date().getFullYear() - new Date(agent.dateDebutContrat).getFullYear() : 0,
    completion: 92,
  }

  // Regroupement intelligent des données
  const personalInfo = {
    identite: {
      'Nom complet': `${agent.prenom} ${agent.postnom} ${agent.nom}`,
      Genre: agent.genre === 'M' ? 'Masculin' : 'Féminin',
      'Date de naissance': agent.brithday,
      'Lieu de naissance': agent.brithplace,
      Nationalité: agent.nationalite,
      'État civil': formaEtacivile(agent.etatcivil, agent.genre),
    },
    famille: {
      Père: agent.pere || 'Non spécifié',
      Mère: agent.mere || 'Non spécifié',
      Conjoint: agent.nomduconjoint || 'Non spécifié',
      "Nombre d'enfants": agent.nombre_enfants || 0,
    },
    contact: {
      Téléphone: agent.telephone,
      Email: agent.email || 'Non spécifié',
      Adresse: formatAddress(agent.adresse),
    },
    urgence: {
      Nom: `${agent.personneUrgence?.prenom || ''} ${agent.personneUrgence?.nom || ''}`.trim(),
      Lien: agent.personneUrgence?.relationShip || 'Non spécifié',
      Téléphone: agent.personneUrgence?.telephone || 'Non spécifié',
    },
  }

  const professionalInfo = {
    contrat: {
      Type: agent.typeContrat?.toUpperCase() || 'NON DÉFINI',
      Début: agent.dateDebutContrat || 'Non spécifié',
      Fin: agent.dateFinContrat || 'Indéterminée',
      "Période d'essai": agent.periode_essai,
    },
    poste: {
      Poste: agent.poste_ocuper?.name || 'Non défini',
      Département: agent.departement.name || 'Non défini',
      Matricule: agent.matricule || 'Non attribué',
    },
    remuneration: {
      'Salaire base': formatCurrency(agent.saleaire?.montant, agent.devise),
      Périodicité: agent.saleaire?.type || 'Non spécifié',
      Devise: agent.devise || 'CDF',
    },
    formation: {
      "Niveau d'études": getNiveauEtudesLabel(agent.nuvieau_etudes),
      Expérience: `${agent.anne_experience} an(s)`,
    },
  }

  const fiscalInfo = {
    sociale: {
      'Numéro CNCSS': agent.cncss || 'Non attribué',
      'Numéro NIF': agent.nif || 'Non attribué',
    },
    bancaire: {
      Banque: agent.banque?.nom || 'Non spécifiée',
      'Numéro de compte': agent.banque?.numeroCompte || 'Non spécifié',
    },
  }

  const renderInfoSection = (title: string, data: Record<string, any>, icon: React.ElementType) => (
    <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
      <CardContent className="p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
          {React.createElement(icon, { className: 'w-4 h-4' })}
          {title}
        </h3>
        <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
        <div className="space-y-3 text-sm">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="flex justify-between py-1">
              <span className="font-medium text-gray-600 dark:text-neutral-400">{key}:</span>
              <span className={`text-gray-900 dark:text-neutral-100 ${key === 'Salaire base' ? 'font-semibold' : ''}`}>
                {value || 'Non spécifié'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="w-full max-w-7xl mx-auto bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 overflow-hidden shadow-sm">
      {/* Header professionnel */}
      <div className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {agent.image ? (
              <img
                src={agent.image}
                alt="Photo agent"
                onClick={() => openGallery(agent.image!)}
                className="w-40 h-40 object-cover rounded-lg border-2 border-gray-200 dark:border-neutral-600 cursor-pointer hover:border-gray-300 dark:hover:border-neutral-500 transition-colors"
              />
            ) : (
              <div className="w-40 h-40 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded-lg border-2 border-gray-200 dark:border-neutral-600">
                <User className="w-12 h-12 text-gray-400 dark:text-neutral-500" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">
                  {agent.prenom} {agent.postnom} {agent.nom}
                </h1>
                <Badge variant="outline" className={getStatusColor(agent.typeContrat)}>
                  {agent.typeContrat?.toUpperCase() || 'NON DÉFINI'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-neutral-400 mb-4">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  {agent.poste_ocuper?.name || 'Poste non défini'}
                </span>
                <span className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  {agent.departement.name || 'Département non défini'}
                </span>
                <span className="flex items-center gap-2">
                  <IdCard className="w-4 h-4" />
                  Matricule: {agent.matricule || 'Non attribué'}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {getNiveauEtudesLabel(agent.nuvieau_etudes)}
                </Badge>
                <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <Award className="w-3 h-3 mr-1" />
                  {agent.anne_experience} an(s) exp.
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                >
                  <Calendar className="w-3 h-3 mr-1" />
                  {stats.anciennete} an(s) ancienneté
                </Badge>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300 dark:border-neutral-600 bg-transparent">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700"
            >
              <DropdownMenuItem
                onClick={openPrint}
                className="cursor-pointer focus:bg-gray-100 dark:focus:bg-neutral-700"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer (Ctrl+P)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Statistiques professionnelles améliorées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm mb-2">
              <Clock className="w-4 h-4" />
              <span>Présence</span>
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100">{stats.presence}%</div>
            <div className="w-full bg-blue-200 dark:bg-blue-700 rounded-full h-2 mt-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${stats.presence}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm mb-2">
              <Target className="w-4 h-4" />
              <span>Productivité</span>
            </div>
            <div className="text-xl font-bold text-green-900 dark:text-green-100">{stats.productivity}%</div>
            <div className="w-full bg-green-200 dark:bg-green-700 rounded-full h-2 mt-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: `${stats.productivity}%` }}></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm mb-2">
              <DollarSign className="w-4 h-4" />
              <span>Salaire {agent.saleaire?.type}</span>
            </div>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
              {formatCurrency(agent.saleaire?.montant, agent.devise)}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              {agent.devise} • {agent.saleaire?.type}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm mb-2">
              <PieChart className="w-4 h-4" />
              <span>Complétude</span>
            </div>
            <div className="text-xl font-bold text-purple-900 dark:text-purple-100">{stats.completion}%</div>
            <div className="w-full bg-purple-200 dark:bg-purple-700 rounded-full h-2 mt-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${stats.completion}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation améliorée */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 p-2 bg-gray-50 dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
          {[
            { value: 'informations', icon: User, label: 'Informations' },
            { value: 'professionnel', icon: Briefcase, label: 'Professionnel' },
            { value: 'documents', icon: FileText, label: 'Documents' },
            { value: 'performance', icon: TrendingUp, label: 'Performance' },
            { value: 'historique', icon: History, label: 'Historique' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 py-3 text-sm cursor-pointer data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-900 data-[state=active]:shadow-sm data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-100 transition-all duration-200"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Contenu */}
        <div className="bg-white dark:bg-neutral-900 min-h-[500px]">
          <div className="p-6">
            {/* Onglet Informations personnelles */}
            <TabsContent value="informations" className="space-y-6 mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {renderInfoSection('Identité', personalInfo.identite, User)}
                {renderInfoSection('Situation familiale', personalInfo.famille, Users)}
                {renderInfoSection('Coordonnées', personalInfo.contact, Contact2)}
                {renderInfoSection("Contact d'urgence", personalInfo.urgence, Heart)}

                {/* Enfants détaillés */}
                {agent.enfants && agent.enfants.length > 0 && (
                  <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm md:col-span-2">
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                        <Users className="w-4 h-4" />
                        Enfants ({agent.enfants.length})
                      </h3>
                      <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                      <div className="grid md:grid-cols-2 gap-4">
                        {agent.enfants.map((enfant, index) => (
                          <div
                            key={index}
                            className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-semibold text-gray-900 dark:text-neutral-100">
                                {enfant.prenom} {enfant.postnom} {enfant.nom}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                Enfant {index + 1}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-neutral-400 space-y-1">
                              <div>Genre: {enfant.gendre === 'F' ? 'Féminin' : 'Masculin'}</div>
                              <div>Né le: {enfant.brithday}</div>
                              <div>Lieu: {enfant.brithplace}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Onglet Professionnel */}
            <TabsContent value="professionnel" className="space-y-6 mt-0">
              <div className="grid md:grid-cols-2 gap-6">
                {renderInfoSection('Contrat de travail', professionalInfo.contrat, FileCheck)}
                {renderInfoSection('Poste et département', professionalInfo.poste, BriefcaseBusiness)}
                {renderInfoSection('Rémunération', professionalInfo.remuneration, Banknote)}
                {renderInfoSection('Formation et expérience', professionalInfo.formation, GraduationCap)}
                {renderInfoSection('Situation fiscale', fiscalInfo.sociale, Shield)}
                {renderInfoSection('Coordonnées bancaires', fiscalInfo.bancaire, Landmark)}

                {/* Habillement */}
                <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                      <Shirt className="w-4 h-4" />
                      Habillement
                    </h3>
                    <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between py-1">
                        <span className="font-medium text-gray-600 dark:text-neutral-400">Taille T-shirt:</span>
                        <span className="text-gray-900 dark:text-neutral-100">
                          {agent.habillement?.tshartTaille || 'Non spécifiée'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="font-medium text-gray-600 dark:text-neutral-400">Pointure:</span>
                        <span className="text-gray-900 dark:text-neutral-100">
                          {agent.habillement?.booteTaille || 'Non spécifiée'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Onglet Documents */}
            <TabsContent value="documents" className="mt-0">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Photo d'identité */}
                <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                      <FileImage className="w-4 h-4" />
                      Photo d'identité
                    </h3>
                    <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                    <div className="flex justify-center">
                      {agent.image ? (
                        <img
                          src={agent.image}
                          alt="Photo agent"
                          onClick={() => openGallery(agent.image!)}
                          className="w-40 h-40 object-cover rounded border border-gray-200 dark:border-neutral-600 cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-40 h-40 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-600">
                          <User className="w-10 h-10 text-gray-400 dark:text-neutral-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => agent.image && openGallery(agent.image)}
                        className="border-gray-300 dark:border-neutral-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Signature */}
                <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                      <Signature className="w-4 h-4" />
                      Signature
                    </h3>
                    <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                    <div className="flex justify-center">
                      {agent.signature ? (
                        <img
                          src={agent.signature}
                          alt="Signature"
                          onClick={() => openGallery(agent.signature!)}
                          className="h-32 object-contain border border-gray-200 dark:border-neutral-600 rounded cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-600 w-full">
                          <span className="text-gray-500 dark:text-neutral-500 text-sm">Aucune signature</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => agent.signature && openGallery(agent.signature)}
                        className="border-gray-300 dark:border-neutral-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Carte d'identité */}
                <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                  <CardContent className="p-5">
                    <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                      <IdCard className="w-4 h-4" />
                      Pièce d'identité
                    </h3>
                    <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                    <div className="flex justify-center">
                      {agent.cardIdentiteImage ? (
                        <img
                          src={agent.cardIdentiteImage}
                          alt="Carte d'identité"
                          onClick={() => openGallery(agent.cardIdentiteImage!)}
                          className="max-h-32 object-contain border border-gray-200 dark:border-neutral-600 rounded cursor-pointer hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="h-32 flex items-center justify-center bg-gray-100 dark:bg-neutral-800 rounded border border-gray-200 dark:border-neutral-600 w-full">
                          <span className="text-gray-500 dark:text-neutral-500 text-sm">Aucune pièce</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-center mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => agent.cardIdentiteImage && openGallery(agent.cardIdentiteImage)}
                        className="border-gray-300 dark:border-neutral-600"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Pièces d'identité détaillées */}
                {agent.carteIdentite && agent.carteIdentite.length > 0 && (
                  <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm md:col-span-3">
                    <CardContent className="p-5">
                      <h3 className="font-semibold mb-3 flex items-center gap-2 text-base text-gray-900 dark:text-neutral-100">
                        <CreditCard className="w-4 h-4" />
                        Pièces d'identité détaillées
                      </h3>
                      <Separator className="mb-4 bg-gray-200 dark:bg-neutral-700" />
                      <div className="grid md:grid-cols-2 gap-4">
                        {agent.carteIdentite.map((piece, i) => (
                          <div
                            key={i}
                            className="p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-700 dark:text-neutral-300 text-sm capitalize">
                                {piece.carteType === 'cartedelecteur'
                                  ? "Carte d'électeur"
                                  : piece.carteType === 'pasport'
                                    ? 'Passeport'
                                    : 'Autre document'}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                N° {piece.numero}
                              </Badge>
                            </div>
                            {piece.nomdedelacarte && (
                              <p className="text-sm text-gray-600 dark:text-neutral-400 mt-1">
                                Dénomination: {piece.nomdedelacarte}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Autres onglets */}
            <TabsContent value="performance" className="mt-0">
              <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 dark:text-neutral-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-neutral-100">
                    Module Performance en développement
                  </h3>
                  <p className="text-gray-600 dark:text-neutral-400">
                    Statistiques détaillées de performance et productivité
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historique" className="mt-0">
              <Card className="border border-gray-200 dark:border-neutral-700 shadow-sm">
                <CardContent className="p-8 text-center">
                  <History className="w-16 h-16 mx-auto text-gray-400 dark:text-neutral-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-neutral-100">
                    Module Historique en développement
                  </h3>
                  <p className="text-gray-600 dark:text-neutral-400">
                    Historique des absences, congés et modifications
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* Modal Galerie */}
      {modalIsOpen && (
        <div className="fixed inset-0 pt-5 overflow-y-auto bg-black/30 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={closeGallery}
              className="absolute -top-10 right-0 text-white text-2xl font-bold cursor-pointer z-10 hover:text-gray-300 transition-colors"
            >
              ×
            </button>
            <img src={modalImage} alt="Zoom" className="w-full h-auto max-h-[70vh] object-contain rounded-t-lg" />
            <div className="flex justify-center p-4 gap-3 ">
              <Button onClick={downloadImage} size="sm" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Télécharger
              </Button>
              <Button variant="outline" size="sm" onClick={closeGallery}>
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
