import { defineStore } from 'pinia'
import { io } from "socket.io-client";
import api from '@/lib/api.ts'
import { ref } from 'vue'
import type { WorldStatus } from '@/lib/types.ts'

export const useConsole = defineStore('console', {
  state: () => {

    return {
      initialised: false,
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

      const ticket = ((await api.post("/console/ticket")) as any);

      console.log(ticket);

      console.log("CHANGEME")
      this.socket = io(`ws://${window.location.host}/ws/console`, {
        auth: ticket
      })

      this.socket.onAny((eventName: any, ...args: any) => {
        console.debug(eventName, args);
      });

      this.socket.on("connect", () => {
        if (this.id != null) {
          this.attach(this.id)
        }
      })

      this.socket.on("status", (status: any) => {
        if (status.connectd) {
          this.id = status.connected.id
        } else if (status.disconnected) {
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
      this.clear();

      const initial_log: string = (await api.get(`/worlds/${id}/log`) as any).log
      console.log(initial_log)
      console.log(typeof initial_log)
      let lines: string[] = initial_log.split("\n")
      console.log(lines)
      for (const line of lines) {
        this.logs[this.seq_offset] = line
        this.seq_offset++
      }

      this.socket.emit("subscribe", { id })
    },

    async detach() {
      this.socket.emit("unsubscribe")
    }
  }
})
