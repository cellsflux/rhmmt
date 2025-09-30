import React from 'react'
import ReactDOM from 'react-dom/client'
import appIcon from '@/resources/build/icon.png'
import { WindowContextProvider, menuItems } from '@/app/components/window'
import { ErrorBoundary } from './components/ErrorBoundary'
import App from './app'
import appConfig from './constants/App'
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <ErrorBoundary>
        <WindowContextProvider titlebar={{ title: appConfig.appName, icon: appIcon, menuItems }}>
          <App />
        </WindowContextProvider>
      </ErrorBoundary>
    </HashRouter>
  </React.StrictMode>
)
