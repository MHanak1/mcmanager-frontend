<script setup lang="ts">
import { ref } from 'vue'
import { mande } from 'mande'
import router from '@/router'
import { rand } from '@vueuse/core'
import { toast } from 'vue-sonner'

const api = mande("")

const props = defineProps<{
  url: string,
  file_name: string,
  hover_text?: string,
  class?: string
}>()

const emit = defineEmits(['uploaded', 'error'])

async function onFileChanged($event: Event) {
  try{
    const target = $event.target as HTMLInputElement;
    if (target && target.files) {
      const file = target.files[0];
      const formData = new FormData()
      formData.append(props.file_name, file)
      await api.post(props.url, formData)

      emit("uploaded")
    }
  } catch(error) {
    emit("error", error)
  }
}

</script>

<template>
  <div :class="`w-full relative ${props.class}`">
    <slot/>
    <div class="flex w-full h-full absolute left-0 top-0 justify-center items-center group">
      <input
        class="w-full h-full group-hover:bg-background/40 transition-colors text-black/0 z-50"
        type="file"
        @change="onFileChanged($event)"
        accept="image/png, image/jpeg, image/webl, image/gif"/>
      <div class="flex absolute left-[50% top-[50%] z-51">
        <p class="text-2xl transition-colors text-black/0 group-hover:text-foreground">
          {{props.hover_text ?? "click to select a file"}}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
