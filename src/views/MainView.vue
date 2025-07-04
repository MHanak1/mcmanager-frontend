<script setup lang="ts">

import { useServerDataStore } from '@/stores/server.ts'
import { useUserStore } from '@/stores/user.ts'
import Header from '@/components/Header.vue'
const server_data = useServerDataStore()
const user_data = useUserStore()

</script>

<template>
  <main>
    <Header/>

    <router-view/>

  </main>
</template>
