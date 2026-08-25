import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/ospitalità',
      alias: ['/ospitalita'],
      name: 'ospitalita',
      component: () => import('@/components/widget/ospitalità/mappa.vue')
    },
    {
      path: '/addGuest',
      name: 'addGuest',
      component: () => import('@/components/widget/ospiti/addOspiti.vue')
    },
    {
      path: '/addVolontari',
      name: 'addVolontari',
      component: () => import('@/components/widget/volontari/addVolontari.vue')
    },
    {
      path: '/economia/budget',
      name: 'budget',
      component: () => import('@/components/widget/finanze/budget.vue')
    }
  ]
})

export default router