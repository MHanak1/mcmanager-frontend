import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WorldsView from '@/views/WorldsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainView,
      children: [
        {
          path: '',
          component: WorldsView,
        }
      ]
    },
    {
      path: '/login',
      component: LoginView,
    },
    {
      path: '/register',
      component: RegisterView,
    },
  ],
})

export default router
