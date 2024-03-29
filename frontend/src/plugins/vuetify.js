/**
 * plugins/vuetify.js
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
//import { md3 } from 'vuetify/blueprints'


// Composables
import { createVuetify } from 'vuetify'

import {
  VDataTable,
  VDataTableServer,
  VDataTableVirtual
} from "vuetify/labs/VDataTable"

import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  components: {
    VDataTable,
    VDataTableServer,
    VDataTableVirtual,
    VSkeletonLoader
  },
  theme: {
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
        },
      },
    },
  },
})
