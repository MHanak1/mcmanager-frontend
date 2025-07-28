import { defineStore } from 'pinia'
import { mande } from 'mande'
import type { WorldRecursive } from '@/lib/types.ts'
import { useUserStore } from '@/stores/user.ts'

const api = mande("/api")

export interface WorldsStore {
  worlds: {[id: string]: WorldRecursive},
  initialised: boolean,
  refreshAllWorlds(): void,
  refreshWorld(id: string): void,
  worldCount(): number,
}

export const useUserWorldsStore = defineStore('user_worlds', {
  state: () => {
    return {
      worlds: {} as {[id: string]: WorldRecursive},
      initialised: false,
    }
  },
  actions: {
    async refreshAllWorlds() {
      const user = useUserStore().user
      const all_worlds = useAllWorldsStore()

      const worlds = await api.get(`worlds?owner_id=${user.id}&recursive=true`) as WorldRecursive[]
      this.worlds = {}
      for (const world of worlds) {
        this.worlds[world.id] = world;
        all_worlds.worlds[world.id] = world;
      }
      this.initialised = true
      console.log("Refreshed user worlds");
    },
    async refreshWorld(id: string) {
      const all_worlds = useAllWorldsStore()
      const world = await api.get(`worlds/${id}?recursive=true`) as WorldRecursive
      this.worlds[world.id] = world;
      all_worlds.worlds[world.id] = world;
    },
    worldCount() {
      let count = 0
      for (const world in this.worlds) {
        count += 1
      }
      return count
    }
  }
})
export const useAllWorldsStore = defineStore('all_worlds', {
  state: () => {
    return {
      worlds: {} as {[id: string]: WorldRecursive},
      initialised: false,
    }
  },
  actions: {
    async refreshAllWorlds() {
      const worlds = await api.get(`worlds?recursive=true`) as WorldRecursive[]
      this.worlds = {}
      for (const world of worlds) {
        this.worlds[world.id] = world;
      }
      this.initialised = true
      console.log("Refreshed user worlds");
    },
    async refreshWorld(id: string) {
      const world = await api.get(`worlds/${id}?recursive=true`) as WorldRecursive
      this.worlds[world.id] = world;
    },
    worldCount() {
      let count = 0
      for (const world in this.worlds) {
        count += 1
      }
      return count
    }
  }
})
