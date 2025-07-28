<script setup lang="ts">

import { useUserStore } from '@/stores/user.ts'
import ImageUpload from '@/components/ImageUpload.vue'
import Header from '@/components/Header.vue'

const userStore = useUserStore()
const user = userStore.user

</script>

<template>
  <Header/>
  <div class="flex">
  <ImageUpload :icon_src="`/api/users/${user.id}/icon`" :icon_id="user.id" hover_text="Click to select an avatar" />
  {{user}}
  </div>
</template>

<style scoped>

</style>
