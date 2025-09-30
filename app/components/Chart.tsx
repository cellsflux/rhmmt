import React, { useState } from 'react'
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
  LineChart,
  Line,
  ComposedChart,
} from 'recharts'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { Badge } from '@/app/components/ui/badge'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/app/components/ui/drawer'
import { Activity, BarChart3, Circle, TrendingUp, Layers, Settings, ChartArea } from 'lucide-react'
import { ChartContainer } from './ui/chart'

// Types de graphiques disponibles (seulement ceux compatibles avec nos 3 variables)
const CHART_TYPES = [
  {
    id: 'area',
    name: 'Graphique en Aires',
    icon: Activity,
    color: 'bg-blue-500',
    description: 'Évolution dans le temps',
    compatible: true,
  },
  {
    id: 'bar',
    name: 'Graphique en Barres',
    icon: BarChart3,
    color: 'bg-green-500',
    description: 'Comparaison des valeurs',
    compatible: true,
  },
  {
    id: 'line',
    name: 'Graphique Linéaire',
    icon: TrendingUp,
    color: 'bg-purple-500',
    description: 'Tendances et évolutions',
    compatible: true,
  },
  {
    id: 'pie',
    name: 'Graphique Circulaire',
    icon: Circle,
    color: 'bg-orange-500',
    description: 'Répartition (dernière période)',
    compatible: true,
  },
  {
    id: 'composed',
    name: 'Graphique Combiné',
    icon: Layers,
    color: 'bg-pink-500',
    description: 'Barres + Ligne',
    compatible: true,
  },
]

// Configuration des couleurs pour les charts
const chartConfig = {
  effectif: {
    label: 'Effectif total',
    color: 'hsl(221, 83%, 53%, 0.5)',
  },
  embauches: {
    label: 'Nouvelles embauches',
    color: 'hsl(142, 76%, 36%)',
  },
  departs: {
    label: 'Départs',
    color: /*rouge*/ 'hsl(0, 70%, 50%)',
  },
}

// Données d'exemple
const sampleData = [
  { date: 'Jan 2024', effectif: 120, embauches: 15, departs: 8 },
  { date: 'Fév 2024', effectif: 127, embauches: 12, departs: 5 },
  { date: 'Mar 2024', effectif: 134, embauches: 18, departs: 11 },
  { date: 'Avr 2024', effectif: 141, embauches: 14, departs: 7 },
  { date: 'Mai 2024', effectif: 148, embauches: 16, departs: 9 },
  { date: 'Jun 2024', effectif: 155, embauches: 13, departs: 6 },
]

