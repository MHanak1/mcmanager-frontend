<script setup lang="ts">

import FileUpload from '@/components/FileUpload.vue'
import { UseImage } from '@vueuse/components'
import { ref } from 'vue'
import { useImageCaches } from '@/stores/image_caches.ts'
import { toast } from 'vue-sonner'

let image_caches = useImageCaches()

defineProps<{
  icon_id: string
  icon_src: string,
  hover_text?: string
}>();

function handleError(error: any) {
  if (error?.response?.status === 400) {
    toast.error("Could not upload file", {
      description: "this image is too large",
    })
  } else {
    toast.error("Could not upload file", {
      description: error.message,
    })
  }
}

</script>

<template>
  <FileUpload :url="icon_src" file_name="file" v-on:uploaded="image_caches.update(icon_id)" :hover_text="hover_text ?? 'Click to select an icon'" v-on:error="handleError" >
    <UseImage :src="icon_src + '?rnd=' + image_caches.get(icon_id)" class="rounded-md w-full aspect-square">
      <template #error>
        <slot name="error"></slot>
      </template>
    </UseImage>
  </FileUpload>
</template>

<style scoped>

</style>
