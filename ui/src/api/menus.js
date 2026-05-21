import { apiFetch } from './client.js'

/**
 * @returns {Promise<{ menus: import('./types.js').ApiMenu[] }>}
 */
export function fetchMenus() {
  return apiFetch('/menus')
}