const ChartSelector = ({
  data = sampleData,
  title = 'Tableau de Bord RH',
  description = 'Évolution des effectifs, embauches et départs',
}) => {
  const [selectedChart, setSelectedChart] = useState('area')
  const [hoveredChart, setHoveredChart] = useState(null)

  // Préparer les données pour le graphique circulaire (dernière période)
  const latestData = data[data.length - 1] || {}
  const pieData = [
    { name: 'Effectif', value: latestData.effectif || 0, color: chartConfig.effectif.color },
    { name: 'Embauches', value: latestData.embauches || 0, color: chartConfig.embauches.color },
    { name: 'Départs', value: latestData.departs || 0, color: chartConfig.departs.color },
  ].filter((item) => item.value > 0)

  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 20, left: 20, right: 30, bottom: 20 },
    }

    switch (selectedChart) {
      case 'area':
        return (
          <ChartContainer config={chartConfig} style={{ width: '100%', height: '100%' }}>
            <AreaChart {...commonProps}>
              <defs>
                <linearGradient id="fillEffectif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartConfig.effectif.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartConfig.effectif.color} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillEmbauches" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartConfig.embauches.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartConfig.embauches.color} stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="fillDeparts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartConfig.departs.color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={chartConfig.departs.color} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" vertical={false} strokeOpacity={0.3} />
              <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
              <YAxis tickLine={false} axisLine={false} className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Area
                dataKey="effectif"
                fill="url(#fillEffectif)"
                stroke={chartConfig.effectif.color}
                strokeWidth={2}
                name={chartConfig.effectif.label}
              />
              <Area
                dataKey="embauches"
                fill="url(#fillEmbauches)"
                stroke={chartConfig.embauches.color}
                strokeWidth={2}
                name={chartConfig.embauches.label}
              />
              <Area
                dataKey="departs"
                fill="url(#fillDeparts)"
                stroke={chartConfig.departs.color}
                strokeWidth={2}
                name={chartConfig.departs.label}
              />
            </AreaChart>
          </ChartContainer>
        )

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="2 4" vertical={false} strokeOpacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="effectif"
              fill={chartConfig.effectif.color}
              radius={[2, 2, 0, 0]}
              name={chartConfig.effectif.label}
            />
            <Bar
              dataKey="embauches"
              fill={chartConfig.embauches.color}
              radius={[2, 2, 0, 0]}
              name={chartConfig.embauches.label}
            />
            <Bar
              dataKey="departs"
              fill={chartConfig.departs.color}
              radius={[2, 2, 0, 0]}
              name={chartConfig.departs.label}
            />
          </BarChart>
        )

      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="2 4" strokeOpacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Line
              dataKey="effectif"
              stroke={chartConfig.effectif.color}
              strokeWidth={3}
              dot={{ r: 4, fill: chartConfig.effectif.color }}
              activeDot={{ r: 6, fill: chartConfig.effectif.color }}
              name={chartConfig.effectif.label}
            />
            <Line
              dataKey="embauches"
              stroke={chartConfig.embauches.color}
              strokeWidth={3}
              dot={{ r: 4, fill: chartConfig.embauches.color }}
              activeDot={{ r: 6, fill: chartConfig.embauches.color }}
              name={chartConfig.embauches.label}
            />
            <Line
              dataKey="departs"
              stroke={chartConfig.departs.color}
              strokeWidth={3}
              dot={{ r: 4, fill: chartConfig.departs.color }}
              activeDot={{ r: 6, fill: chartConfig.departs.color }}
              name={chartConfig.departs.label}
            />
          </LineChart>
        )

      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <PieChart width={400} height={350}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value}`, name]}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
            </PieChart>
          </div>
        )

      case 'composed':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="2 4" strokeOpacity={0.3} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend />
            <Bar dataKey="effectif" fill={chartConfig.effectif.color} name={chartConfig.effectif.label} />
            <Line
              dataKey="embauches"
              stroke={chartConfig.embauches.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              name={chartConfig.embauches.label}
            />
            <Line
              dataKey="departs"
              stroke={chartConfig.departs.color}
              strokeWidth={3}
              dot={{ r: 4 }}
              name={chartConfig.departs.label}
            />
          </ComposedChart>
        )

      default:
        return null
    }
  }

  const ChartPreview = ({ type, isSelected, isHovered }) => {
    const chartType = CHART_TYPES.find((c) => c.id === type)
    if (!chartType || !chartType.compatible) return null

    const Icon = chartType.icon

    return (
      <div
        className={`relative p-4 rounded-lg border-1 transition-all duration-200 cursor-pointer ${
          isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
            : isHovered
              ? 'border-gray-300 bg-gray-50 dark:bg-gray-800 shadow-sm'
              : 'border-gray-200 bg-white dark:bg-gray-900 hover:border-gray-300'
        }`}
        onClick={() => setSelectedChart(type)}
        onMouseEnter={() => setHoveredChart(type)}
        onMouseLeave={() => setHoveredChart(null)}
      >
        <div className="flex flex-col items-center space-x-3">
          <div
            className={`w-12 h-12 ${chartType.color} rounded-lg flex items-center justify-center shadow-sm transition-transform duration-200 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div
              className={`text-sm font-medium transition-colors ${
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {chartType.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{chartType.description}</div>
          </div>
        </div>

        {isSelected && (
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-blue-500 text-white text-xs px-2 py-1 shadow-md">Actif</Badge>
          </div>
        )}

        {isHovered && !isSelected && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg" />
        )}
      </div>
    )
  }

  return (
    <div className="w-full bg-white dark:bg-neutral-950 rounded-xl border  overflow-hidden ">
      <div className="p-6">
        <CardHeader className="px-0 pt-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{title}</CardTitle>
              <CardDescription className="text-gray-500 dark:text-gray-400">{description}</CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-sm">{CHART_TYPES.find((c) => c.id === selectedChart)?.name}</div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-gray-500">Live</span>
              </div>

              {/* Drawer pour sélectionner le type de graphique */}
              <Drawer direction={'right'}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center space-x-2">
                    <ChartArea className="h-4 w-4" />
                    <span>Changer le type</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="max-w-md ml-auto h-full ">
                  <DrawerHeader>
                    <DrawerTitle className="flex items-center">
                      <Layers className="h-5 w-5 mr-2 text-blue-500" />
                      Types de Graphiques
                    </DrawerTitle>
                    <DrawerDescription>
                      Sélectionnez une visualisation pour afficher vos données RH sous différents angles. Toutes les
                      options utilisent les variables : effectif, embauches et départs.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="flex-1 px-4 overflow-y-auto">
                    <div className="grid grid-cols-2 p-2 gap-3">
                      {CHART_TYPES.filter((chart) => chart.compatible).map((chartType) => (
                        <ChartPreview
                          key={chartType.id}
                          type={chartType.id}
                          isSelected={selectedChart === chartType.id}
                          isHovered={hoveredChart === chartType.id}
                        />
                      ))}
                    </div>
                  </div>

                  <DrawerFooter>
                    <DrawerClose asChild>
                      <Button variant="outline" className="w-full">
                        Fermer
                      </Button>
                    </DrawerClose>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart() as any}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
    </div>
  )
}

export default ChartSelector
