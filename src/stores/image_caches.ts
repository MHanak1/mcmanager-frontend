import { defineStore } from 'pinia'


export const useImageCaches = defineStore('image_caches', {
  state: () => {
    return {
      images: {} as {[key: string]: number},
    }
  },
  actions: {
    get(id: string): number {
      if (!this.images[id]){
        this.images[id] = 0
      }

      return this.images[id]
    },
    update(id: string): number{
      if (!this.images[id]){
        this.images[id] = 0
      }
      this.images[id]++

      return this.images[id]
    }
  }
})
