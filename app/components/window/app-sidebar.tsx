import * as React from 'react'
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/app/components/ui/sidebar'
import {
  Chrome,
  Cog,
  Database,
  Files,
  Users,
  ChevronDown,
  List,
  UserPlus,
  Clock,
  UserMinus,
  Wallet,
  ListTree,
  PlusSquare,
  PlusCircle,
  Calculator,
  User,
  Code,
  Home,
} from 'lucide-react'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/app/components/ui/collapsible'
import { useNavigate } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'
import { DarkModeToggle } from '../welcome/WelcomeKit'
import { Domaine } from '@/lib/database/models/recutement/domaine'
import { useConveyor } from '@/app/hooks/use-conveyor'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const route = useNavigate()
  const { getDomaines } = useConveyor('app')
  const [specifications, setSpecifications] = React.useState<Domaine[]>([])
  const [openMenus, setOpenMenus] = React.useState<Set<string>>(new Set())

  const load = async () => {
    const specification = await getDomaines()
    setSpecifications(specification)
  }

  React.useEffect(() => {
    load()
  }, [])

  const toggleMenu = (menuName: string) => {
    setOpenMenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(menuName)) {
        newSet.delete(menuName)
      } else {
        newSet.add(menuName)
      }
      return newSet
    })
  }

  const menus = [
    {
      name: 'Accueil',
      icone: Home,
      onClick: () => route('/'),
    },
    {
      name: 'Agents',
      icone: Users,
      children: [
        {
          name: 'Liste des agents',
          icone: List,
          onClick: () => route('/agents'),
        },
        {
          name: 'Ajouter un agent',
          icone: UserPlus,
          onClick: () => route('/agents?OpnerForm=1'),
        },
        {
          name: 'Nouvelle démissions',
          icone: UserMinus,
          onClick: () => route('/agents?demission=1'),
        },
        {
          name: 'Congés et circonstances',
          icone: Clock,
          onClick: () => route('/developpementModule'),
        },

        {
          name: 'Paie & contrats',
          icone: Wallet,
          onClick: () => route('/developpementModule'),
        },
      ],
    },
    {
      name: 'Départements',
      icone: Database,
      children: [
        {
          name: 'Liste des départements',
          icone: ListTree,
          onClick: () => route('/departements'),
        },
        {
          name: 'Ajouter un département',
          icone: PlusSquare,
          onClick: () => route('/departements?add_mdala_open=1'),
        },
      ],
    },
    {
      name: 'Spécialités',
      icone: Files,
      children: [
        {
          name: 'Liste des spécialités',
          icone: List,
          onClick: () => route('/specialite'),
        },
        {
          name: 'Ajouter une spécialité',
          icone: PlusCircle,
          onClick: () => route('/specialite?add_mdala_open=1'),
        },
        {
          name: 'Catégories',
          children: specifications.map((item: Domaine) => ({
            name: item.name,
            icone: Files,
            onClick: (item) => route(`/categories/${item.id}`),
          })),
        },
      ],
    },
    {
      name: 'Utilitaires',
      icone: Calculator,
      onClick: () => route('/utilitaire'),
    },
  ]

  return (
    <ShadcnSidebar className="border-0 bg-background/95  backdrop-blur-sm">
      {/* Contenu principal */}
      <SidebarContent className="pt-12 px-0">
        <SidebarGroup>
          <SidebarGroupContent className="px-0">
            <SidebarMenu>
              {menus.map((item, i) => {
                const isOpen = openMenus.has(item.name)

                if (item.children) {
                  return (
                    <SidebarMenuItem className="" key={i}>
                      <Collapsible open={isOpen} onOpenChange={() => toggleMenu(item.name)}>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="group cursor-pointer w-full rounded-lg px-3 py-3 mb-1 transition-all duration-300 flex items-center justify-between hover:bg-accent/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-accent/50 border">
                                <item.icone className="size-4 transition-transform group-hover:scale-110" />
                              </div>
                              <span className="font-semibold">{item.name}</span>
                            </div>
                            <ChevronDown
                              className={cn('size-4 transition-transform duration-300', isOpen ? 'rotate-180' : '')}
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="ml-2 mt-1 space-y-1 border-l border-border/30 pl-3">
                          {item.children.map((child, j) => {
                            if (child.children) {
                              const isChildOpen = openMenus.has(child.name)
                              return (
                                <Collapsible key={j} open={isChildOpen} onOpenChange={() => toggleMenu(child.name)}>
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuButton className="group cursor-pointer w-full rounded-lg px-3 py-2.5 text-sm mb-1 transition-all duration-300 flex justify-between items-center hover:bg-accent/50">
                                      <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md">
                                          {child.icone && (
                                            <child.icone className="size-3.5 transition-transform group-hover:scale-110" />
                                          )}
                                        </div>
                                        <span className="font-medium">{child.name}</span>
                                      </div>
                                      <ChevronDown
                                        className={cn(
                                          'size-3 transition-transform duration-300',
                                          isChildOpen ? 'rotate-180' : ''
                                        )}
                                      />
                                    </SidebarMenuButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="ml-2 mt-1 space-y-1 border-l border-border/20 pl-3">
                                    {child.children.map((sub, k) => (
                                      <SidebarMenuButton
                                        key={k}
                                        className="w-full rounded-lg px-3 py-2 text-sm mb-0.5 transition-all duration-300 flex items-center gap-3 hover:bg-accent/50 hover:translate-x-1"
                                        onClick={sub.onClick}
                                      >
                                        <div className="p-1 rounded-md">
                                          {sub.icone && <sub.icone className="size-3" />}
                                        </div>
                                        <span className="font-normal">{sub.name}</span>
                                      </SidebarMenuButton>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              )
                            }

                            return (
                              <SidebarMenuButton
                                key={j}
                                className="w-full rounded-lg cursor-pointer px-3 py-2.5 text-sm mb-1 transition-all duration-300 flex items-center gap-3 hover:bg-accent/50 hover:translate-x-1"
                                onClick={child.onClick}
                              >
                                <div className="p-1.5 rounded-md">
                                  {child.icone && <child.icone className="size-3.5" />}
                                </div>
                                <span className="font-medium">{child.name}</span>
                              </SidebarMenuButton>
                            )
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    </SidebarMenuItem>
                  )
                }

                return (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton
                      className="group cursor-pointer w-full rounded-lg px-3 py-3 mb-1 transition-all duration-300 flex items-center gap-3 hover:bg-accent/50 hover:translate-x-1"
                      onClick={item.onClick}
                    >
                      <div className="p-2 rounded-lg bg-accent/50 border">
                        <item.icone className="size-4 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="font-semibold">{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4  border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="group   w-full rounded-xl px-4 py-3 transition-all duration-300 flex items-center gap-3 bg-accent/20 cursor-pointer  hover:scale-[1.02]">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-accent/50 border">
                      <Cog className="size-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-sm">Paramètres</p>
                    </div>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-64 rounded-xl shadow-xl border" align="end">
                <DropdownMenuItem
                  onClick={() => route('/profile')}
                  className="rounded-lg cursor-pointer py-3 px-4 my-1 transition-all duration-200"
                >
                  <User className="mr-3 size-4" />
                  <span>Profil Utilisateur</span>
                </DropdownMenuItem>

                <DropdownMenuItem className="rounded-lg hover:bg-transparent py-3 px-4 my-1 focus:bg-transparent">
                  <div className="flex items-center justify-between w-full">
                    <DarkModeToggle />
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem
                  onClick={() => route('/welcome')}
                  className="rounded-lg py-3 cursor-pointer px-4 my-1 transition-all duration-200"
                >
                  <Code className="mr-3 size-4" />
                  <span>Guide Développement</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  )
}
