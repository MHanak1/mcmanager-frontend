import { defineStore } from 'pinia'
import { mande } from 'mande'
import router from '@/router'
import type {ServerInfo} from "@/lib/types.ts";

const api = mande("/api")

export const useServerDataStore = defineStore('server', {
  state: () => {
    return {
      info: {
        name: "",
        login_message: "",
        login_message_title: "",
        login_message_type: "",
        requires_invite: true,
      } as ServerInfo,
      initialised: false,
      failed: false,
    }
  },
  actions: {
    async refreshServerData() {
      this.info = await api.get("server")
      this.initialised = true
      console.log("Refreshed server data");
    },
    async refreshServerDataIfNeeded() {
      if (!this.initialised) {
        try {
          await this.refreshServerData()
        } catch (error) {
          this.initialised = true
          this.failed = true
          throw error;
        }
      } else {
        console.info("User data already exists. No need to refresh it")
      }
    }
  }
})
