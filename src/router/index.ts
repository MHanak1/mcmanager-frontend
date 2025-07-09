import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WorldsView from '@/views/WorldsView.vue'
import WorldView from "@/views/world/WorldView.vue";

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
          meta: { title: "Home" }
        },
        {
          path: '/worlds/:id',
          component: WorldView,
        }
      ]
    },
    {
      path: '/login',
      component: LoginView,
      meta: { title: "Login" }
    },
    {
      path: '/register',
      component: RegisterView,
      meta: { title: "Register" }
    },
  ],
})

export default router
