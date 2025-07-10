<script setup lang="ts">

import { onBeforeMount, ref } from 'vue'
import type { User } from '@/lib/types.ts'
import { mande } from 'mande'

const api = mande("/api")
const users = ref([] as User[])

onBeforeMount(async () => {
  try {
    users.value = await api.get("users")
  } catch (e) {
    throw e
  }
})

</script>

<template>
  <div class="container flex flex-col">
    <div v-for="user in users" :key="user.id">
      {{user}}
    </div>
  </div>

</template>

<style scoped>

</style>
