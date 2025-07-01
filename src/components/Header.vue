<script setup lang="ts">
import { useServerDataStore } from '@/stores/server.ts'
import { useUserStore } from '@/stores/user.ts'

const server_data = useServerDataStore()
const user_data = useUserStore()

</script>

<template>
  <header class="bg-back/20 flex flex-row gap-2 p-4 text-xl align-middle justify-between shadow-lg">
    <div class="flex items-center justify-start gap-4 font-bold">
      <!--<img alt="App logo" class="h-8" src="../assets/icon.png"/>-->
      <div class="text-2xl">
        {{server_data.info.name}}
      </div>

    </div>
    <div class="flex items-center justify-end">
      <button class="input" @click="user_data.logout()">
        Log Out
      </button>
    </div>

  </header>
</template>

<style scoped>

</style>
