import { defineStore } from 'pinia'
import { io } from "socket.io-client";
import api from '@/lib/api.ts'
import { ref } from 'vue'
import type { WorldStatus } from '@/lib/types.ts'

export const useConsole = defineStore('console', {
  state: () => {

    return {
      initialised: false,
      failed: false,
      id: null as string | null,
      socket: null as any,
      logs: [] as string[],
      seq_offset: 0,
      world_status: null as WorldStatus | null
    }
  },
  actions: {
    async init() {
      if (this.initialised) {
        return
      }
      try {

        const ticket = ((await api.post("/console/ticket")) as any);

        const secure = location.protocol == 'https:'

        this.socket = io(`${secure ? 'wss' : 'ws'}://${window.location.host}/ws/console`, {
          auth: ticket
        })

        this.socket.onAny((eventName: any, ...args: any) => {
          console.debug(eventName, args);
        });
      } catch {
        this.failed = true
      }

      this.socket.on("connect", () => {
        if (this.id != null) {
          this.reconnect(this.id)
        }
      })

      this.socket.on("disconnect", () => {
        this.failed = true
      })

      this.socket.on("status", (status: any) => {
        if (status.connected) {
          this.failed = false
          console.info("console connected")
          this.id = status.connected
        } else if (status == 'disconnected') {
          console.info("console disconnected")
          this.id = null
        }
      })

      this.socket.on("console", (mcconsole: any) =>  {
        if (mcconsole.log) {
          if (mcconsole.log.seq == 0) {
            this.clear()
          }
          this.logs[mcconsole.log.seq + this.seq_offset] = mcconsole.log.message
        } else if (mcconsole.status) {
          this.world_status = mcconsole.status
        }
      })

      this.socket.on("error", (error: string) => {
        this.failed=true
        if (error == 'invalid_ticket') {
          this.initialised = false
          this.init()
          this.reconnect(this.id as string)
        }
      })

      this.initialised = true;
    },

    clear() {
      this.seq_offset = 0
      this.logs = []
    },

    attached(): boolean {
      return this.id != null
    },

    async write_console(command: string) {
      this.socket.emit("command", { command })
      this.seq_offset++
      this.logs.push(command)
    },

    async attach(id: string) {
      //already attached
      if (this.id == id) {return}
      this.clear();

      this.world_status = await api.get(`/worlds/${id}/status`) as WorldStatus
      const initial_log: string = (await api.get(`/worlds/${id}/log`) as any).log
      const lines: string[] = initial_log.split("\n")
      for (const line of lines) {
        this.logs[this.seq_offset] = line
        this.seq_offset++
      }

      console.debug("emit subscribe")
      this.socket.emit("subscribe", { id })
    },

    async reconnect(id: string) {
      this.id = null
      this.attach(id)
    },

    async detach() {
      if (this.socket) {
        this.socket.emit("unsubscribe")
      }
    }
  }
})
