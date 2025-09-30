import { type App } from 'electron'
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
 */
export const registerAppHandlers = (app: App) => {
  handle('version', () => app.getVersion())
  registerUserHandlers()
  registerAgentHandlers()

  // Update
  registerUpdateHandlers()

  // Departement
  registerDepartementHandlers()

  // Domaine
  registerDomaineHandlers()
}
