// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/layouts/default/Default.vue'),
    children: [
      {
        path: '/',
        name: 'Home',
        // route level code-splitting. This generates a separate chunk (about.[hash].js) for this route which is lazy-loaded when the route is visited.
        component: () => import(/* webpackChunkName: "home" */ '@/views/TheHome.vue'),
      }, {
        path: '/charges',
        name: 'Charges',
        component: () => import(/* webpackChunkName: "charges" */ '@/views/ChargesList.vue'),
      }, {
        path: '/charge/:charge_id',
        name: 'Charge',
        component: () => import(/* webpackChunkName: "charge" */ '@/views/ChargeDetails.vue'),
      }, {
        path: '/entry/:entry_id',
        name: 'Entry',
        component: () => import(/* webpackChunkName: "charge" */ '@/views/EntryDetails.vue'),
      },{
        path: '/teams',
        name: 'Teams',
        component: () => import(/* webpackChunkName: "charges" */ '@/views/TeamsList.vue'),
      }, {
        path: '/cars',
        name: 'Cars',
        component: () => import(/* webpackChunkName: "charges" */ '@/views/CarsList.vue'),
      }, {
        path: '/sponsors',
        name: 'Sponsors',
        component: () => import(/* webpackChunkName: "charges" */ '@/views/SponsorsList.vue'),
      },  
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

export default router
