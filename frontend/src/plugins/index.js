/**
 * plugins/index.js
 *
 * Automatically included in `./src/main.js`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import axiosPlugin from './axiosplugin'

export function registerPlugins (app, config) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(axiosPlugin, config)
}
