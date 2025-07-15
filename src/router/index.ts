import { createRouter, createWebHistory } from 'vue-router'
import MainView from '../views/MainView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import WorldsView from '@/views/WorldsView.vue'
import WorldView from "@/views/world/WorldView.vue";
import AdminView from '@/views/admin/AdminView.vue'
import AdminUsersView from '@/views/admin/AdminUsersView.vue'
import UserView from '@/views/user/UserView.vue'

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
        },
      ]
    },
    {
      path: '/admin',
      component: AdminView,
      children: [
        {
          path: '',
          component: AdminUsersView,
          meta: { title: "Users" }
        },
        {
          path: 'users',
          component: AdminUsersView,
          meta: { title: "Users" }
        },
        {
          path: 'worlds',
          component: WorldsView,
          meta: { title: "Worlds" }
        },
      ]
    },
    {
      path: '/profile',
      component: UserView,
      meta: { title: "Profile" }
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
