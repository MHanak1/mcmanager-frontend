<script setup lang="ts">

import { useServerDataStore } from '@/stores/server.ts'
import { useUserStore } from '@/stores/user.ts'
import Header from '@/components/Header.vue'
import { Toaster } from '@/components/ui/sonner'
import 'vue-sonner/style.css' // vue-sonner v2 requires this import

</script>

<template>
  <main class="min-h-screen flex flex-col">
    <Toaster/>
    <Header/>
    <router-view/>
  </main>
</template>
