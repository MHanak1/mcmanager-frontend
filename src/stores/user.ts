import { defineStore } from 'pinia'
import { mande } from 'mande'
import type { Group, User, UserRecursive } from '@/lib/types.ts'

const api = mande("/api")

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      // for data that is not yet loaded
      user: {} as UserRecursive,
      // for initially empty lists
      logged_in: false,
      initialised: false,
    }
  },
  actions: {
    async refreshUserData() {
      try {
        this.user = await api.get("session/user?recursive=true");
        this.logged_in = true;
        this.initialised = true;
        console.log("Refreshed user data");
      } catch (error) {
        this.initialised = true;
        console.log("Refreshed user data");
        throw error;
      }
    },
    async refreshUserDataIfNeeded() {
      if (!this.initialised) {
        await this.refreshUserData()
      } else {
        console.info("User data already exists. No need to refresh it")
      }
    },
    async login(username: string, password: string) {
      await api.post(`session`, {username: username, password: password})
      await this.refreshUserData()
    },
    async register(username: string, password: string, token: string | null) {
      if (token == null) {
        await api.post(`session/user`, {username: username, password: password})
      } else {
        await api.post(`session/user?token=${token}`, {username: username, password: password})
      }
      await this.login(username, password)
      await this.refreshUserData()
    },
    async logout() {
      await api.delete(`session`)
      this.user = {} as UserRecursive
      this.logged_in = false
      this.initialised = false
      window.location.href = '/login'
    }
  }
})
