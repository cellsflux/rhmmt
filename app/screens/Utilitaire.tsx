import React, { useState } from 'react'
import {
  ArrowLeftRight,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Gift,
  MinusCircle,
  PlusCircle,
  Landmark,
  Users,
  Shield,
  CreditCard,
  Receipt,
  RotateCcw,
  UserCheck,
  TrendingUp,
  GraduationCap,
  UserPlus,
  Heart,
  LogOut,
} from 'lucide-react'

// Types pour TypeScript
type Currency = 'USD' | 'CDF'
type UtilityType =
  | 'currency'
  | 'salary'
  | 'tax'
  | 'leave'
  | 'overtime'
  | 'bonus'
  | 'deduction'
  | 'allowance'
  | 'loan'
  | 'pension'
  | 'insurance'
  | 'advance'
  | 'expense'
  | 'reimbursement'
  | 'attendance'
  | 'performance'
  | 'training'
  | 'recruitment'
  | 'retention'
  | 'severance'

interface Utility {
  id: number
  title: string
  type: UtilityType
  description: string
  icon: React.ReactNode
}

// Fonction de formatage de la monnaie
const formatCurrency = (amount: number, currency: Currency): string => {
  const formatter = new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'fr-CD', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

const RHCalculator: React.FC = () => {
  // États pour le convertisseur de devises
  const [amount, setAmount] = useState<number>(0)
  const [fromCurrency, setFromCurrency] = useState<Currency>('USD')
  const [toCurrency, setToCurrency] = useState<Currency>('CDF')
  const [exchangeRate, setExchangeRate] = useState<number>(2500)
  const [convertedAmount, setConvertedAmount] = useState<number>(0)

  // États pour les autres utilitaires
  const [selectedUtility, setSelectedUtility] = useState<UtilityType>('currency')
  const [salary, setSalary] = useState<number>(0)
  const [taxRate, setTaxRate] = useState<number>(15)
  const [leaveDays, setLeaveDays] = useState<number>(0)
  const [overtimeHours, setOvertimeHours] = useState<number>(0)
  const [overtimeRate, setOvertimeRate] = useState<number>(1.5)

  // Liste des utilitaires avec icônes Lucide
  const utilities: Utility[] = [
    {
      id: 1,
      title: 'Convertisseur de Devises',
      type: 'currency',
      description: 'Convertir USD en CDF et vice versa',
      icon: <ArrowLeftRight size={18} />,
    },
    {
      id: 2,
      title: 'Calcul de Salaire',
      type: 'salary',
      description: 'Calculer le salaire net après déductions',
      icon: <DollarSign size={18} />,
    },
    {
      id: 3,
      title: "Calcul d'Impôt",
      type: 'tax',
      description: 'Calculer le montant des impôts',
      icon: <FileText size={18} />,
    },
    {
      id: 4,
      title: 'Gestion des Congés',
      type: 'leave',
      description: 'Calculer les jours de congés restants',
      icon: <Calendar size={18} />,
    },
    {
      id: 5,
      title: 'Heures Supplémentaires',
      type: 'overtime',
      description: 'Calculer la rémunération des heures sup',
      icon: <Clock size={18} />,
    },
    {
      id: 6,
      title: 'Calcul de Prime',
      type: 'bonus',
      description: 'Calculer les primes et bonus',
      icon: <Gift size={18} />,
    },
    {
      id: 7,
      title: 'Déductions',
      type: 'deduction',
      description: 'Calculer les déductions diverses',
      icon: <MinusCircle size={18} />,
    },
    {
      id: 8,
      title: 'Allocations',
      type: 'allowance',
      description: 'Calculer les allocations',
      icon: <PlusCircle size={18} />,
    },
    {
      id: 9,
      title: 'Prêts Employés',
      type: 'loan',
      description: 'Gérer les remboursements de prêts',
      icon: <Landmark size={18} />,
    },
    {
      id: 10,
      title: 'Retraite',
      type: 'pension',
      description: 'Calculer les cotisations retraite',
      icon: <Users size={18} />,
    },
    {
      id: 11,
      title: 'Assurance',
      type: 'insurance',
      description: "Calculer les cotisations d'assurance",
      icon: <Shield size={18} />,
    },
    {
      id: 12,
      title: 'Avances',
      type: 'advance',
      description: 'Gérer les avances sur salaire',
      icon: <CreditCard size={18} />,
    },
    {
      id: 13,
      title: 'Frais',
      type: 'expense',
      description: 'Suivi des frais professionnels',
      icon: <Receipt size={18} />,
    },
    {
      id: 14,
      title: 'Remboursements',
      type: 'reimbursement',
      description: 'Calculer les remboursements',
      icon: <RotateCcw size={18} />,
    },
    {
      id: 15,
      title: 'Présence',
      type: 'attendance',
      description: 'Suivi de la présence',
      icon: <UserCheck size={18} />,
    },
    {
      id: 16,
      title: 'Performance',
      type: 'performance',
      description: 'Évaluation de la performance',
      icon: <TrendingUp size={18} />,
    },
    {
      id: 17,
      title: 'Formation',
      type: 'training',
      description: 'Gestion des coûts de formation',
      icon: <GraduationCap size={18} />,
    },
    {
      id: 18,
      title: 'Recrutement',
      type: 'recruitment',
      description: 'Calcul des coûts de recrutement',
      icon: <UserPlus size={18} />,
    },
    {
      id: 19,
      title: 'Fidélisation',
      type: 'retention',
      description: 'Analyse des coûts de fidélisation',
      icon: <Heart size={18} />,
    },
    {
      id: 20,
      title: 'Indemnités de Départ',
      type: 'severance',
      description: 'Calcul des indemnités de départ',
      icon: <LogOut size={18} />,
    },
  ]

  // Fonction de conversion de devises
  const convertCurrency = () => {
    if (fromCurrency === toCurrency) {
      setConvertedAmount(amount)
      return
    }

    if (fromCurrency === 'USD' && toCurrency === 'CDF') {
      setConvertedAmount(amount * exchangeRate)
    } else {
      setConvertedAmount(amount / exchangeRate)
    }
  }

  // Calcul du salaire net
  const calculateNetSalary = () => {
    const taxAmount = (salary * taxRate) / 100
    return salary - taxAmount
  }

  // Calcul des heures supplémentaires
  const calculateOvertimePay = () => {
    return overtimeHours * (salary / 160) * overtimeRate
  }

  // Rendu conditionnel selon l'utilitaire sélectionné
  const renderSelectedUtility = () => {
    switch (selectedUtility) {
      case 'currency':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Montant</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                  placeholder="Entrez le montant"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taux de change</label>
                <input
                  type="number"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">De</label>
                <select
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value as Currency)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                >
                  <option value="USD">USD</option>
                  <option value="CDF">CDF</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">À</label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as Currency)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                >
                  <option value="CDF">CDF</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <button
              onClick={convertCurrency}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeftRight size={16} />
              Convertir
            </button>

            {convertedAmount > 0 && (
              <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded">
                <p className="text-lg font-semibold">
                  {formatCurrency(amount, fromCurrency)} = {formatCurrency(convertedAmount, toCurrency)}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Taux: 1 {fromCurrency} = {exchangeRate} {toCurrency}
                </p>
              </div>
            )}
          </div>
        )

      case 'salary': {
        const netSalary = calculateNetSalary()
        const taxAmount = (salary * taxRate) / 100

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salaire brut</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                  placeholder="Salaire brut en USD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taux d'imposition (%)</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400">Salaire Brut</div>
                <div className="font-semibold text-blue-700 dark:text-blue-300">{formatCurrency(salary, 'USD')}</div>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-600 dark:text-red-400">Impôts</div>
                <div className="font-semibold text-red-700 dark:text-red-300">{formatCurrency(taxAmount, 'USD')}</div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400">Salaire Net</div>
                <div className="font-semibold text-green-700 dark:text-green-300">
                  {formatCurrency(netSalary, 'USD')}
                </div>
              </div>
            </div>
          </div>
        )
      }

      case 'overtime': {
        const overtimePay = calculateOvertimePay()
        const hourlyRate = salary / 160

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Salaire mensuel brut</label>
                <input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Heures supplémentaires</label>
                <input
                  type="number"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Taux heures sup</label>
                <input
                  type="number"
                  step="0.1"
                  value={overtimeRate}
                  onChange={(e) => setOvertimeRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Taux horaire normal</div>
                <div className="font-bold text-blue-700 dark:text-blue-300">{formatCurrency(hourlyRate, 'USD')}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Rémunération heures sup</div>
                <div className="font-bold text-orange-700 dark:text-orange-300">
                  {formatCurrency(overtimePay, 'USD')}
                </div>
              </div>
            </div>
          </div>
        )
      }

      case 'leave': {
        const remainingDays = Math.max(0, 25 - leaveDays)

        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Jours de congés pris</label>
              <input
                type="number"
                value={leaveDays}
                onChange={(e) => setLeaveDays(parseFloat(e.target.value) || 0)}
                className="w-full p-2 border rounded dark:bg-neutral-700 dark:border-neutral-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                <div className="text-sm text-red-600 dark:text-red-400 mb-1">Jours utilisés</div>
                <div className="text-xl font-bold text-red-700 dark:text-red-300">{leaveDays} jours</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-600 dark:text-green-400 mb-1">Jours restants</div>
                <div className="text-xl font-bold text-green-700 dark:text-green-300">{remainingDays} jours</div>
              </div>
            </div>

            <div className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Sur la base de 25 jours de congés annuels
            </div>
          </div>
        )
      }

      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🚧</div>
            <h3 className="text-lg font-semibold mb-2">Fonctionnalité en développement</h3>
            <p className="text-neutral-600 dark:text-neutral-400">Cet utilitaire sera bientôt disponible.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen pt-12 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-3 text-center">
          <h1 className="text-3xl font-bold mb-2">Utilitaires </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-neutral-800/50 rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {utilities.find((u) => u.type === selectedUtility)?.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">{utilities.find((u) => u.type === selectedUtility)?.title}</h2>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                    {utilities.find((u) => u.type === selectedUtility)?.description}
                  </p>
                </div>
              </div>

              {renderSelectedUtility()}
            </div>
          </div>

          {/* Sidebar avec la liste des utilitaires */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-neutral-800/50 rounded-lg shadow p-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <DollarSign size={20} />
                Utilitaires
              </h2>
              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {utilities.map((utility) => (
                  <button
                    key={utility.id}
                    onClick={() => setSelectedUtility(utility.type)}
                    className={`w-full  cursor-pointer text-left p-3 rounded transition-colors flex items-center gap-3 ${
                      selectedUtility === utility.type
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    <div
                      className={`p-1 rounded ${
                        selectedUtility === utility.type ? 'bg-blue-400' : 'bg-neutral-200 dark:bg-neutral-600'
                      }`}
                    >
                      {utility.icon}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{utility.title}</div>
                      <div
                        className={`text-xs ${
                          selectedUtility === utility.type ? 'text-blue-100' : 'text-neutral-500 dark:text-neutral-400'
                        }`}
                      >
                        {utility.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RHCalculator
