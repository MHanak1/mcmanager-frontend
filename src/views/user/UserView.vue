<script setup lang="ts">

import { useUserStore } from '@/stores/user.ts'
import ImageUpload from '@/components/ImageUpload.vue'
import Header from '@/components/Header.vue'

let userStore = useUserStore()
let user = userStore.user

</script>

<template>
  <Header/>
  <div class="flex">
  <ImageUpload :icon_src="`/api/users/${user.id}/icon`" :icon_id="user.id" hover_text="Click to select an avatar">
    <template #error>
      <img src="@/assets/user_default.png"/>
    </template>
  </ImageUpload>
  {{user}}
  </div>
</template>

<style scoped>

</style>
