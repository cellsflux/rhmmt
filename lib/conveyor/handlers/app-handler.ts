import { type App, BrowserWindow } from 'electron'
import { handle } from '@/lib/main/shared'
import { registerAgentHandlers } from './agent-handlers'
import { registerDepartementHandlers } from './departement-handler'
import { registerDomaineHandlers } from './domaine-handler'
import { registerUserHandlers } from './user.handlers'
import { registerUpdateHandlers } from './update-handlers'

/**
 * @description register app handlers
 * @author Jison Nongolola
 * @date 20/09/2025
 * @param {App} app
 * @param {BrowserWindow} mainWindow - La fenêtre principale nécessaire pour les handlers de mise à jour
 */
export const registerAppHandlers = (app: App, mainWindow: BrowserWindow) => {
  handle('version', () => app.getVersion())
  registerUserHandlers()
  registerAgentHandlers()

  // Update - nécessite à la fois l'app et la fenêtre principale
  registerUpdateHandlers(app, mainWindow)

  // Departement
  registerDepartementHandlers()

  // Domaine
  registerDomaineHandlers()
}
