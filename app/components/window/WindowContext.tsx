import { createContext, useContext, useEffect, useState } from 'react'
import { Titlebar, TitlebarProps } from './Titlebar'
import { TitlebarContextProvider } from './TitlebarContext'
import type { ChannelReturn } from '@/lib/conveyor/schemas'
import { useConveyor } from '@/app/hooks/use-conveyor'
import appConfig from '@/app/constants/App'
import { Sidebar } from './app-sidebar'
import { SidebarProvider, SidebarTrigger } from '../ui/sidebar'
import UpdateToast from '../update'

type WindowInitProps = ChannelReturn<'window-init'>

interface WindowContextProps {
  titlebar: TitlebarProps
  readonly window: WindowInitProps | undefined
}

const WindowContext = createContext<WindowContextProps | undefined>(undefined)

export const WindowContextProvider = ({
  children,
  titlebar = {
    title: appConfig.appName,
    icon: 'appIcon.png',
    titleCentered: false,
    menuItems: [],
  },
}: {
  children: React.ReactNode
  titlebar?: TitlebarProps
}) => {
  const [initProps, setInitProps] = useState<WindowInitProps>()
  const { windowInit } = useConveyor('window')
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    windowInit().then(setInitProps)

    // Add class to parent element
    const parent = document.querySelector('.window-content')?.parentElement
    parent?.classList.add('window-frame')
  }, [windowInit])

  return (
    <WindowContext.Provider value={{ titlebar, window: initProps }}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '15rem',
            '--sidebar-width-mobile': '10rem',
            '--sidebar-width-icon': '40px',
          } as React.CSSProperties
        }
        className={'bg-transparent'}
      >
        <div className="window-frame flex transition-all duration-300">
          <Sidebar />
          <main className="flex-1 overflow-y-auto overflow-x-hidden relative max-h-[100vh] transition-all duration-300 ">
            <SidebarTrigger className="fixed top-12 z-50 cursor-pointer" onClick={() => setShowSidebar(!showSidebar)} />
            <TitlebarContextProvider>
              <Titlebar sideBarShow={showSidebar} />
            </TitlebarContextProvider>
            {children}

            <UpdateToast />
          </main>
        </div>
      </SidebarProvider>
    </WindowContext.Provider>
  )
}

export const useWindowContext = () => {
  const context = useContext(WindowContext)
  if (!context) {
    throw new Error('useWindowContext must be used within a WindowContextProvider')
  }
  return context
}
