import { Agent } from '@/lib/database/models/recutement/agent'
import React, { useRef, useState, useEffect } from 'react'
import { useReactToPrint } from 'react-to-print'
import { Button } from '../ui/button'
import { Printer, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { formaEtacivile } from '../agents/detailAgent'
import logo from '@/resources/icons/logo_ic.jpg'

interface PriterModelOneProps {
  agent?: Agent
  companyLogo?: string
  companyAddress?: string
  companyName?: string
  onClose: () => void
  open: boolean
}

const PriterModelOne: React.FC<PriterModelOneProps> = ({
  agent,
  companyLogo = logo,
  companyAddress = '3791 Route Nzilo T/Mutshatsho, Kolwezi, Lualaba, RDC',
  companyName = 'MINERALE METAL TECHNOLOGY S.A.R.L.',
  onClose,
  open,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showPreview, setShowPreview] = useState(true)

  // Configuration pour l'impression
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Fiche_Agent_${agent?.nom || 'Non_attribue'}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background: white !important;
        }
        .print-page {
          width: 21cm;
          min-height: 29.7cm;
          page-break-after: always;
          box-sizing: border-box;
          padding: 0.25cm;
        }
        .print-page:last-child {
          page-break-after: auto;
        }
        .no-print {
          display: none !important;
        }
        /* Assurer que toutes les pages sont visibles à l'impression */
        .print-page {
          display: block !important;
        }
      }
    `,
    onBeforeGetContent: () => {
      // Forcer l'affichage de toutes les pages avant l'impression
      if (contentRef.current) {
        const pages = contentRef.current.querySelectorAll('.print-page')
        pages.forEach((page) => {
          page.style.display = 'block'
        })
      }
      return Promise.resolve()
    },
  })

  // Calculer le nombre total de pages
  useEffect(() => {
    if (agent?.enfants && agent.enfants.length > 0) {
      setTotalPages(2)
    } else {
      setTotalPages(1)
    }
    setCurrentPage(1)
  }, [agent])

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }

  const calculateAge = (birthday?: string) => {
    if (!birthday) return ''
    const birthDate = new Date(birthday)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age.toString()
  }

  const getNiveauEtudesLabel = (niveau?: string) => {
    switch (niveau) {
      case 'diplome':
        return 'Diplômé'
      case 'gradue':
        return 'Gradué'
      case 'brevet':
        return 'Brevet'
      case 'licence':
        return 'Licence'
      case 'autre':
        return 'Autre'
      default:
        return ''
    }
  }

  const getTypeContratLabel = (type?: string) => {
    switch (type) {
      case 'cdd':
        return 'CDD'
      case 'cdi':
        return 'CDI'
      case 'durrere':
        return 'Durée déterminée'
      default:
        return ''
    }
  }

  const getTypeSalaireLabel = (type?: string) => {
    switch (type) {
      case 'jouranlier':
        return 'Journalier'
      case 'mensuelle':
        return 'Mensuel'
      case 'trimestrielle':
        return 'Trimestriel'
      case 'annuelle':
        return 'Annuel'
      default:
        return ''
    }
  }

  const getCarteTypeLabel = (type?: string) => {
    switch (type) {
      case 'cartedelecteur':
        return "Carte d'électeur"
      case 'pasport':
        return 'Passeport'
      case 'autre':
        return 'Autre'
      default:
        return ''
    }
  }

  const getRelationShipLabel = (relationShip?: string) => {
    if (!relationShip) return ''
    return relationShip === 'conjoint' ? 'Conjoint(e)' : relationShip
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 pt-5 overflow-y-auto backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-6xl w-full h-full mt-12">
        {/* Contrôles de prévisualisation */}
        <div className="no-print sticky top-2 ml-auto max-w-md bg-white rounded-lg shadow-lg p-4 flex items-center space-x-4 z-50">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-medium text-black">
              Page {currentPage} sur {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded text-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="w-px h-6 bg-gray-300"></div>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            {showPreview ? 'Masquer prévisualisation' : 'Afficher prévisualisation'}
          </button>
          <button onClick={onClose} className="p-1 rounded text-black">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteneur d'impression avec prévisualisation */}
        <div
          className={`bg-white mx-auto ${showPreview ? 'scale-90 shadow-2xl' : 'scale-100'} transition-transform duration-200`}
          style={
            showPreview
              ? {
                  width: '21cm',
                  minHeight: '29.7cm',
                  boxShadow: '0 0 20px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e5e5',
                }
              : {}
          }
        >
          <div ref={contentRef} className="bg-white">
            {/* PAGE 1 - Informations principales */}
            <div className="print-page" style={showPreview && currentPage !== 1 ? { display: 'none' } : {}}>
              <div className="bg-white p-2 text-gray-800 font-sans" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                {/* En-tête compact */}
                <div className="flex justify-between items-start mb-0.5 border-b border-gray-200">
                  <img src={companyLogo} alt="Logo" className="w-auto h-20 object-cover mr-3" />
                </div>

                {/* Titre principal */}
                <div className="text-center mb-2">
                  <h2 className="font-bold text-base uppercase mb-1">Fiche d'Identification de l'Agent</h2>
                </div>

                <div className="space-y-3">
                  {/* Photo et info rapides compactes */}
                  <div className="flex gap-4 mb-3">
                    <div className="w-30 h-30 bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                      {agent?.image ? (
                        <img src={agent.image} alt="Photo" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-2xl">👤</span>
                      )}
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-1">
                      <div className="">
                        <div className="text-xs text-gray-600 font-medium">Matricule</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {agent?.matricule || 'Non attribué'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Genre</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {agent?.genre === 'F' ? 'Féminin' : 'Masculin'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Âge</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {calculateAge(agent?.brithday) || '-'} ans
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Poste</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {agent?.poste_ocuper?.name || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Département</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {agent?.departement?.name || 'Production Active'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 font-medium">Niveau études</div>
                        <div className="font-semibold text-xs border-b border-gray-200">
                          {getNiveauEtudesLabel(agent?.nuvieau_etudes) || '-'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informations Personnelles */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">
                      INFORMATIONS PERSONNELLES
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Nom:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.nom || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Post-nom:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.postnom || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Prénom:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.prenom || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Téléphone:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.telephone || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Email:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.email || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Naissance:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.brithplace || '-'}, {formatDate(agent?.brithday) || '-'}
                        </span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Nationalité:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.nationalite || 'Congolaise'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5 col-span-2">
                        <span className="w-28 text-gray-600 font-medium">Adresse:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.adresse
                            ? `${agent.adresse.avenue || ''} ${agent.adresse.numero || ''}, ${agent.adresse.quartier || ''}, ${agent.adresse.commune || ''}, ${agent.adresse.ville || ''}`
                                .replace(/\s+/g, ' ')
                                .trim()
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Situation Familiale Complète */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">SITUATION FAMILIALE</h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">État civil:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {formaEtacivile(agent?.etatcivil, agent?.genre) || '-'}
                        </span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Conjoint{agent?.genre === 'M' && 'e'}:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.nomduconjoint || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Nombre d'enfants:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.nombre_enfants || '0'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Père:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.pere || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Mère:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.mere || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5 col-span-2">
                        <span className="w-28 text-gray-600 font-medium">Contact urgence:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.personneUrgence
                            ? `${agent.personneUrgence.nom} ${agent.personneUrgence.prenom || ''} - ${agent.personneUrgence.telephone} (${getRelationShipLabel(agent.personneUrgence.relationShip)})`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations Professionnelles */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">
                      INFORMATIONS PROFESSIONNELLES
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Département:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.departement?.name || 'Production Active'}
                        </span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Poste:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.poste_ocuper?.name || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Contrat:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {getTypeContratLabel(agent?.typeContrat) || 'CDI'}
                        </span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Début:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {formatDate(agent?.dateDebutContrat) || '13/01/2024'}
                        </span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Fin:</span>
                        <span className="font-semibold flex-1 text-xs">{formatDate(agent?.dateFinContrat) || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Période essai:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.periode_essai || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Expérience:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.anne_experience || '0'} ans</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Niveau études:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {getNiveauEtudesLabel(agent?.nuvieau_etudes) || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Informations Bancaires et Sociales */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">INFORMATIONS FISCALES</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Banque:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.banque?.nom || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Numéro Compte:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.banque?.numeroCompte || '-'}</span>
                      </div>

                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Numéro CNSS:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.cncss || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Numéro NIF:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.nif || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5 col-span-2">
                        <span className="w-28 text-gray-600 font-medium">Devise:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.devise || 'CDF'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Salaire:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.saleaire
                            ? `${agent.saleaire.montant} ${agent.devise || 'CDF'} (${getTypeSalaireLabel(agent.saleaire.type)})`
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Équipement de Protection */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">
                      ÉQUIPEMENT DE PROTECTION
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Taille bottes:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.habillement?.booteTaille || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5">
                        <span className="w-28 text-gray-600 font-medium">Taille t-shirt:</span>
                        <span className="font-semibold flex-1 text-xs">{agent?.habillement?.tshartTaille || '-'}</span>
                      </div>
                      <div className="flex items-center border-b border-gray-200 pb-0.5 col-span-2">
                        <span className="w-28 text-gray-600 font-medium">Équipement fourni:</span>
                        <span className="font-semibold flex-1 text-xs">
                          {agent?.habillement?.booteTaille || agent?.habillement?.tshartTaille
                            ? 'Bottes et vêtements de travail'
                            : 'Standard'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pièces d'identité */}
                  <div className="mb-0.5">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-0.5 mb-2 rounded">PIÈCES D'IDENTITÉ</h3>
                    <div className="space-y-2 text-xs">
                      {agent?.carteIdentite && agent.carteIdentite.length > 0 ? (
                        agent.carteIdentite.map((piece, index) => (
                          <div key={index} className="grid grid-cols-2 gap-2 border-b border-gray-200 pb-2">
                            <div className="flex items-center">
                              <span className="w-28 text-gray-600 font-medium">Type:</span>
                              <span className="font-semibold flex-1 text-xs">
                                {getCarteTypeLabel(piece.carteType)}
                                {piece.carteType === 'autre' && piece.nomdedelacarte
                                  ? ` (${piece.nomdedelacarte})`
                                  : ''}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-28 text-gray-600 font-medium">Numéro:</span>
                              <span className="font-semibold flex-1 text-xs">{piece.numero || '830207012'}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-xs text-center py-1">
                          Aucune pièce d'identité enregistrée
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-1">
                  <div className="flex justify-between items-end text-xs px-6">
                    <div className=" flex-1">
                      <div className="text-gray-600 mb-1 text-xs">Direction</div>
                      <div className="h-12  flex items-end justify-center"></div>
                    </div>
                    <div className=" flex-1 items-center flex flex-col ">
                      <div className="text-gray-600 mb-1 text-xs">Signature de l'agent</div>
                      <div className="h-12  flex items-end justify-center">
                        {agent?.signature && <img src={agent.signature} alt="Signature" className="max-h-10" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PAGE 2 - Liste des enfants (seulement si il y a des enfants) */}
            {agent?.enfants && agent.enfants.length > 0 && (
              <div className="print-page" style={showPreview && currentPage !== 2 ? { display: 'none' } : {}}>
                <div className="bg-white p-6 text-gray-800 font-sans" style={{ fontSize: '11px', lineHeight: '1.2' }}>
                  {/* En-tête identique */}
                  <div className="flex justify-between items-start mb-2 border-b border-gray-200">
                    <img src={companyLogo} alt="Logo" className="w-auto h-20 object-cover mr-3" />
                  </div>

                  {/* Titre pour la page enfants */}
                  <div className="text-center mb-2">
                    <h2 className="font-bold text-base uppercase mb-1">Fiche d'Identification de l'Agent</h2>

                    <div className="text-xs font-semibold">
                      {agent.nom} {agent.postnom} {agent.prenom} - Matricule: {agent.matricule}
                    </div>
                  </div>

                  {/* Liste des enfants dans votre style original */}
                  <div className="mb-2">
                    <h3 className="font-semibold text-xs bg-gray-100 px-3 py-1 mb-2 rounded">LISTE D'ENFANTS</h3>
                    <div className="text-xs text-gray-600 mb-2">
                      Nombre total d'enfants : <span className="font-semibold">{agent.enfants.length}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-4 gap-2 text-xs border-b border-gray-200 pb-2 font-semibold bg-gray-50 p-2 rounded">
                        <div className="flex items-center">
                          <span className="w-8 font-medium">N°</span>
                          <span className="font-semibold flex-1">Nom complet</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-20 font-medium">Naissance</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-16 font-medium">Lieu</span>
                        </div>
                        <div className="flex items-center">
                          <span className="w-12 font-medium ml-2">Genre</span>
                        </div>
                      </div>

                      {agent.enfants.map((enfant, index) => (
                        <div key={index} className="grid grid-cols-4 gap-2 text-xs border-b border-gray-200 pb-2">
                          <div className="flex items-center">
                            <span className="w-8 text-gray-600 font-medium">{index + 1}.</span>
                            <span className="font-semibold flex-1">
                              {enfant.nom} {enfant.postnom} {enfant.prenom}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold flex-1 text-xs">{formatDate(enfant.brithday)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-semibold flex-1 text-xs">{enfant.brithplace || '-'}</span>
                          </div>

                          <div className="flex items-center">
                            <span className="font-semibold flex-1 text-xs">
                              {enfant.gendre === 'F' ? 'Féminin' : 'Masculin'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pied de page pour la page 2 */}
                  <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
                    {companyName} Émis le {formatDate(new Date().toISOString())}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Barre d'actions en bas */}
        <div className="no-print sticky bottom-0 p-2 w-full justify-center flex bg-white rounded-lg shadow-lg mt-4">
          <Button onClick={onClose} variant="outline" className="mr-2 text-black dark:text-white">
            Annuler
          </Button>
          <Button onClick={reactToPrintFn} variant="destructive" className="text-white dark:text-white">
            <Printer className="mr-2 h-4 w-4" /> Imprimer
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PriterModelOne
