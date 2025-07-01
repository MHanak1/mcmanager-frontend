import { defineStore } from 'pinia'
import { mande } from 'mande'
import router from '@/router'

const api = mande("/api")

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      // for data that is not yet loaded
      user: {} as User,
      // for initially empty lists
      group: {} as Group,
      logged_in: false,
      initialised: false,
    }
  },
  actions: {
    async refreshUserData() {
      try {
        this.user = await api.get("user");
        this.group = await api.get(`groups/${this.user?.group_id}`);
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
      await api.post(`login`, {username: username, password: password})
      await this.refreshUserData()
    },
    async register(username: string, password: string, token: string | null) {
      if (token == null) {
        await api.post(`register`, {username: username, password: password})
      } else {
        await api.post(`register?token=${token}`, {username: username, password: password})
      }
      await this.login(username, password)
      await this.refreshUserData()
    },
    async logout() {
      await api.post(`logout`)
      this.user = {} as User
      this.group = {} as Group
      this.logged_in = false
      this.initialised = false
      window.location.href = '/login'
    }
  }
})

type Id = string;
type Token = string;


interface User {
  id: Id;
  username: string;
  avatar_id: Id | null;
  group_id: Id;
  enabled: boolean;
}

interface Group {
  id: Id,
  name: string;
  total_memory_limit: number | null;
  per_world_memory_limit: number | null;
  world_limit: number | null;
  active_world_limit: number | null;
  storage_limit: number | null;
  config_blacklist: string[];
  config_whitelist: string[];
  config_limits: {[key: string]: string | null};
  is_privileged: boolean;
}
